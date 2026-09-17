import 'dotenv/config';
import { supabase } from './supabase.js';

export const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG || 'shanti-chi';

let cached = null;
const bySlug = new Map();
const TTL = 30 * 1000;

export async function getDefaultTenant() {
  if (cached) return cached;
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', DEFAULT_TENANT_SLUG)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(
      `[TENANCY] Tenant por defecto "${DEFAULT_TENANT_SLUG}" no encontrado. ` +
        'Ejecutá migracion_08_tenancy.sql en el SQL Editor de Supabase.'
    );
  }
  cached = data;
  return data;
}

// Resuelve el tenant a partir del slug del header `x-tenant-slug`.
// Si no llega slug, devuelve el tenant por defecto (compatibilidad).
export async function resolveTenant(slug) {
  const s = String(slug || '').trim().toLowerCase();
  if (!s || s === DEFAULT_TENANT_SLUG) return getDefaultTenant();
  const hit = bySlug.get(s);
  if (hit && hit.exp > Date.now()) return hit.tenant;
  const { data, error } = await supabase.from('tenants').select('*').eq('slug', s).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  bySlug.set(s, { tenant: data, exp: Date.now() + TTL });
  return data;
}

export function resetTenancyCache() {
  cached = null;
  bySlug.clear();
}