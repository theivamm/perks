import { supabase } from './supabase.js';

// Inserta una o varias notificaciones. Cada fila: { user_id, type, title, body, icon, link, data }
export async function insertNotifications(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const clean = rows
    .filter((r) => r && r.user_id)
    .map((r) => ({
      user_id: r.user_id,
      type: r.type || 'info',
      title: String(r.title || '').slice(0, 160),
      body: String(r.body || '').slice(0, 400),
      icon: r.icon || 'bell',
      link: r.link || '',
      data: r.data || {},
    }));
  if (clean.length === 0) return 0;
  const { error } = await supabase.from('notifications').insert(clean);
  if (error) throw error;
  return clean.length;
}

export function notifyUser(userId, payload) {
  if (!userId) return Promise.resolve(0);
  return insertNotifications([{ user_id: userId, ...payload }]);
}

// Notifica a todos los usuarios con rol admin (para pedidos, hitos, etc.)
export async function notifyAdmins(payload) {
  const { data: admins, error } = await supabase.from('users').select('id').eq('role', 'admin');
  if (error) throw error;
  const rows = (admins || []).map((a) => ({ user_id: a.id, ...payload }));
  return insertNotifications(rows);
}