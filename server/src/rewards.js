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

function newCode() {
  return 'CW-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Genera cupones por hitos cumplidos de cada regla activa (no duplica).
export async function applyRewardRules(userId) {
  if (!userId) return 0;
  const n = await countCompletedOrders(userId);
  if (n === 0) return 0;

  const { data: rules, error } = await supabase
    .from('reward_rules')
    .select('*')
    .eq('active', true);
  if (error) throw error;

  const { data: existing, error: e2 } = await supabase
    .from('coupons')
    .select('rule_id, milestone')
    .eq('user_id', userId);
  if (e2) throw e2;

  const have = new Set((existing || []).map((c) => `${c.rule_id}|${c.milestone}`));
  const toInsert = [];

  for (const rule of rules || []) {
    const every = Math.max(1, Number(rule.every_orders) || 1);
    for (let milestone = every; milestone <= n; milestone += every) {
      if (have.has(`${rule.id}|${milestone}`)) continue;
      toInsert.push({
        user_id: userId,
        rule_id: rule.id,
        code: newCode(),
        type: rule.type,
        value: rule.value,
        mode: rule.mode,
        description: rule.description || rule.name,
        milestone,
      });
    }
  }

  if (toInsert.length > 0) {
    const { error: e3 } = await supabase.from('coupons').insert(toInsert);
    if (e3) throw e3;
  }
  return toInsert.length;
}