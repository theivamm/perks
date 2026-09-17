import { Router } from 'express';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { supabase, uploadImage } from '../supabase.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { imageUpload, excelUpload, uploadsDir } from '../upload.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data: items, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('tenant_id', req.tenant.id)
      .order('category')
      .order('title');
    if (error) throw error;
    const categories = [...new Set((items || []).map((i) => i.category).filter(Boolean))];
    res.json({ items: items || [], categories });
  })
);

router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, description = '', price = 0, category = 'General', image = '', available = 1, featured = 0, featured_label = '', discount = 0 } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Titulo requerido' });
    }
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        tenant_id: req.tenant.id,
        title: String(title).trim(),
        description,
        price: Number(price) || 0,
        category,
        image,
        available: available ? true : false,
        featured: featured ? true : false,
        featured_label: String(featured_label || '').trim(),
        discount: Math.max(0, Math.min(100, Number(discount) || 0)),
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  })
);

router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, description, price, category, image, available, featured, featured_label, discount } = req.body;
    const { data: current, error: findErr } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenant.id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!current) return res.status(404).json({ error: 'No encontrado' });

    const patch = {};
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (price !== undefined) patch.price = Number(price) || 0;
    if (category !== undefined) patch.category = category;
    if (image !== undefined) patch.image = image;
    if (available !== undefined) patch.available = available ? true : false;
    if (featured !== undefined) patch.featured = featured ? true : false;
    if (featured_label !== undefined) patch.featured_label = String(featured_label || '').trim();
    if (discount !== undefined) patch.discount = Math.max(0, Math.min(100, Number(discount) || 0));

    const { data, error } = await supabase
      .from('menu_items')
      .update(patch)
      .eq('id', current.id)
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
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenant.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

router.post(
  '/:id/generate-image',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data: item, error: findErr } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenant.id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!item) return res.status(404).json({ error: 'No encontrado' });

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
      return res.status(503).json({ error: 'Cloudflare Workers AI no configurado' });
    }

    const title = String(item.title || 'plato del menú').trim();
    const desc = String(item.description || '').trim().slice(0, 140);
    const prompt = `high quality professional food photography of ${title}${
      desc ? ', ' + desc : ''
    }, appetizing presentation, studio lighting, top-down view, clean minimalist background, 4k`;

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('width', '1024');
    form.append('height', '1024');

    const aiRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
        body: form,
        signal: AbortSignal.timeout(55000),
      }
    );

    const aiData = await aiRes.json().catch(() => ({}));
    if (!aiRes.ok || !aiData?.result?.image) {
      const msg = aiData?.errors?.[0]?.message || `Cloudflare respondió ${aiRes.status}`;
      return res.status(502).json({ error: `No se pudo generar la imagen: ${msg}` });
    }

    const buffer = Buffer.from(aiData.result.image, 'base64');
    const isPng = buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const ext = isPng ? '.png' : '.jpg';
    const contentType = isPng ? 'image/png' : 'image/jpeg';
    const name = `${String(item.id).slice(0, 8)}-${Date.now()}${ext}`;
    let publicUrl;
    try {
      publicUrl = await uploadImage(name, buffer, contentType);
    } catch (e) {
      console.warn('[SUPABASE] Fallback a almacenamiento local:', e.message);
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        fs.writeFileSync(path.join(uploadsDir, name), buffer);
        publicUrl = `/uploads/${name}`;
      } catch (diskErr) {
        console.error('[STORAGE] No se pudo guardar la imagen localmente:', diskErr.message);
        return res.status(500).json({
          error: 'La imagen se generó, pero no se pudo guardar: el storage de Supabase y el almacenamiento local no están disponibles.',
        });
      }
    }

    const { data: updated, error } = await supabase
      .from('menu_items')
      .update({ image: publicUrl })
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    res.json(updated);
  })
);

router.post(
  '/upload-image',
  requireAdmin,
  imageUpload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Imagen requerida' });
    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

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
      const c1 = String(r[1] ?? '').toLowerCase().trim();
      return (
        /(titul|title|nombre|name|platillo|producto|precio|price)/.test(c0) ||
        /(precio|price|costo|monto)/.test(c1)
      );
    };

    const dataRows = rows.length > 0 && isHeaderRow(rows[0]) ? rows.slice(1) : rows;

    const parsePrice = (value) => {
      let s = String(value ?? '').replace(/[^0-9.,-]/g, '').trim();
      if (!s) return 0;
      let negative = false;
      if (s.startsWith('-')) {
        negative = true;
        s = s.slice(1);
      }
      const hasComma = s.includes(',');
      const hasDot = s.includes('.');
      let num;
      if (hasComma && hasDot) {
        if (s.lastIndexOf(',') > s.lastIndexOf('.')) num = parseFloat(s.replace(/\./g, '').replace(',', '.'));
        else num = parseFloat(s.replace(/,/g, ''));
      } else if (hasComma) {
        num = parseFloat(s.replace(',', '.'));
      } else {
        num = parseFloat(s);
      }
      if (Number.isNaN(num)) return 0;
      return Math.round((negative ? -num : num) * 100) / 100;
    };

    const toInsert = [];
    for (const row of dataRows) {
      const title = String(row[0] ?? '').trim();
      if (!title) continue;
      toInsert.push({
        tenant_id: req.tenant.id,
        title,
        price: parsePrice(row[1]),
        category: String(row[2] ?? '').trim() || 'General',
        description: String(row[3] ?? '').trim(),
        image: '',
      });
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from('menu_items').insert(toInsert);
      if (error) throw error;
    }
    res.json({ ok: true, imported: toInsert.length, skipped: dataRows.length - toInsert.length });
  })
);

export default router;