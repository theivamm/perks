import { supabase } from './supabase.js';

export async function getMembership(userId, tenantId) {
  if (!userId || !tenantId) return null;
  const { data, error } = await supabase
    .from('tenant_memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function ensureMembership(userId, tenantId, role = 'cliente') {
  const current = await getMembership(userId, tenantId);
  if (current) {
    if (role === 'admin' && current.role !== 'admin') {
      const { data, error } = await supabase
        .from('tenant_memberships')
        .update({ role: 'admin' })
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return current;
  }
  const { data, error } = await supabase
    .from('tenant_memberships')
    .insert({ user_id: userId, tenant_id: tenantId, role })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function membershipUserIds(tenantId, role) {
  let query = supabase.from('tenant_memberships').select('user_id').eq('tenant_id', tenantId);
  if (role) query = query.eq('role', role);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((membership) => membership.user_id);
}
