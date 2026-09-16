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
};

const ALLOWED = ['primaryColor', 'theme', 'currency', 'logo'];

async function readSettings() {
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error) throw error;
  const settings = { ...DEFAULTS };
  for (const row of data || []) settings[row.key] = row.value;
  const safe = {};
  for (const key of ALLOWED) safe[key] = settings[key];
  return safe;
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await readSettings());
  })
);

router.put(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const rows = ALLOWED.filter((key) => req.body[key] !== undefined && req.body[key] !== null).map(
      (key) => ({ key, value: String(req.body[key]) })
    );
    if (rows.length > 0) {
      const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
      if (error) throw error;
    }
    res.json(await readSettings());
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
      await supabase.from('settings').upsert({ key: 'logo', value: url }, { onConflict: 'key' });
      return res.json({ url });
    } catch (err) {
      console.warn('[SUPABASE] Fallback logo local:', err.message);
      fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, name), req.file.buffer);
      const url = `/uploads/${name}`;
      await supabase.from('settings').upsert({ key: 'logo', value: url }, { onConflict: 'key' });
      return res.json({ url });
    }
  })
);

export default router;