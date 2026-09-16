import { createContext, useContext, useState } from 'react';
import { api, getToken, setToken } from '../api.js';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const finishAuth = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
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
    localStorage.removeItem('user');
  };

  const updateUser = (next) => {
    setUser(next);
    localStorage.setItem('user', JSON.stringify(next));
  };

  const isAuthed = Boolean(getToken() && user);

  return (
    <AuthContext.Provider value={{ user, login, loginOtp, register, loginGoogle, logout, updateUser, loading, isAuthed }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}