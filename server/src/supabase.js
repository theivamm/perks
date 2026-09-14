import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('\n[SUPABASE] Falta configuración. Edita server/.env y pega tus credenciales:\n');
  console.error('  SUPABASE_URL=https://TU-PROYECTO.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJ...');
  console.error('  SUPABASE_ANON_KEY=eyJ...\n');
  console.error('Y crea las tablas ejecutando supabase/schema.sql en el SQL Editor de tu proyecto.\n');
  process.exit(1);
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export const BUCKET = process.env.SUPABASE_BUCKET || 'menu-images';

export async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (data) return true;
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (error) {
    console.warn(`[SUPABASE] No se pudo crear el bucket "${BUCKET}": ${error.message}. Las imágenes se guardarán en el servidor.`);
    return false;
  }
  console.log(`[SUPABASE] Bucket "${BUCKET}" listo.`);
  return true;
}

export async function uploadImage(name, buffer, contentType) {
  const { error } = await supabase.storage.from(BUCKET).upload(name, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
}