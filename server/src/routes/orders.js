import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAdmin, requireAuth, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { applyRewardRules } from '../rewards.js';

const router = Router();

const DONE_STATUS = ['completado', 'entregado'];

function mapOrder(row) {
  if (!row) return null;
  const { clients, order_items, ...rest } = row;
  return { ...rest, client: clients || null, items: order_items || [] };
}

function sumItems(items) {
  return items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
}

async function findOrCreateClient({ name, phone = '', email = '' }) {
  let cli = null;
  if (email) {
    const { data } = await supabase.from('clients').select('*').eq('email', email).maybeSingle();
    cli = data;
  }
  if (!cli) {
    const { data, error } = await supabase.from('clients').insert({ name, phone, email }).select().single();
    if (error) throw error;
    cli = data;
  }
  return cli;
}

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, clients(*), order_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(mapOrder));
  })
);

// Historial del usuario logueado
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, clients(*), order_items(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(mapOrder));
  })
);

router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { client, items, couponCode } = req.body || {};
    if (!client?.name) return res.status(400).json({ error: 'Datos del cliente requeridos' });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El pedido está vacío' });
    }

    const userId = req.user?.id || null;

    // --- Cupón (solo usuarios logueados y modo web/ambos) ---
    let couponRow = null;
    if (couponCode && userId) {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', String(couponCode).trim().toUpperCase())
        .eq('user_id', userId)
        .eq('status', 'activo')
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(400).json({ error: 'Cupón inválido o ya fue usado' });
      if (data.mode === 'local') {
        return res.status(400).json({ error: 'Este cupón se canjea en el local, no por la web' });
      }
      couponRow = data;
    }

    const cli = await findOrCreateClient({
      name: String(client.name).trim(),
      phone: String(client.phone || '').trim(),
      email: String(client.email || '').trim(),
    });

    const total = sumItems(items);
    let discount = 0;
    if (couponRow) {
      if (couponRow.type === 'descuento') {
        discount = Math.round(total * ((Number(couponRow.value) || 0) / 100) * 100) / 100;
      } else if (couponRow.type === 'monto') {
        discount = Math.min(Number(couponRow.value) || 0, total);
      } else {
        discount = Math.min(Number(couponRow.value) || 0, total);
      }
    }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        client_id: cli.id,
        user_id: userId,
        status: 'nuevo',
        total: Math.max(0, total - discount),
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const orderItems = items.map((it) => ({
      order_id: order.id,
      menu_item_id: it.menu_item_id || null,
      title: it.title || '',
      price: Number(it.price) || 0,
      qty: Number(it.qty) || 1,
    }));
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) throw itemsErr;

    if (couponRow) {
      await supabase
        .from('coupons')
        .update({ status: 'usado', used_at: new Date().toISOString(), order_id: order.id })
        .eq('id', couponRow.id);
    }

    res.status(201).json({
      ...order,
      client: cli,
      items: orderItems,
      discount: couponRow ? discount : 0,
      coupon: couponRow
        ? { code: couponRow.code, type: couponRow.type, value: couponRow.value, description: couponRow.description }
        : null,
    });
  })
);

router.put(
  '/:id/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select('*, clients(*), order_items(*)')
      .single();
    if (error) throw error;

    if (data && DONE_STATUS.includes(status)) {
      const generated = await applyRewardRules(data.user_id);
      if (generated > 0) {
        console.log(`[Premios] ${generated} cupón(es) generado(s) para el usuario ${data.user_id}.`);
      }
    }

    res.json(mapOrder(data));
  })
);

router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

export default router;