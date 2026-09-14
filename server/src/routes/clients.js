import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import XLSX from 'xlsx';
import { supabase, uploadImage } from '../supabase.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { imageUpload, excelUpload, uploadsDir } from '../upload.js';
import { countCompletedOrders } from '../rewards.js';
import { notifyRewardsForCompra, notifyUser } from '../notify.js';

const router = Router();

const PREF_KEYS = ['vegetarian', 'glutenFree', 'vegan'];

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, email, phone, image, preferences, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const { data: orderRows } = await supabase.from('orders').select('client_id');
    const counts = {};
    for (const row of orderRows || []) counts[row.client_id] = (counts[row.client_id] || 0) + 1;

    res.json((clients || []).map((c) => ({ ...c, orders: counts[c.id] || 0 })));
  })
);

router.get(
  '/registered',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [usersRes, ordersRes] = await Promise.all([
      supabase
        .from('users')
        .select('id, name, email, phone, qr_code, created_at')
        .eq('role', 'cliente')
        .order('created_at', { ascending: false }),
      supabase.from('orders').select('user_id, status'),
    ]);
    if (usersRes.error) throw usersRes.error;
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
      (usersRes.data || []).map((u) => ({
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
    const baseFields = 'id, name, last_name, email, phone, image, preferences, qr_code, created_at';
    let { data: user, error } = await supabase
      .from('users')
      .select(baseFields)
      .eq('id', req.params.id)
      .eq('role', 'cliente')
      .maybeSingle();
    if (error) {
      const fallback = await supabase
        .from('users')
        .select('id, name, email, phone, qr_code, created_at')
        .eq('id', req.params.id)
        .eq('role', 'cliente')
        .maybeSingle();
      if (fallback.error) throw fallback.error;
      user = fallback.data;
    }
    if (!user) return res.status(404).json({ error: 'Cliente no encontrado' });

    const [ordersRes, couponsRes, rulesRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*, clients(name, phone), order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('coupons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('reward_rules')
        .select('id, name, every_orders, type, value, mode, description')
        .eq('active', true)
        .order('every_orders'),
    ]);
    if (ordersRes.error) throw ordersRes.error;
    if (couponsRes.error) throw couponsRes.error;
    if (rulesRes.error) throw rulesRes.error;

    const completed = await countCompletedOrders(user.id);
    const orders = ordersRes.data || [];
    const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    res.json({
      user,
      orders,
      coupons: couponsRes.data || [],
      stats: { totalOrders: orders.length, completedOrders: completed, totalSpent },
      rewardProgress: { completed, rules: rulesRes.data || [] },
    });
  })
);

// Busca un usuario por su código QR (para el lector del admin)
router.post(
  '/scan',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { qr_code } = req.body || {};
    const code = String(qr_code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Código QR requerido' });

    let { data: user, error } = await supabase
      .from('users')
      .select('id, name, last_name, email, phone, image, qr_code, created_at')
      .eq('qr_code', code)
      .eq('role', 'cliente')
      .maybeSingle();
    if (error) throw error;

    if (!user) {
      // Compatibilidad: también acepta el id del usuario como texto
      const { data: byId } = await supabase
        .from('users')
        .select('id, name, last_name, email, phone, image, qr_code, created_at')
        .eq('id', code)
        .eq('role', 'cliente')
        .maybeSingle();
      if (byId) user = byId;
    }

    if (!user) return res.status(404).json({ error: 'Cliente no encontrado' });

    const completed = await countCompletedOrders(user.id);
    res.json({ client: user, stats: { completedOrders: completed } });
  })
);

// Registra una compra manual de un cliente registrado (dispara premios y notificaciones)
router.post(
  '/registered/:id/compras',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { total = 0, note = '' } = req.body || {};
    const userId = req.params.id;

    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .eq('role', 'cliente')
      .maybeSingle();
    if (userErr) throw userErr;
    if (!user) return res.status(404).json({ error: 'Cliente no encontrado' });

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        client_id: null,
        status: 'completado',
        total: Math.max(0, Number(total) || 0),
        note: String(note || '').trim() || null,
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    try {
      await notifyRewardsForCompra(user.id, order);
    } catch (err) {
      console.warn('[Notificaciones] No se pudieron crear:', err.message);
    }

    const completed = await countCompletedOrders(user.id);
    res.status(201).json({ order, completed });
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
      fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, name), req.file.buffer);
      return res.json({ url: `/uploads/${name}` });
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
      toInsert.push({ name, phone, email, image: '', preferences: {} });
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
    const { error } = await supabase.from('clients').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

export default router;