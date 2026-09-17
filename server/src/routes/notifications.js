import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

// Si la tabla no está migrada todavía, devolvemos vacío sin romper la app
function isEmpty(error) {
  return /relation "public\.notifications" does not exist/i.test(String(error?.message || ''));
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.tenant.id)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(50);
    if (isEmpty(error)) return res.json({ items: [], unread: 0 });
    if (error) throw error;

    const { count, error: e2 } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.tenant.id)
      .eq('read', false);
    if (isEmpty(e2)) return res.json({ items: data || [], unread: 0 });
    if (e2) throw e2;

    res.json({ items: data || [], unread: count || 0 });
  })
);

// Historial completo: activas y archivadas (no se eliminan, solo se archivan)
router.get(
  '/history',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.tenant.id)
      .order('created_at', { ascending: false })
      .limit(300);
    if (isEmpty(error)) return res.json({ items: [], unread: 0 });
    if (error) throw error;
    res.json({ items: data || [], unread: 0 });
  })
);

router.post(
  '/read-all',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.tenant.id)
      .eq('read', false);
    if (isEmpty(error)) return res.json({ ok: true });
    if (error) throw error;
    res.json({ ok: true });
  })
);

router.post(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.tenant.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

router.post(
  '/:id/archive',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('notifications')
      .update({ archived: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .eq('tenant_id', req.tenant.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

export default router;