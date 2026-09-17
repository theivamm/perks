import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Cliente separado SOLO para operaciones de sesión (signInWithPassword, getUser).
// Si se usan en el cliente `supabase` (service role), esa sesión queda fijada en el
// cliente y todas las consultas siguientes pasan a ejecutarse como ese usuario,
// quedando filtradas por RLS (devuelven vacío sin error).
const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error('\n[AUTH] Falta SUPABASE_URL / SUPABASE_ANON_KEY en server/.env\n');
  process.exit(1);
}

export const authClient = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
