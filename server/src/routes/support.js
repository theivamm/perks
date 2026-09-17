import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

function isMissingTable(error) {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

// Mensajes del negocio + marca como leídos los que mandó PERKS
router.get(
  '/messages',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('tenant_id', req.tenant.id)
      .order('created_at', { ascending: true })
      .limit(300);
    if (error) {
      if (isMissingTable(error)) return res.json({ messages: [], unread: 0 });
      throw error;
    }

    const messages = data || [];
    const unread = messages.filter((m) => m.sender_role === 'superadmin' && !m.read_by_admin).length;
    if (unread > 0) {
      await supabase
        .from('support_messages')
        .update({ read_by_admin: true })
        .eq('tenant_id', req.tenant.id)
        .eq('sender_role', 'superadmin')
        .eq('read_by_admin', false);
    }

    res.json({ messages, unread });
  })
);

// El admin le escribe al equipo de PERKS
router.post(
  '/messages',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = String(req.body?.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Escribí un mensaje' });
    if (body.length > 2000) return res.status(400).json({ error: 'El mensaje es demasiado largo' });

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        tenant_id: req.tenant.id,
        sender_role: 'admin',
        sender_id: req.user.id,
        sender_name: req.user.name || 'Administrador',
        body,
      })
      .select()
      .single();
    if (error) {
      if (isMissingTable(error)) {
        return res.status(503).json({ error: 'El soporte todavía no está disponible. Corré migracion_11_soporte.sql.' });
      }
      throw error;
    }
    res.status(201).json({ message: data });
  })
);

export default router;
