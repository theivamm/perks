import 'dotenv/config';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { runSeed } from '../src/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = new URL(url).hostname.split('.')[0];

const supabase = createClient(url, secret, { auth: { persistSession: false } });

const log = (...a) => console.log('\n>>', ...a);
const warn = (...a) => console.log('\n[!]', ...a);

async function tableExists(name) {
  const res = await fetch(`${url}/rest/v1/${name}?select=*&limit=1`, {
    headers: { apikey: secret, Authorization: `Bearer ${secret}` },
  });
  if (res.status === 200) return true;
  if (res.status === 404) {
    const text = await res.text();
    return !/PGRST205|42P01|does not exist/.test(text);
  }
  if (res.status === 401 || res.status === 403) {
    warn(`Error de autenticación al consultar ${name}: ${res.status}`);
    return null;
  }
  return false;
}

async function runViaManagementApi(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text: text.slice(0, 400) };
}

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket('menu-images');
  if (data) { log('Bucket "menu-images" ya existía.'); return true; }
  const { error } = await supabase.storage.createBucket('menu-images', { public: true, fileSizeLimit: 5 * 1024 * 1024 });
  if (error) { warn(`No se pudo crear el bucket: ${error.message}`); return false; }
  log('Bucket "menu-images" creado y público.');
  return true;
}

log(`Proyecto: ${ref}  (${url})`);

const tables = ['users', 'menu_items', 'clients', 'orders', 'order_items', 'settings'];
const states = {};
for (const t of tables) states[t] = await tableExists(t);

const missing = tables.filter((t) => states[t] === false);

for (const t of tables) {
  log(`Tabla ${t}: ${states[t] === true ? 'EXISTE' : states[t] === null ? 'SIN PERMISO' : 'NO EXISTE'}`);
}

if (missing.length > 0) {
  warn(`Faltan ${missing.length} tabla(s): ${missing.join(', ')}`);
  const res = await runViaManagementApi('select 1');
  log(`Intento por Management API: HTTP ${res.status}`);
  if (res.ok) {
    log('La key permite ejecutar SQL. Creando tablas...');
    const schemaPath = path.join(__dirname, '..', '..', 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    const run = await runViaManagementApi(schema);
    if (run.ok) {
      log('Tablas creadas correctamente.');
      await runSeed();
    } else {
      warn(`Error creando tablas: HTTP ${run.status} ${run.text}`);
    }
  } else {
    warn('Tu key no permite crear tablas por API.');
    warn('Opciones:');
    warn('  A) Ejecuta supabase/schema.sql en el SQL Editor de https://supabase.com');
    warn('  B) O corre: npm run setup:db  (crea las tablas con el password de Postgres)');
  }
} else {
  log('Todas las tablas ya existen.');
  await runSeed();
}

await ensureBucket();
log('Configuración de Supabase terminada.');