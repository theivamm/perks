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

  const loginGoogle = async (accessToken) => {
    setLoading(true);
    try {
      const data = await api('/api/auth/google', { method: 'POST', body: { access_token: accessToken } });
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* noop */
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem(userKey);
  };

  const updateUser = (next) => {
    setUser(next);
    localStorage.setItem(userKey, JSON.stringify(next));
  };

  // Adopta una sesión ya emitida por el servidor (p. ej. al crear la app).
  const adoptSession = (data, targetSlug) => finishAuth(data, targetSlug);

  const isAuthed = Boolean(getToken() && user);

  return (
    <AuthContext.Provider value={{ user, login, loginOtp, register, loginGoogle, loginSuperAdmin, logout, updateUser, adoptSession, loading, isAuthed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}