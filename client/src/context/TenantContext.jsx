import { createContext, useContext, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { setTenantSlug } from '../api.js';

const TenantContext = createContext({ slug: '', t: (p) => p, home: () => '/' });

export function TenantProvider({ children }) {
  const { slug = '' } = useParams();

  useEffect(() => {
    setTenantSlug(slug);
  }, [slug]);

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