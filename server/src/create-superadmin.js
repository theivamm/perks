import 'dotenv/config';
import { pathToFileURL } from 'url';
import { supabase } from './supabase.js';
import { CENTRAL_TENANT_SLUG } from './slug.js';

const email = (process.env.SUPERADMIN_EMAIL || '').toLowerCase().trim();
const password = process.env.SUPERADMIN_PASSWORD || '';

async function main() {
  if (!email || !password) {
    console.error('[Superadmin] Faltan SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD en server/.env');
    process.exit(1);
  }

  const { data: tenant, error: tErr } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', CENTRAL_TENANT_SLUG)
    .maybeSingle();
  if (tErr) throw tErr;
  if (!tenant) {
    console.error(`[Superadmin] El tenant "${CENTRAL_TENANT_SLUG}" no existe. Crealo primero (o corré la migración correspondiente).`);
    process.exit(1);
  }

  let authUser = null;
  const { data: created } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Wintuu' },
  });
  if (created?.user) authUser = created.user;
  else {
    const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100000 });
    authUser = (list?.users || []).find((u) => u.email === email) || null;
  }
  if (!authUser) {
    console.error('[Superadmin] No se pudo crear ni ubicar el usuario (Super Admin).');
    process.exit(1);
  }

  const { error: upErr } = await supabase.from('users').upsert(
    {
      id: authUser.id,
      tenant_id: tenant.id,
      name: 'Wintuu',
      email,
      password_hash: '',
      role: 'superadmin',
    },
    { onConflict: 'email' }
  );
  if (upErr) throw upErr;

  const { error: ownerErr } = await supabase
    .from('tenants')
    .update({ owner_user_id: authUser.id })
    .eq('id', tenant.id);
  if (ownerErr) throw ownerErr;

  console.log(`[Superadmin] Cuenta lista: ${email}`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('[Superadmin] Error:', e.message);
      process.exit(1);
    });
}