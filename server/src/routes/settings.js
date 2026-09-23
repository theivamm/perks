import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { supabase, uploadImage } from '../supabase.js';
import { requireAdmin } from '../middleware/auth.js';
import { imageUpload, uploadsDir } from '../upload.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

const DEFAULTS = {
  primaryColor: '#2563eb',
  theme: 'light',
  currency: '$',
  logo: '',
  logoIso: '',
  isoIcon: 'chef-hat',
  businessName: 'Fidelización App',
  tagline: '',
  setupCompleted: 'true',
  // Contacto del local (footer + botón flotante)
  businessDescription: '',
  address: '',
  mapsUrl: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  hours: '',
  contactButton: '',
  contactMessage: '',
};

const ALLOWED = ['primaryColor', 'theme', 'currency', 'logo', 'logoIso', 'isoIcon', 'businessName', 'tagline', 'setupCompleted',
  'businessDescription', 'address', 'mapsUrl', 'phone', 'whatsapp', 'email', 'website', 'instagram', 'facebook', 'tiktok', 'hours', 'contactButton', 'contactMessage',
];

async function readSettings(tenantId) {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .eq('tenant_id', tenantId);
  if (error) throw error;
  const settings = { ...DEFAULTS };
  for (const row of data || []) settings[row.key] = row.value;
  const safe = {};
  for (const key of ALLOWED) safe[key] = settings[key];
  return safe;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await readSettings(req.tenant.id));
  })
);

router.put(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const tenant = req.tenant;
    const rows = ALLOWED.filter((key) => req.body[key] !== undefined && req.body[key] !== null).map(
      (key) => ({ tenant_id: tenant.id, key, value: String(req.body[key]) })
    );
    if (rows.length > 0) {
      const { error } = await supabase
        .from('settings')
        .upsert(rows, { onConflict: 'tenant_id,key' });
      if (error) throw error;
    }
    res.json(await readSettings(tenant.id));
  })
);

// Subir el logo de la plataforma
router.post(
  '/upload-logo',
  requireAdmin,
  imageUpload.single('logo'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Imagen requerida' });
    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const name = `logo-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

    try {
      const url = await uploadImage(name, req.file.buffer, req.file.mimetype);
      const tenant = req.tenant;
      await supabase
        .from('settings')
        .upsert({ tenant_id: tenant.id, key: 'logo', value: url }, { onConflict: 'tenant_id,key' });
      return res.json({ url });
    } catch (err) {
      console.warn('[SUPABASE] Fallback logo local:', err.message);
      let url;
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        fs.writeFileSync(path.join(uploadsDir, name), req.file.buffer);
        url = `/uploads/${name}`;
      } catch (diskErr) {
        console.error('[STORAGE] No se pudo guardar el logo localmente:', diskErr.message);
        return res.status(500).json({ error: 'No se pudo guardar el logo (Supabase y almacenamiento local no disponibles).' });
      }
      const tenant = req.tenant;
      await supabase
        .from('settings')
        .upsert({ tenant_id: tenant.id, key: 'logo', value: url }, { onConflict: 'tenant_id,key' });
      return res.json({ url });
    }
  })
);

// Subir el ISO (ícono cuadrado) de la plataforma
router.post(
  '/upload-iso',
  requireAdmin,
  imageUpload.single('iso'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Imagen requerida' });
    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const name = `iso-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

    try {
      const url = await uploadImage(name, req.file.buffer, req.file.mimetype);
      const tenant = req.tenant;
      await supabase
        .from('settings')
        .upsert({ tenant_id: tenant.id, key: 'logoIso', value: url }, { onConflict: 'tenant_id,key' });
      return res.json({ url });
    } catch (err) {
      console.warn('[SUPABASE] Fallback iso local:', err.message);
      let url;
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        fs.writeFileSync(path.join(uploadsDir, name), req.file.buffer);
        url = `/uploads/${name}`;
      } catch (diskErr) {
        console.error('[STORAGE] No se pudo guardar el iso localmente:', diskErr.message);
        return res.status(500).json({ error: 'No se pudo guardar el ISO (Supabase y almacenamiento local no disponibles).' });
      }
      const tenant = req.tenant;
      await supabase
        .from('settings')
        .upsert({ tenant_id: tenant.id, key: 'logoIso', value: url }, { onConflict: 'tenant_id,key' });
      return res.json({ url });
    }
  })
);

export default router;