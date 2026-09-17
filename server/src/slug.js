import { supabase } from './supabase.js';

// Slugs que no pueden usarse como link de negocio (colisionan con rutas de PERKS).
export const RESERVED = new Set([
  'login', 'registro', 'logout', 'perfil', 'cupones', 'notificaciones',
  'configuracion', 'dashboard', 'onboarding', 'comenzar', 'empezar', 'perks',
  'api', 'admin', 'superadmin', 'menu', 'pedidos', 'clientes', 'soporte',
  'landing', 'www', 'app', 'home', 'precios', 'planes', 'ayuda', 'terminos',
  'privacidad', 'contacto', 'gracias', 'pago', 'pagos', 'checkout', 'demo',
]);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function slugError(slug) {
  if (!slug || slug.length < 3) return 'El link debe tener al menos 3 caracteres';
  if (!SLUG_RE.test(slug)) return 'Solo minúsculas, números y guiones (sin empezar ni terminar en guión)';
  if (RESERVED.has(slug)) return 'Ese link está reservado por PERKS';
  return null;
}

export async function slugTaken(slug) {
  const { data, error } = await supabase.from('tenants').select('id').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
