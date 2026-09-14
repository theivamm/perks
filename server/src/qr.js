import crypto from 'crypto';
import { supabase } from './supabase.js';

export function newQrCode() {
  return 'PERKS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Devuelve el QR del usuario; lo genera y guarda si aún no lo tiene (cuentas previas).
export async function ensureQrCode(userId) {
  if (!userId) return null;
  const { data, error: selErr } = await supabase
    .from('users')
    .select('qr_code')
    .eq('id', userId)
    .maybeSingle();
  if (data?.qr_code) return data.qr_code;
  if (selErr) console.warn('[QR] No se pudo leer qr_code:', selErr.message);

  const code = newQrCode();
  const { data: updated, error } = await supabase
    .from('users')
    .update({ qr_code: code })
    .eq('id', userId)
    .select('qr_code')
    .single();
  if (error) {
    console.warn('[QR] No se pudo guardar qr_code:', error.message);
    // Si el .select() falló pero el update no, recontamos igualmente.
    const bare = await supabase.from('users').update({ qr_code: code }).eq('id', userId);
    if (bare.error) return null;
    return code;
  }
  return updated?.qr_code || code;
}