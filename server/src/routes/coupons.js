import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { notifyUser } from '../notify.js';

const router = Router();

const ALLOWED = { title: 1, description: 1, type: 1, value: 1, target_points: 1, active: 1 };

function pick(body) {
  const row = {};
  for (const key of Object.keys(ALLOWED)) {
    if (body[key] !== undefined && body[key] !== null) row[key] = body[key];
  }
  if (row.value !== undefined) row.value = Number(row.value) || 0;
  if (row.target_points !== undefined) row.target_points = Math.max(1, Number(row.target_points) || 1);
  return row;
}

// Catálogo público: la lista de cupones que ve el usuario
router.get(
  '/catalog',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('loyalty_coupons')
      .select('*')
      .eq('active', true)
      .order('target_points');
    if (error) throw error;
    res.json({ coupons: data || [] });
  })
);

// Catálogo completo para el admin (incluye cupones pausados)
router.get(
  '/catalog/all',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('loyalty_coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ coupons: data || [] });
  })
);

router.post(
  '/catalog',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const row = pick(req.body || {});
    if (!row.title || !String(row.title).trim()) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }
    row.title = String(row.title).trim();
    const { data, error } = await supabase.from('loyalty_coupons').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  })
);

router.put(
  '/catalog/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const row = pick(req.body || {});
    const { data, error } = await supabase
      .from('loyalty_coupons')
      .update(row)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  })
);

router.delete(
  '/catalog/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data: used, error: usedErr } = await supabase
      .from('user_coupons')
      .select('id')
      .eq('coupon_id', req.params.id)
      .limit(1);
    if (usedErr) throw usedErr;
    if (used && used.length > 0) {
      return res
        .status(400)
        .json({ error: 'Este cupón ya fue activado por clientes. Mejor pausalo en lugar de eliminarlo.' });
    }
    const { error } = await supabase.from('loyalty_coupons').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

// Cupones de un usuario (progreso y estados)
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('user_coupons')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ coupons: data || [] });
  })
);

// Activar un cupón (solo si no hay otro activo)
router.post(
  '/activate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { coupon_id } = req.body || {};
    if (!coupon_id) return res.status(400).json({ error: 'Cupón requerido' });

    const { data: coupon, error: cErr } = await supabase
      .from('loyalty_coupons')
      .select('*')
      .eq('id', coupon_id)
      .eq('active', true)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!coupon) return res.status(404).json({ error: 'Cupón no encontrado' });

    const { data: existing, error: eErr } = await supabase
      .from('user_coupons')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('status', 'activado')
      .maybeSingle();
    if (eErr) throw eErr;
    if (existing) {
      return res
        .status(400)
        .json({ error: 'Ya tenés un cupón activo. Completalo o canjealo antes de activar otro.' });
    }

    const { data: created, error: iErr } = await supabase
      .from('user_coupons')
      .insert({
        user_id: req.user.id,
        coupon_id: coupon.id,
        title: coupon.title,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        target_points: coupon.target_points,
        points: 0,
        status: 'activado',
      })
      .select()
      .single();
    if (iErr) throw iErr;
    res.status(201).json(created);
  })
);

// Validación manual por parte del personal/admin: busca el código del cupón completado
router.post(
  '/validate',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const code = String((req.body || {}).code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Código requerido' });

    const { data, error } = await supabase
      .from('user_coupons')
      .select('*')
      .eq('code', code)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cupón no encontrado' });

    if (data.status !== 'completado') {
      return res
        .status(400)
        .json({ error: `Este cupón no está listo para canjear (estado: ${data.status}).` });
    }

    const { data: updated, error: upErr } = await supabase
      .from('user_coupons')
      .update({ status: 'canjeado', redeemed_at: new Date().toISOString() })
      .eq('id', data.id)
      .select()
      .single();
    if (upErr) throw upErr;

    try {
      await notifyUser(data.user_id, {
        type: 'coupon_used',
        title: '¡Cupón canjeado!',
        body: `Tu cupón "${updated.title || 'premio'}" (${updated.code}) fue canjeado en el local. Ya podés activar otro cupón.`,
        icon: 'badge-check',
        link: '/perfil',
        data: { user_coupon_id: updated.id, code: updated.code },
      });
    } catch (err) {
      console.warn('[Notificaciones] No se pudo crear:', err.message);
    }

    res.json(updated);
  })
);

export default router;