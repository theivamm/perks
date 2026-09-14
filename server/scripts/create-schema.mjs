import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const password = process.env.DATABASE_PASSWORD || '';
const ref = process.env.SUPABASE_REF || 'kdwbsdolxzaelvaaqhzf';

if (!password) {
  console.error('Falta la variable DATABASE_PASSWORD.');
  process.exit(1);
}

const enc = encodeURIComponent(password);
const candidates = [
  `postgresql://postgres:${enc}@db.${ref}.supabase.co:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${ref}:${enc}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
];

let client = null;
let used = '';
for (const cs of candidates) {
  const c = new pg.Client({
    connectionString: cs,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await c.connect();
    client = c;
    used = cs.replace(/:[^:@/]+@/, ':***@');
    break;
  } catch {
    await c.end().catch(() => {});
  }
}

if (!client) {
  console.error('No se pudo conectar a Postgres con la contraseña dada.');
  console.error('Verifica que sea el password de la base (Dashboard → Settings → Database).');
  process.exit(1);
}
console.log('Conectado a Postgres OK.');
console.log('Host:', used);

const schemaPath = path.join(__dirname, '..', '..', 'supabase', 'schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

try {
  await client.query(schema);
  console.log('Esquema aplicado: tablas creadas correctamente.');
} catch (e) {
  console.error('Error al aplicar el esquema:', e.message);
  process.exit(1);
} finally {
  await client.end();
}