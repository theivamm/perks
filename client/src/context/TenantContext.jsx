import { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { setTenantSlug } from '../api.js';

const TenantContext = createContext({ slug: '', t: (p) => p, home: () => '/' });

// Primer segmento de la URL que NO es una ruta propia de PERKS.
const RESERVED = new Set([
  'perks',
  'comenzar',
  'onboarding',
  'demo',
  'login',
  'registro',
  'perfil',
  'cupones',
  'notificaciones',
  'configuracion',
  'dashboard',
  'api',
  'admin',
  'superadmin',
  'www',
  'app',
]);

export function slugFromPath(pathname = '') {
  const first = String(pathname).split('?')[0].split('/').filter(Boolean)[0] || '';
  if (!first || RESERVED.has(first.toLowerCase())) return '';
  return first.toLowerCase();
}

export function TenantProvider({ children }) {
  const location = useLocation();
  const slug = slugFromPath(location.pathname);

  // Sincrónico y durante el render: garantiza que cualquier petición que
  // dispare un componente hijo ya mande el header `x-tenant-slug` correcto.
  setTenantSlug(slug);

  const value = useMemo(() => {
    const base = slug ? `/${slug}` : '';
    const t = (path) => {
      const p = String(path || '');
      if (p === '/') return base || '/';
      return p.startsWith('/') ? `${base}${p}` : `${base}/${p}`;
    };
    return { slug, t, home: () => base || '/' };
  }, [slug]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  return useContext(TenantContext);
}
