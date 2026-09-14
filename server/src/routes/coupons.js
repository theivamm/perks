import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  })
);

// Marcar como usado (voucher local): el cliente muestra el código en el local
router.post(
  '/:id/mark-used',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('coupons')
      .update({ status: 'usado', used_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('status', 'activo')
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  })
);

// Validación manual por parte del personal/admin: busca por código
router.post(
  '/validate',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const code = String((req.body || {}).code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Código requerido' });

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cupón no encontrado' });

    if (data.status !== 'activo') {
      return res.status(400).json({ error: `El cupón ya fue utilizado (${data.status})` });
    }

    const { data: updated, error: upErr } = await supabase
      .from('coupons')
      .update({ status: 'usado', used_at: new Date().toISOString() })
      .eq('id', data.id)
      .select()
      .single();
    if (upErr) throw upErr;

    res.json(updated);
  })
);

export default router;