import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAdmin, requireAuth, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { applyRewardRules, countCompletedOrders, nextMilestone } from '../rewards.js';
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

    try {
      await notifyAdmins({
        type: 'new_order',
        title: 'Nuevo pedido recibido',
        body: `${String(client.name).trim()} hizo un pedido por ${formatMoney(Math.max(0, total - discount))}.`,
        icon: 'shopping-cart',
        link: '/dashboard/pedidos',
        data: { order_id: order.id },
      });

      if (userId) {
        const { count } = await supabase
          .from('coupons')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'activo');
        if ((count || 0) > 0) {
          await notifyUser(userId, {
            type: 'coupons_available',
            title: '¡Tenés cupones válidos!',
            body: `Tenés ${count} cupón(es) disponible(s) para tu próxima compra. ¡Usalos antes de que caduquen!`,
            icon: 'badge-percent',
            link: '/perfil',
            data: { order_id: order.id },
          });
        }
      }
    } catch (err) {
      console.warn('[Notificaciones] No se pudieron crear:', err.message);
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
    await notifyRewards(userId, order);
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

// Cupones ganados y progreso hacia el próximo premio
async function notifyRewards(userId, order) {
  if (!userId) return;
  const generated = await applyRewardRules(userId) || [];

  if (generated.length > 0) {
    for (const c of generated) {
      await notifyUser(userId, {
        type: 'coupon_won',
        title: '¡Ganaste un cupón!',
        body: `Alcanzaste el pedido #${c.milestone}: ${c.description || 'un premio'} (código ${c.code}).`,
        icon: 'gift',
        link: '/perfil',
        data: { coupon_id: c.id, order_id: order.id, milestone: c.milestone },
      });
    }
    await notifyAdmins({
      type: 'milestone_reached',
      title: 'Un usuario llegó a un premio',
      body: `Un cliente completó el pedido #${generated[0].milestone} y ganó ${generated.length > 1 ? `${generated.length} cupones` : 'un cupón'}.`,
      icon: 'gift',
      link: '/dashboard/clientes',
      data: { user_id: userId, order_id: order.id, milestone: generated[0].milestone },
    });
  } else {
    const { data: rules } = await supabase
      .from('reward_rules')
      .select('id, every_orders, name')
      .eq('active', true);
    const n = await countCompletedOrders(userId);
    const next = await nextMilestone(rules || [], n);
    if (next) {
      const falta = next.next - n;
      await notifyUser(userId, {
        type: 'reward_progress',
        title: '¡Seguís sumando!',
        body: `Pedido #${n} completado. Te faltan ${falta} pedido(s) para "${next.rule.name}" (pedido #${next.next}).`,
        icon: 'sparkles',
        link: '/perfil',
        data: { order_id: order.id, completed: n, next: next.next },
      });
    }
  }
}

export default router;