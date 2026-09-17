import 'dotenv/config';
import { supabase } from './supabase.js';

export const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG || 'shanti-chi';

let cached = null;

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

export function resetTenancyCache() {
  cached = null;
}