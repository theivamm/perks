import crypto from 'crypto';
import { supabase } from './supabase.js';
import { ensureCouponQrCode } from './qr.js';

const DONE_STATUS = ['completado', 'entregado'];

export async function countCompletedOrders(userId) {
  if (!userId) return 0;
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', DONE_STATUS);
  if (error) throw error;
  return count || 0;
}

function newCouponCode() {
  return 'CP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Suma 1 punto al cupón activo del usuario. Si llega targetId (el cupón
// escaneado por el local), suma a ESE cupón siempre que sea del usuario y
// siga activo. Devuelve el nuevo estado:
//   { status: 'no_active' } | { status: 'progress', coupon } | { status: 'completed', coupon }
export async function addActiveCouponPoint(userId, targetId) {
  if (!userId) return { status: 'no_active' };

  let query = supabase.from('user_coupons').select('*').eq('user_id', userId);
  if (targetId) query = query.eq('id', targetId);
  query = query.eq('status', 'activado');

  const { data: active, error } = await query.maybeSingle();
  if (error) throw error;
  if (!active) return { status: 'no_active' };

  const points = (Number(active.points) || 0) + 1;
  const target = Math.max(1, Number(active.target_points) || 1);

  if (points >= target) {
    const baseQr = await ensureCouponQrCode(active.id);
    const { data: coupon, error: upErr } = await supabase
      .from('user_coupons')
      .update({
        points,
        status: 'completado',
        completed_at: new Date().toISOString(),
        code: newCouponCode(),
      })
      .eq('id', active.id)
      .select()
      .single();
    if (upErr) throw upErr;
    coupon.qr_code = baseQr || coupon.qr_code;
    return { status: 'completed', coupon };
  }

  const { data: coupon, error: upErr2 } = await supabase
    .from('user_coupons')
    .update({ points })
    .eq('id', active.id)
    .select()
    .single();
  if (upErr2) throw upErr2;
  return { status: 'progress', coupon };
}

// Canjea un cupón completado: lo pasa a 'canjeado' para que no se use de nuevo.
// Devuelve el cupón actualizado o null si no está listo para canjear.
export async function redeemReadyCoupon(userCouponId) {
  if (!userCouponId) return null;

  const { data: current, error: selErr } = await supabase
    .from('user_coupons')
    .select('*')
    .eq('id', userCouponId)
    .maybeSingle();
  if (selErr) throw selErr;
  if (!current || current.status !== 'completado') return null;

  const { data: updated, error: upErr } = await supabase
    .from('user_coupons')
    .update({ status: 'canjeado', redeemed_at: new Date().toISOString() })
    .eq('id', current.id)
    .select()
    .single();
  if (upErr) throw upErr;

  return updated;
}