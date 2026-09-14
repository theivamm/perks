import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { notifyUser } from '../notify.js';

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
    if (data) {
      try {
        await notifyUser(req.user.id, {
          type: 'coupon_used',
          title: 'Cupón canjeado',
          body: `Usaste tu cupón "${data.description || 'premio'}" (${data.code}). ¡Gracias por tu compra!`,
          icon: 'badge-check',
          link: '/perfil',
          data: { coupon_id: data.id },
        });
      } catch (err) {
        console.warn('[Notificaciones] No se pudo crear:', err.message);
      }
    }
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

    try {
      await notifyUser(data.user_id, {
        type: 'coupon_used',
        title: 'Cupón canjeado',
        body: `Tu cupón "${updated.description || 'premio'}" (${updated.code}) fue canjeado en el local.`,
        icon: 'badge-check',
        link: '/perfil',
        data: { coupon_id: updated.id },
      });
    } catch (err) {
      console.warn('[Notificaciones] No se pudo crear:', err.message);
    }

    res.json(updated);
  })
);

export default router;