import { supabase } from './supabase.js';
import { addActiveCouponPoint, redeemReadyCoupon } from './rewards.js';

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

// Notifica al cliente después de que el admin sume un punto en el local.
export async function notifyPointAdded(userId, result) {
  if (!userId) return;

  if (result.status === 'no_active') {
    await notifyUser(userId, {
      type: 'reward_progress',
      title: 'Activá un cupón para sumar puntos',
      body: 'El local quiso sumarte un punto, pero no tenés ningún cupón activo. Activá uno desde la página principal.',
      icon: 'gift',
      link: '/perfil',
    });
    return;
  }

  const c = result.coupon;
  if (result.status === 'completed') {
    await notifyUser(userId, {
      type: 'coupon_won',
      title: '¡Completaste un cupón!',
      body: `Completaste "${c.title}" (${c.points}/${c.target_points} puntos). Tu código es ${c.code}. Mostralo en el local para canjearlo.`,
      icon: 'gift',
      link: '/perfil',
      data: { user_coupon_id: c.id, code: c.code },
    });
    await notifyAdmins({
      type: 'milestone_reached',
      title: 'Un cliente completó un cupón',
      body: `"${c.title}" (${c.target_points} puntos) completado. Tiene un código listo para canjear.`,
      icon: 'gift',
      link: '/dashboard/cupones',
      data: { user_id: userId, user_coupon_id: c.id, code: c.code },
    });
    return;
  }

  await notifyUser(userId, {
    type: 'reward_progress',
    title: '¡Sumaste 1 punto!',
    body: `"${c.title}" va ${c.points}/${c.target_points} puntos. Seguí sumando para completar tu cupón.`,
    icon: 'sparkles',
    link: '/perfil',
    data: { user_coupon_id: c.id, points: c.points },
  });
}

// Mantiene la firma usada por el flujo de compras: suma un punto si hay cupón activo.
export async function notifyRewardsForCompra(userId) {
  if (!userId) return;
  const result = await addActiveCouponPoint(userId);
  return notifyPointAdded(userId, result);
}

// Canjea un cupón completado y le notifica al cliente. Devuelve el cupón
// actualizado o null si no estaba listo.
export async function redeemReadyCouponAndNotify(userCouponId) {
  const updated = await redeemReadyCoupon(userCouponId);
  if (!updated) return null;
  await notifyUser(updated.user_id, {
    type: 'coupon_used',
    title: '¡Cupón canjeado!',
    body: `Tu cupón "${updated.title || 'premio'}" (${updated.code}) fue canjeado en el local. Ya podés activar otro cupón.`,
    icon: 'badge-check',
    link: '/perfil',
    data: { user_coupon_id: updated.id, code: updated.code },
  });
  return updated;
}