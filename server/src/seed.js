import 'dotenv/config';
import { pathToFileURL } from 'url';
import { supabase } from './supabase.js';

const adminEmail = (process.env.ADMIN_EMAIL || 'admin@fidelizacion.com').toLowerCase().trim();
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const settingsDefaults = {
  primaryColor: '#2563eb',
  theme: 'light',
  currency: '$',
  adminUsername: 'administracion',
  adminOtpSecret: '',
  adminOtpEnabled: 'false',
};

const sampleItems = [
  ['Platos', 'Hamburguesa Clásica', 'Pan brioche, carne 180g, cheddar, lechuga, tomate y salsa especial.', 8.5],
  ['Platos', 'Pizza Margherita', 'Salsa de tomate, mozzarella fresca y albahaca.', 10.0],
  ['Bebidas', 'Café Americano', 'Café de especialidad recién preparado.', 2.5],
  ['Bebidas', 'Limonada de Menta', 'Limonada natural con hojas de menta fresca.', 3.0],
  ['Postres', 'Brownie con Helado', 'Brownie de chocolate con helado de vainilla.', 3.5],
].map(([category, title, description, price]) => ({ category, title, description, price, image: '' }));

async function getOrCreateAuthAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { name: 'Administrador' },
  });
  if (!error && data?.user) return data.user;

  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw listErr;
  const found = (list?.users || []).find((u) => u.email === adminEmail);
  if (!found) throw new Error(`No se pudo crear o ubicar el usuario admin (${adminEmail})`);
  return found;
}

function log(text) {
  console.log(`[Seed] ${text}`);
}

export async function runSeed() {
  const authAdmin = await getOrCreateAuthAdmin();

  const { error: upErr } = await supabase
    .from('users')
    .upsert(
      {
        id: authAdmin.id,
        name: 'Administrador',
        email: adminEmail,
        password_hash: '',
        role: 'admin',
      },
      { onConflict: 'email' }
    );
  if (upErr) throw upErr;
  log(`admin de Supabase Auth listo (${adminEmail}).`);

  const { data: existingSettings } = await supabase.from('settings').select('key');
  const keys = new Set((existingSettings || []).map((s) => s.key));
  const missing = Object.entries(settingsDefaults)
    .filter(([key]) => !keys.has(key))
    .map(([key, value]) => ({ key, value }));
  if (missing.length) {
    await supabase.from('settings').insert(missing);
    log('configuración por defecto creada.');
  }

  const { count } = await supabase.from('menu_items').select('id', { count: 'exact', head: true });
  if (!count) {
    await supabase.from('menu_items').insert(sampleItems);
    log('productos de ejemplo creados.');
  }

  const { count: catalogCount } = await supabase
    .from('loyalty_coupons')
    .select('id', { count: 'exact', head: true });
  if (!catalogCount) {
    const defaults = [
      {
        title: '25% OFF en tu compra',
        description: '25% de descuento en tu próxima compra',
        type: 'descuento',
        value: 25,
        target_points: 5,
        active: true,
      },
      {
        title: 'Café de regalo',
        description: 'Un café de especialidad para vos',
        type: 'regalo',
        value: 0,
        target_points: 10,
        active: true,
      },
      {
        title: 'Crédito de compra',
        description: 'Crédito para gastar en el local',
        type: 'monto',
        value: 10,
        target_points: 20,
        active: true,
      },
    ];
    await supabase.from('loyalty_coupons').insert(defaults);
    log('catálogo de cupones por defecto creado.');
  }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  runSeed()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('[Seed] Error:', e.message);
      process.exit(1);
    });
}