import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { supabase, uploadImage } from '../supabase.js';
import { imageUpload, uploadsDir } from '../upload.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { countCompletedOrders } from '../rewards.js';
import { ensureCouponQrCode, ensureQrCode } from '../qr.js';

const router = Router();

const USER_FIELDS = 'id, name, last_name, email, phone, image, qr_code, preferences, role, created_at';
const BASE_FIELDS = 'id, name, email, phone, preferences, role, created_at';

// Útil mientras las columnas last_name/image no estén migradas en Supabase
async function selectUser(userId) {
  const { data, error } = await supabase.from('users').select(USER_FIELDS).eq('id', userId).maybeSingle();
  if (error) {
    const fallback = await supabase.from('users').select(BASE_FIELDS).eq('id', userId).maybeSingle();
    if (fallback.error) throw fallback.error;
    return fallback.data || null;
  }
  return data || null;
}

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await selectUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado. Volvé a iniciar sesión.' });
    user.role = req.membership.role;
    user.tenant_id = req.membership.tenant_id;
    user.phone = req.membership.phone || '';
    user.image = req.membership.image || '';
    user.preferences = req.membership.preferences || {};
    if (user.role === 'cliente' && !user.qr_code) {
      user.qr_code = await ensureQrCode(user.id);
      if (!user.qr_code) {
        console.warn('[QR] No se pudo generar el QR para el usuario', user.id);
      }
    }

    const [ordersRes, couponsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, status, total, created_at, order_items(*)')
        .eq('user_id', user.id)
        .eq('tenant_id', req.tenant.id)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('user_coupons')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', req.tenant.id)
        .order('created_at', { ascending: false }),
    ]);
    if (ordersRes.error) throw ordersRes.error;
    if (couponsRes.error) throw couponsRes.error;

    const completed = await countCompletedOrders(user.id, req.tenant.id);
    const totalSpent = (ordersRes.data || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const suggestions = await buildSuggestions(ordersRes.data || []);

    const coupons = couponsRes.data || [];
    const activeCoupon = coupons.find((c) => c.status === 'activado') || null;
    if (activeCoupon && activeCoupon.qr_code == null) {
      activeCoupon.qr_code = await ensureCouponQrCode(activeCoupon.id);
    }
    const readyCoupons = coupons.filter((c) => c.status === 'completado');
    for (const rc of readyCoupons) {
      if (rc.qr_code == null) rc.qr_code = await ensureCouponQrCode(rc.id);
    }

    res.json({
      user,
      orders: ordersRes.data || [],
      coupons,
      activeCoupon,
      readyCoupons,
      stats: { completedOrders: completed, totalOrders: (ordersRes.data || []).length, totalSpent },
      suggestions,
    });
  })
);

router.put(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, last_name, phone, email, image, preferences } = req.body || {};
    const userPatch = {};
    const membershipPatch = {};
    if (name !== undefined && String(name).trim()) userPatch.name = String(name).trim();
    if (last_name !== undefined) userPatch.last_name = String(last_name).trim();
    if (phone !== undefined) membershipPatch.phone = String(phone).trim();
    if (image !== undefined) membershipPatch.image = String(image).trim();
    if (preferences !== undefined) {
      if (preferences && typeof preferences === 'object' && !Array.isArray(preferences)) {
        membershipPatch.preferences = preferences;
      }
    }

    if (email !== undefined) {
      const newEmail = String(email).trim().toLowerCase();
      if (newEmail && newEmail !== String(req.user.email || '').toLowerCase()) {
        const { error: authErr } = await supabase.auth.admin.updateUserById(req.user.id, { email: newEmail });
        if (authErr) {
          return res.status(400).json({ error: `No se pudo cambiar el email: ${authErr.message}` });
        }
        userPatch.email = newEmail;
      }
    }

    let updated = await selectUser(req.user.id);
    if (Object.keys(userPatch).length > 0) {
      const result = await supabase
        .from('users')
        .update(userPatch)
        .eq('id', req.user.id)
        .select(USER_FIELDS)
        .single();
      if (result.error) {
        const safe = { ...userPatch };
        if ('last_name' in safe) {
          delete safe.last_name;
          const retry = await supabase.from('users').update(safe).eq('id', req.user.id).select(BASE_FIELDS).single();
          if (retry.error) throw retry.error;
          updated = retry.data;
        } else {
          throw result.error;
        }
      } else {
        updated = result.data;
      }
    }

    let membership = req.membership;
    if (Object.keys(membershipPatch).length > 0) {
      const { data, error } = await supabase
        .from('tenant_memberships')
        .update(membershipPatch)
        .eq('tenant_id', req.tenant.id)
        .eq('user_id', req.user.id)
        .select()
        .single();
      if (error) throw error;
      membership = data;
    }

    res.json({
      user: {
        ...updated,
        role: membership.role,
        tenant_id: membership.tenant_id,
        phone: membership.phone || '',
        image: membership.image || '',
        preferences: membership.preferences || {},
      },
    });
  })
);

// Cambiar contraseña (administrada por Supabase Auth)
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { password } = req.body || {};
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, { password: String(password) });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  })
);

// Subir foto de avatar
router.post(
  '/upload-image',
  requireAuth,
  imageUpload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Imagen requerida' });
    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const name = `avatar-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

    try {
      const url = await uploadImage(name, req.file.buffer, req.file.mimetype);
      return res.json({ url });
    } catch (err) {
      console.warn('[SUPABASE] Fallback avatar local:', err.message);
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        fs.writeFileSync(path.join(uploadsDir, name), req.file.buffer);
        return res.json({ url: `/uploads/${name}` });
      } catch (diskErr) {
        console.error('[STORAGE] No se pudo guardar el avatar localmente:', diskErr.message);
        return res.status(500).json({ error: 'No se pudo guardar la foto (Supabase y almacenamiento local no disponibles).' });
      }
    }
  })
);

// Eliminar la cuenta del usuario: borra sus datos y la cuenta de Supabase Auth
router.post(
  '/delete-account',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { confirm } = req.body || {};
    if (String(confirm || '').trim().toUpperCase() !== 'ELIMINAR') {
      return res.status(400).json({ error: 'Escribí ELIMINAR para confirmar' });
    }

    const userId = req.user.id;
    const ignoreMissing = (e) => /relation .* does not exist/i.test(String(e?.message || ''));
    const note = (table, e) => {
      if (e && !ignoreMissing(e)) console.warn(`[DELETE USUARIO] ${table}:`, e.message);
    };

    // Borra compras del usuario (y sus items). order_items cuelga de orders.
    const { data: orderIdsData } = await supabase.from('orders').select('id').eq('user_id', userId);
    const orderIds = (orderIdsData || []).map((o) => o.id);
    if (orderIds.length > 0) {
      const { error: e1 } = await supabase.from('order_items').delete().in('order_id', orderIds);
      note('order_items', e1);
    }
    const { error: e2 } = await supabase.from('orders').delete().eq('user_id', userId);
    note('orders', e2);

    // Cupones y notificaciones del usuario
    const { error: e3 } = await supabase.from('user_coupons').delete().eq('user_id', userId);
    note('user_coupons', e3);
    const { error: e4 } = await supabase.from('notifications').delete().eq('user_id', userId);
    note('notifications', e4);

    // Fila en users
    const { error: e5 } = await supabase.from('users').delete().eq('id', userId);
    note('users', e5);

    // Cuenta de Supabase Auth
    const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
    if (authErr) {
      note('auth', authErr);
      return res.status(500).json({ error: `No se pudo eliminar la cuenta: ${authErr.message}` });
    }

    res.json({ ok: true });
  })
);

async function buildSuggestions(orders) {
  const counts = {};
  const snap = {};
  for (const order of orders) {
    for (const it of order.order_items || []) {
      const key = it.menu_item_id || `t:${it.title}`;
      counts[key] = (counts[key] || 0) + (Number(it.qty) || 1);
      snap[key] = it;
    }
  }

  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const ids = top.map(([k]) => (k.startsWith('t:') ? null : k)).filter(Boolean);
  let menuMap = {};
  if (ids.length > 0) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, title, price, image, available, category')
      .in('id', ids);
    if (!error) menuMap = Object.fromEntries((data || []).map((m) => [m.id, m]));
  }

  const suggestions = [];
  for (const [key, times] of top) {
    const row = key.startsWith('t:') ? null : menuMap[key];
    if (row) {
      suggestions.push({
        menu_item_id: row.id,
        title: row.title,
        price: row.price,
        image: row.image,
        category: row.category,
        available: row.available,
        times,
      });
    } else if (snap[key]) {
      suggestions.push({
        menu_item_id: null,
        title: snap[key].title,
        price: snap[key].price,
        image: '',
        category: '',
        available: true,
        times,
      });
    }
  }
  return suggestions;
}

export default router;
