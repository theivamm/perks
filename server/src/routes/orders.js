import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { notifyAdmins, notifyUser } from '../notify.js';

const router = Router();

const DONE_STATUS = ['completado', 'entregado'];

function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function shortId(id = '') {
  return String(id).slice(0, 8);
}

function mapOrder(row) {
  if (!row) return null;
  const { clients, order_items, ...rest } = row;
  return { ...rest, client: clients || null, items: order_items || [] };
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

router.put(
  '/:id/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    const id = req.params.id;

    const { data: before } = await supabase
      .from('orders')
      .select('status, user_id')
      .eq('id', id)
      .maybeSingle();
    if (!before) return res.status(404).json({ error: 'Pedido no encontrado' });

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*, clients(*), order_items(*)')
      .single();
    if (error) throw error;

    try {
      if (before.status !== status) await notifyOrderStatus(data, status);
    } catch (err) {
      console.warn('[Notificaciones] No se pudieron crear:', err.message);
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

// Notificaciones según la transición de estado del pedido
async function notifyOrderStatus(order, status) {
  const userId = order.user_id;
  const clientName = (order.clients && (order.clients.name || '')) || '';

  if (status === 'en camino') {
    if (userId) {
      await notifyUser(userId, {
        type: 'order_shipped',
        title: '¡Tu pedido está en camino!',
        body: 'Tu pedido salió en camino. ¡Ya falta poco para que lo tengas!',
        icon: 'truck',
        link: '/perfil',
        data: { order_id: order.id },
      });
    }
    await notifyAdmins({
      type: 'order_dispatched',
      title: 'Pedido en camino',
      body: `El pedido #${shortId(order.id)} de ${clientName || 'cliente'} salió en camino (${formatMoney(order.total)}).`,
      icon: 'truck',
      link: '/dashboard/pedidos',
      data: { order_id: order.id },
    });
  }

  if (DONE_STATUS.includes(status)) {
    if (userId) {
      await notifyUser(userId, {
        type: 'order_completed',
        title: '¡Tu compra se completó!',
        body: `Tu pedido de ${formatMoney(order.total)} fue completado. ¡Gracias por tu compra!`,
        icon: 'check-circle',
        link: '/perfil',
        data: { order_id: order.id },
      });
    }
  }

  if (status === 'cancelado') {
    if (userId) {
      await notifyUser(userId, {
        type: 'order_cancelled',
        title: 'Tu pedido fue cancelado',
        body: 'El pedido fue cancelado. Si creés que es un error, contactanos.',
        icon: 'x-circle',
        link: '/perfil',
        data: { order_id: order.id },
      });
    }
  }
}

export default router;