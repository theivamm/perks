import crypto from 'crypto';
import { supabase } from './supabase.js';

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

// Suma 1 punto al cupón activo del usuario. Devuelve el nuevo estado:
//   { status: 'no_active' } | { status: 'progress', coupon } | { status: 'completed', coupon }
export async function addActiveCouponPoint(userId) {
  if (!userId) return { status: 'no_active' };

  const { data: active, error } = await supabase
    .from('user_coupons')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'activado')
    .maybeSingle();
  if (error) throw error;
  if (!active) return { status: 'no_active' };

  const points = (Number(active.points) || 0) + 1;
  const target = Math.max(1, Number(active.target_points) || 1);

  if (points >= target) {
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