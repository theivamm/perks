import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import XLSX from 'xlsx';
import { supabase, uploadImage } from '../supabase.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { imageUpload, excelUpload, uploadsDir } from '../upload.js';
import { addActiveCouponPoint, countCompletedOrders } from '../rewards.js';
import { notifyPointAdded, notifyUser, redeemReadyCouponAndNotify } from '../notify.js';
import { getMembership } from '../memberships.js';

const router = Router();

const PREF_KEYS = ['vegetarian', 'glutenFree', 'vegan'];

async function registeredProfiles(tenantId, fields) {
  let { data: memberships = [], error } = await supabase
    .from('tenant_memberships')
    .select('user_id, phone, image, preferences, created_at')
    .eq('tenant_id', tenantId)
    .eq('role', 'cliente')
    .order('created_at', { ascending: false });
  if (error?.code === '42703' || error?.code === 'PGRST204') {
    const fallback = await supabase
      .from('tenant_memberships')
      .select('user_id, created_at')
      .eq('tenant_id', tenantId)
      .eq('role', 'cliente')
      .order('created_at', { ascending: false });
    if (fallback.error) throw fallback.error;
    memberships = fallback.data || [];
    error = null;
  }
  if (error) throw error;
  if (memberships.length === 0) return [];

  const { data: users = [], error: userError } = await supabase
    .from('users')
    .select(fields)
    .in('id', memberships.map((membership) => membership.user_id));
  if (userError) throw userError;
  const usersById = Object.fromEntries(users.map((user) => [user.id, user]));
  return memberships
    .map((membership) => ({
      ...usersById[membership.user_id],
      phone: membership.phone || '',
      image: membership.image || '',
      preferences: membership.preferences || {},
      membership_created_at: membership.created_at,
    }))
    .filter((user) => user.id);
}

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, email, phone, image, preferences, created_at')
      .eq('tenant_id', req.tenant.id)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const { data: orderRows } = await supabase
      .from('orders')
      .select('client_id')
      .eq('tenant_id', req.tenant.id);
    const counts = {};
    for (const row of orderRows || []) counts[row.client_id] = (counts[row.client_id] || 0) + 1;

    res.json((clients || []).map((c) => ({ ...c, orders: counts[c.id] || 0 })));
  })
);

router.get(
  '/registered',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [usersRes, ordersRes] = await Promise.all([
      registeredProfiles(req.tenant.id, 'id, name, email, qr_code, created_at'),
      supabase.from('orders').select('user_id, status').eq('tenant_id', req.tenant.id),
    ]);
    if (ordersRes.error) throw ordersRes.error;

    const counts = {};
    const done = {};
    for (const o of ordersRes.data || []) {
      if (!o.user_id) continue;
      counts[o.user_id] = (counts[o.user_id] || 0) + 1;
      if (['completado', 'entregado'].includes(o.status)) {
        done[o.user_id] = (done[o.user_id] || 0) + 1;
      }
    }

    res.json(
      usersRes.map((u) => ({
        ...u,
        orders: counts[u.id] || 0,
        completed: done[u.id] || 0,
      }))
    );
  })
);

// Detalle de un cliente registrado para el admin: perfil + pedidos + cupones + progreso
router.get(
  '/registered/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const membership = await getMembership(req.params.id, req.tenant.id);
    if (membership?.role !== 'cliente') return res.status(404).json({ error: 'Cliente no encontrado' });
    const baseFields = 'id, name, last_name, email, phone, image, preferences, qr_code, created_at';
    let { data: user, error } = await supabase
      .from('users')
      .select(baseFields)
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) {
      const fallback = await supabase
        .from('users')
        .select('id, name, email, phone, qr_code, created_at')
        .eq('id', req.params.id)
        .maybeSingle();
      if (fallback.error) throw fallback.error;
      user = fallback.data;
    }
    if (!user) return res.status(404).json({ error: 'Cliente no encontrado' });
    user.phone = membership.phone || '';
    user.image = membership.image || '';
    user.preferences = membership.preferences || {};

    const [ordersRes, couponsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*, clients(name, phone), order_items(*)')
        .eq('user_id', user.id)
        .eq('tenant_id', req.tenant.id)
        .order('created_at', { ascending: false }),
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
    const orders = ordersRes.data || [];
    const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const coupons = couponsRes.data || [];
    const activeCoupon = coupons.find((c) => c.status === 'activado') || null;

    res.json({
      user,
      orders,
      coupons,
      activeCoupon,
      stats: { totalOrders: orders.length, completedOrders: completed, totalSpent },
    });
  })
);

// Resumen para el perfil del admin: cupones listos para canjear por cliente
router.get(
  '/summary',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [usersRes, couponsRes] = await Promise.all([
      registeredProfiles(req.tenant.id, 'id, name, email, qr_code'),
      supabase
        .from('user_coupons')
        .select('id, user_id, title, description, type, value, points, target_points, code, completed_at')
        .eq('status', 'completado')
        .eq('tenant_id', req.tenant.id)
        .order('completed_at', { ascending: false }),
    ]);
    if (couponsRes.error) throw couponsRes.error;

    const couponsByUser = {};
    for (const c of couponsRes.data || []) {
      (couponsByUser[c.user_id] = couponsByUser[c.user_id] || []).push(c);
    }

    res.json(
      usersRes.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        qr_code: u.qr_code,
        couponsReady: couponsByUser[u.id] || [],
      }))
    );
  })
);

// Escaneo del QR del CUPÓN ACTIVO: busca el cupón por su código QR único.
// Devuelve el cliente y el cupón para que el local sume puntos directo ahí.
router.post(
  '/scan',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { qr_code } = req.body || {};
    const code = String(qr_code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Código QR requerido' });

    const { data: coupon, error } = await supabase
      .from('user_coupons')
      .select('*')
      .eq('qr_code', code)
      .eq('status', 'activado')
      .eq('tenant_id', req.tenant.id)
      .maybeSingle();
    if (error) throw error;

    let userCouponId = coupon?.id || null;
    let userId = coupon?.user_id || null;

    // Compatibilidad: si escanean el QR viejo del perfil (users.qr_code),
    // busca al usuario y usa su cupón activo.
    if (!coupon) {
      const { data: userByQr } = await supabase
        .from('users')
        .select('id, name, email, phone, qr_code, created_at')
        .eq('qr_code', code)
        .maybeSingle();
      const membership = userByQr ? await getMembership(userByQr.id, req.tenant.id) : null;
      if (userByQr && membership?.role === 'cliente') {
        userByQr.phone = membership.phone || '';
        userId = userByQr.id;
        const { data: userCoupon } = await supabase
          .from('user_coupons')
          .select('*')
          .eq('user_id', userByQr.id)
          .eq('status', 'activado')
          .eq('tenant_id', req.tenant.id)
          .maybeSingle();
        if (userCoupon) {
          coupon = userCoupon;
          userCouponId = userCoupon.id;
        }
      }
    }

    if (!coupon || !userId) {
      // Compatibilidad: si escanean el QR de un cupón LISTO para canjear (completado),
      // se canjea directo sin pasar por el perfil.
      const { data: readyCoupon, error: rcErr } = await supabase
        .from('user_coupons')
        .select('*')
        .eq('qr_code', code)
        .eq('status', 'completado')
        .eq('tenant_id', req.tenant.id)
        .maybeSingle();
      if (rcErr) throw rcErr;
      if (!readyCoupon) {
        return res.status(404).json({ error: 'Cupón activo no encontrado' });
      }
      const { data: readyUser, error: ruErr } = await supabase
        .from('users')
        .select('id, name, email, phone, qr_code, created_at')
        .eq('id', readyCoupon.user_id)
        .maybeSingle();
      if (ruErr) throw ruErr;
      const readyMembership = readyUser ? await getMembership(readyUser.id, req.tenant.id) : null;
      if (!readyUser || readyMembership?.role !== 'cliente') return res.status(404).json({ error: 'Cliente no encontrado' });
      readyUser.phone = readyMembership.phone || '';

      const redeemed = await redeemReadyCouponAndNotify(readyCoupon.id, req.tenant.id);
      if (!redeemed) {
        return res.status(400).json({ error: 'El cupón ya fue canjeado o no está disponible.' });
      }

      return res.json({ client: readyUser, coupon: redeemed, user_coupon_id: readyCoupon.id, redeemed: true });
    }

    const { data: user, error: uErr } = await supabase
      .from('users')
      .select('id, name, email, phone, qr_code, created_at')
      .eq('id', userId)
      .maybeSingle();
    if (uErr) throw uErr;
    const userMembership = user ? await getMembership(user.id, req.tenant.id) : null;
    if (!user || userMembership?.role !== 'cliente') return res.status(404).json({ error: 'Cliente no encontrado' });
    user.phone = userMembership.phone || '';

    res.json({ client: user, coupon, user_coupon_id: userCouponId });
  })
);

// Suma 1 punto al cupón activo del cliente (el admin escanea el QR del cupón
// y toca el botón). Si llega user_coupon_id, suma a ESE cupón concretamente.
router.post(
  '/registered/:id/puntos',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const userCouponId = (req.body || {}).user_coupon_id || null;

    const membership = await getMembership(userId, req.tenant.id);
    if (membership?.role !== 'cliente') return res.status(404).json({ error: 'Cliente no encontrado' });
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .maybeSingle();
    if (userErr) throw userErr;
    if (!user) return res.status(404).json({ error: 'Cliente no encontrado' });

    if (userCouponId) {
      const { data: target, error: tErr } = await supabase
        .from('user_coupons')
        .select('id')
        .eq('id', userCouponId)
        .eq('user_id', user.id)
        .eq('status', 'activado')
        .eq('tenant_id', req.tenant.id)
        .maybeSingle();
      if (tErr) throw tErr;
      if (!target) {
        return res
          .status(400)
          .json({ error: 'El cupón escaneado ya no está activo para sumar puntos.' });
      }
    } else {
      const { data: active, error: aErr } = await supabase
        .from('user_coupons')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'activado')
        .eq('tenant_id', req.tenant.id)
        .maybeSingle();
      if (aErr) throw aErr;
      if (!active) {
        return res
          .status(400)
          .json({ error: 'El cliente no tiene un cupón activo para sumar puntos.' });
      }
    }

    const result = await addActiveCouponPoint(user.id, userCouponId, req.tenant.id);

    try {
      await notifyPointAdded(user.id, result, req.tenant.id);
    } catch (err) {
      console.warn('[Notificaciones] No se pudieron crear:', err.message);
    }

    res.status(201).json({ result, activeCoupon: result.coupon || null });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email = '', phone = '', image = '', preferences = {} } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }

    const cleanPrefs = {};
    for (const k of PREF_KEYS) {
      if (preferences[k]) cleanPrefs[k] = true;
    }

    let client = null;
    if (email) {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('email', String(email).trim().toLowerCase())
        .eq('tenant_id', req.tenant.id)
        .maybeSingle();
      client = data;
    }

    if (client) {
      const { data: updated, error } = await supabase
        .from('clients')
        .update({ image: image || client.image, preferences: Object.keys(cleanPrefs).length ? cleanPrefs : client.preferences })
        .eq('id', client.id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(updated);
    }

    const { data: created, error } = await supabase
      .from('clients')
      .insert({
        tenant_id: req.tenant.id,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        image,
        preferences: cleanPrefs,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(created);
  })
);

router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, email, phone, image, preferences } = req.body;
    const patch = {};
    if (name !== undefined) patch.name = name;
    if (email !== undefined) patch.email = String(email).trim().toLowerCase();
    if (phone !== undefined) patch.phone = phone;
    if (image !== undefined) patch.image = image;
    if (preferences !== undefined) {
      const clean = {};
      for (const k of PREF_KEYS) if (preferences[k]) clean[k] = true;
      patch.preferences = clean;
    }

    const { data, error } = await supabase
      .from('clients')
      .update(patch)
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenant.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'No encontrado' });
    res.json(data);
  })
);

router.post(
  '/upload-image',
  requireAdmin,
  imageUpload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Imagen requerida' });
    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const name = `client-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

    try {
      const url = await uploadImage(name, req.file.buffer, req.file.mimetype);
      return res.json({ url });
    } catch (err) {
      console.warn('[SUPABASE] Fallback a almacenamiento local:', err.message);
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        fs.writeFileSync(path.join(uploadsDir, name), req.file.buffer);
        return res.json({ url: `/uploads/${name}` });
      } catch (diskErr) {
        console.error('[STORAGE] No se pudo guardar la imagen localmente:', diskErr.message);
        return res.status(500).json({ error: 'No se pudo guardar la imagen (Supabase y almacenamiento local no disponibles).' });
      }
    }
  })
);

router.post(
  '/import-excel',
  requireAdmin,
  excelUpload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
    const rows = (raw || []).filter((r) => r.some((c) => String(c ?? '').trim() !== ''));

    const isHeaderRow = (r) => {
      const c0 = String(r[0] ?? '').toLowerCase().trim();
      const c2 = String(r[2] ?? '').toLowerCase().trim();
      return /(nombre|name|apellido|cliente)/.test(c0) || /(email|correo|mail)/.test(c2);
    };
    const dataRows = rows.length > 0 && isHeaderRow(rows[0]) ? rows.slice(1) : rows;

    const { data: existing, error: fetchErr } = await supabase
      .from('clients')
      .select('email')
      .eq('tenant_id', req.tenant.id)
      .neq('email', '');
    if (fetchErr) throw fetchErr;

    const existEmails = new Set(
      (existing || []).map((c) => String(c.email || '').toLowerCase().trim()).filter(Boolean)
    );

    const toInsert = [];
    let skipped = 0;
    let duplicated = 0;

    for (const row of dataRows) {
      const name = String(row[0] ?? '').trim();
      const phone = String(row[1] ?? '').trim();
      const email = String(row[2] ?? '').trim().toLowerCase();

      if (!name) {
        skipped++;
        continue;
      }

      if (email && existEmails.has(email)) {
        duplicated++;
        continue;
      }

      if (email) existEmails.add(email);
      toInsert.push({ tenant_id: req.tenant.id, name, phone, email, image: '', preferences: {} });
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from('clients').insert(toInsert);
      if (error) throw error;
    }

    res.json({ ok: true, imported: toInsert.length, skipped, duplicated });
  })
);

router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenant.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

export default router;
