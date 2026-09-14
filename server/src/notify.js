import { supabase } from './supabase.js';
import { applyRewardRules, countCompletedOrders, nextMilestone } from './rewards.js';

// Inserta una o varias notificaciones. Cada fila: { user_id, type, title, body, icon, link, data }
export async function insertNotifications(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const clean = rows
    .filter((r) => r && r.user_id)
    .map((r) => ({
      user_id: r.user_id,
      type: r.type || 'info',
      title: String(r.title || '').slice(0, 160),
      body: String(r.body || '').slice(0, 400),
      icon: r.icon || 'bell',
      link: r.link || '',
      data: r.data || {},
    }));
  if (clean.length === 0) return 0;
  const { error } = await supabase.from('notifications').insert(clean);
  if (error) throw error;
  return clean.length;
}

export function notifyUser(userId, payload) {
  if (!userId) return Promise.resolve(0);
  return insertNotifications([{ user_id: userId, ...payload }]);
}

// Notifica a todos los usuarios con rol admin (para pedidos, hitos, etc.)
export async function notifyAdmins(payload) {
  const { data: admins, error } = await supabase.from('users').select('id').eq('role', 'admin');
  if (error) throw error;
  const rows = (admins || []).map((a) => ({ user_id: a.id, ...payload }));
  return insertNotifications(rows);
}

// Premios al registrar una compra: cupones ganados y/o progreso hacia el próximo premio.
export async function notifyRewardsForCompra(userId, compra = {}) {
  if (!userId) return;
  const generated = (await applyRewardRules(userId)) || [];
  const order = compra || {};
  const orderId = order.id || null;

  if (generated.length > 0) {
    for (const c of generated) {
      await notifyUser(userId, {
        type: 'coupon_won',
        title: '¡Ganaste un cupón!',
        body: `Alcanzaste la compra #${c.milestone}: ${c.description || 'un premio'} (código ${c.code}).`,
        icon: 'gift',
        link: '/perfil',
        data: { coupon_id: c.id, order_id: orderId, milestone: c.milestone },
      });
    }
    await notifyAdmins({
      type: 'milestone_reached',
      title: 'Un usuario llegó a un premio',
      body: `Un cliente llegó a la compra #${generated[0].milestone} y ganó ${generated.length > 1 ? `${generated.length} cupones` : 'un cupón'}.`,
      icon: 'gift',
      link: '/dashboard/clientes',
      data: { user_id: userId, order_id: orderId, milestone: generated[0].milestone },
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
        body: `Compra #${n} registrada. Te faltan ${falta} compra(s) para "${next.rule.name}" (compra #${next.next}).`,
        icon: 'sparkles',
        link: '/perfil',
        data: { order_id: orderId, completed: n, next: next.next },
      });
    }
  }
}