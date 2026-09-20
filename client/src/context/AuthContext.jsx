import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api.js';
import { supabase } from '../lib/supabase.js';
import { useTenant } from './TenantContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { slug } = useTenant();
  const userKey = slug ? `perks:user:${slug}` : 'perks:user:_global';

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(userKey) || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem(userKey) || 'null'));
    } catch {
      setUser(null);
    }
  }, [userKey]);

  useEffect(() => {
    if (!slug || !getToken(slug)) return;
    let active = true;
    api('/api/auth/session')
      .then(({ user: current }) => {
        if (!active) return;
        setUser(current);
        localStorage.setItem(userKey, JSON.stringify(current));
      })
      .catch((err) => {
        if (!active) return;
        if (!/sesión|no autorizado|no pertenece/i.test(String(err?.message || ''))) return;
        setToken(null, slug);
        localStorage.removeItem(userKey);
        setUser(null);
      });
    return () => {
      active = false;
    };
  }, [slug, userKey]);

  const [loading, setLoading] = useState(false);

  const finishAuth = (data, targetSlug) => {
    // El backend nos puede avisar explícitamente a qué app pertenece la sesión
    const slugToUse = data.user?.tenant_slug !== undefined ? data.user.tenant_slug : (targetSlug !== undefined ? targetSlug : slug);
    const finalUserKey = slugToUse ? `perks:user:${slugToUse}` : 'perks:user:_global';
    
    setToken(data.token, slugToUse);
    setUser(data.user);
    localStorage.setItem(finalUserKey, JSON.stringify(data.user));
    return data.user;
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: { username, password } });
      if (data.token) return finishAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginAdminEmail = async (email, password) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/admin-login', { method: 'POST', body: { email, password } });
      if (data.token) return finishAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginOtp = async (loginToken, code) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/otp', { method: 'POST', body: { login_token: loginToken, code } });
      return finishAuth(data);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/register', { method: 'POST', body: { name, email, password } });
      return finishAuth(data);
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async (accessToken, options = {}) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/google', { method: 'POST', body: { access_token: accessToken, global: options.global === true } });
      return finishAuth(data, data.user?.tenant_slug || undefined);
    } finally {
      setLoading(false);
    }
  };

  const loginSuperAdmin = async (email, password) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/superadmin/login', {
        method: 'POST',
        body: { email, password },
      });
      return finishAuth(data);
    } finally {
      setLoading(false);
    }
  };

  const switchApp = async (targetSlug) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/switch-app', { method: 'POST', body: { slug: targetSlug } });
      return finishAuth(data, targetSlug);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (targetSlug) => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* noop */
    }
    setToken(null);
    if (targetSlug) setToken(null, targetSlug);
    setUser(null);
    localStorage.removeItem(userKey);
    if (targetSlug) localStorage.removeItem(`perks:user:${targetSlug}`);
  };

  const updateUser = (next) => {
    setUser(next);
    localStorage.setItem(userKey, JSON.stringify(next));
  };

  // Adopta una sesión ya emitida por el servidor (p. ej. al crear la app).
  const adoptSession = (data, targetSlug) => finishAuth(data, targetSlug);

  const isAuthed = Boolean(getToken() && user);

  return (
    <AuthContext.Provider value={{ user, login, loginAdminEmail, loginOtp, register, loginGoogle, loginSuperAdmin, switchApp, logout, updateUser, adoptSession, loading, isAuthed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
