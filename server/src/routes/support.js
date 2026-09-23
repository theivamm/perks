import crypto from 'crypto';
import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

function isMissingTable(error) {
  return error?.code === '42P01' || error?.code === 'PGRST205' || error?.code === '42703';
}

function ticketCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `TKT-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function tenantTicket(ticketId, tenantId) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('tenant_id', tenantId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

router.get(
  '/tickets',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data: tickets = [], error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('tenant_id', req.tenant.id)
      .order('updated_at', { ascending: false });
    if (error) {
      if (isMissingTable(error)) return res.status(503).json({ error: 'El sistema de tickets todavía no está habilitado.' });
      throw error;
    }

    let messages = [];
    if (tickets.length > 0) {
      const result = await supabase
        .from('support_messages')
        .select('*')
        .in('ticket_id', tickets.map((ticket) => ticket.id))
        .order('created_at', { ascending: true });
      if (result.error) throw result.error;
      messages = result.data || [];
    }

    const enriched = tickets.map((ticket) => {
      const own = messages.filter((message) => message.ticket_id === ticket.id);
      return {
        ...ticket,
        last_message: own.at(-1) || null,
        unread: own.filter((message) => message.sender_role === 'superadmin' && !message.read_by_admin).length,
      };
    });
    res.json({ tickets: enriched });
  })
);

router.post(
  '/tickets',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const subject = String(req.body?.subject || '').trim();
    const body = String(req.body?.body || '').trim();
    const category = String(req.body?.category || 'general').trim();
    if (!subject) return res.status(400).json({ error: 'Escribí el asunto del ticket' });
    if (!body) return res.status(400).json({ error: 'Describí qué necesitás' });
    if (subject.length > 120) return res.status(400).json({ error: 'El asunto es demasiado largo' });
    if (body.length > 2000) return res.status(400).json({ error: 'La descripción es demasiado larga' });

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        tenant_id: req.tenant.id,
        code: ticketCode(),
        subject,
        category,
        status: 'nuevo',
        created_by: req.user.id,
      })
      .select()
      .single();
    if (error) {
      if (isMissingTable(error)) return res.status(503).json({ error: 'El sistema de tickets todavía no está habilitado.' });
      throw error;
    }

    const { data: message, error: messageError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        tenant_id: req.tenant.id,
        sender_role: 'admin',
        sender_id: req.user.id,
        sender_name: req.user.name || 'Administrador',
        body,
      })
      .select()
      .single();
    if (messageError) {
      await supabase.from('support_tickets').delete().eq('id', ticket.id);
      throw messageError;
    }

    res.status(201).json({ ticket: { ...ticket, last_message: message, unread: 0 }, message });
  })
);

// Cantidad de respuestas de soporte sin leer (globo del sidebar).
router.get(
  '/unread',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { count, error } = await supabase
      .from('support_messages')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', req.tenant.id)
      .eq('sender_role', 'superadmin')
      .eq('read_by_admin', false);
    if (error) {
      if (isMissingTable(error)) return res.json({ unread: 0 });
      throw error;
    }
    res.json({ unread: count || 0 });
  })
);

router.get(
  '/tickets/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const ticket = await tenantTicket(req.params.id, req.tenant.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

    const { data: messages = [], error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });
    if (error) throw error;

    await supabase
      .from('support_messages')
      .update({ read_by_admin: true })
      .eq('ticket_id', ticket.id)
      .eq('sender_role', 'superadmin')
      .eq('read_by_admin', false);

    // Las notificaciones de este ticket también quedan leídas.
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('tenant_id', req.tenant.id)
      .eq('user_id', req.user.id)
      .eq('type', 'support_reply')
      .eq('data->>ticket_id', String(ticket.id))
      .then(() => {}, () => {});

    res.json({ ticket, messages });
  })
);

router.post(
  '/tickets/:id/messages',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const ticket = await tenantTicket(req.params.id, req.tenant.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
    if (ticket.status === 'cerrado') return res.status(409).json({ error: 'Este ticket está cerrado' });

    const body = String(req.body?.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Escribí un mensaje' });
    if (body.length > 2000) return res.status(400).json({ error: 'El mensaje es demasiado largo' });

    const { data: message, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        tenant_id: req.tenant.id,
        sender_role: 'admin',
        sender_id: req.user.id,
        sender_name: req.user.name || 'Administrador',
        body,
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('support_tickets').update({ status: 'abierto', updated_at: new Date().toISOString() }).eq('id', ticket.id);
    res.status(201).json({ message });
  })
);

export default router;
