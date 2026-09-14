import crypto from 'crypto';
import { supabase } from './supabase.js';

export function newQrCode() {
  return 'PERKS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Devuelve el QR del usuario; lo genera y guarda si aún no lo tiene (cuentas previas).
export async function ensureQrCode(userId) {
  if (!userId) return null;
  const { data } = await supabase.from('users').select('qr_code').eq('id', userId).maybeSingle();
  if (data?.qr_code) return data.qr_code;
  const code = newQrCode();
  const { data: updated, error } = await supabase
    .from('users')
    .update({ qr_code: code })
    .eq('id', userId)
    .select('qr_code')
    .single();
  if (error) return null;
  return updated?.qr_code || null;
}