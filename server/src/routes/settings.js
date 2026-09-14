import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

const DEFAULTS = {
  primaryColor: '#2563eb',
  theme: 'light',
  currency: '$',
};

const ALLOWED = ['primaryColor', 'theme', 'currency'];

async function readSettings() {
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error) throw error;
  const settings = { ...DEFAULTS };
  for (const row of data || []) settings[row.key] = row.value;
  return settings;
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

export default router;