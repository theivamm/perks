import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

const ALLOWED_INSERT = { name: 1, every_orders: 1, type: 1, value: 1, mode: 1, description: 1, active: 1 };

function pick(body) {
  const row = {};
  for (const key of Object.keys(ALLOWED_INSERT)) {
    if (body[key] !== undefined && body[key] !== null) row[key] = body[key];
  }
  if (row.every_orders !== undefined) row.every_orders = Math.max(1, Number(row.every_orders) || 1);
  if (row.value !== undefined) row.value = Number(row.value) || 0;
  return row;
}

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('reward_rules')
      .select('*')
      .order('every_orders');
    if (error) throw error;
    res.json(data || []);
  })
);

router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const row = pick(req.body || {});
    if (!row.name) return res.status(400).json({ error: 'Nombre requerido' });
    const { data, error } = await supabase.from('reward_rules').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  })
);

router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const row = pick(req.body || {});
    const { data, error } = await supabase
      .from('reward_rules')
      .update(row)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  })
);

router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('reward_rules').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

export default router;