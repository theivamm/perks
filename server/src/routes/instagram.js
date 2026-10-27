import crypto from 'crypto';
import { Router } from 'express';
import { supabase, BUCKET, uploadImage } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { imageUpload } from '../upload.js';

// Se monta dentro del router de superadmin, que ya exige rol superadmin.
const router = Router();

const GRAPH = 'https://graph.instagram.com/v21.0';

function creds() {
  return {
    token: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    userId: process.env.INSTAGRAM_USER_ID || '',
  };
}

async function graph(path, { method = 'GET', params = {} } = {}) {
  const { token } = creds();
  const url = new URL(`${GRAPH}${path}`);
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (method === 'GET') url.searchParams.set(k, v);
    else body.set(k, v);
  }
  if (method === 'GET') url.searchParams.set('access_token', token);
  else body.set('access_token', token);

  const res = await fetch(url, { method, body: method === 'GET' ? undefined : body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const err = new Error(data?.error?.message || 'Instagram rechazó la solicitud');
    err.status = 502;
    throw err;
  }
  return data;
}

// Dice si la cuenta está conectada y el token sirve, sin publicar nada.
router.get(
  '/status',
  asyncHandler(async (_req, res) => {
    const { token, userId } = creds();
    if (!token || !userId) {
      return res.json({ configured: false, ok: false, error: 'Faltan INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_USER_ID en el servidor.' });
    }
    try {
      const me = await graph('/me', { params: { fields: 'user_id,username,account_type' } });
      res.json({ configured: true, ok: true, username: me.username, accountType: me.account_type });
    } catch (e) {
      res.json({ configured: true, ok: false, error: e.message });
    }
  })
);

async function waitUntilReady(containerId) {
  for (let i = 0; i < 15; i += 1) {
    const s = await graph(`/${containerId}`, { params: { fields: 'status_code,status' } });
    if (s.status_code === 'FINISHED') return;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') {
      throw new Error(`Instagram no pudo procesar la imagen (${s.status || s.status_code}).`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error('Instagram tardó demasiado en procesar la imagen. Probá de nuevo.');
}

// Publica una imagen JPEG como post de feed o como story.
router.post(
  '/publish',
  imageUpload.single('image'),
  asyncHandler(async (req, res) => {
    const { token, userId } = creds();
    if (!token || !userId) return res.status(503).json({ error: 'Instagram no está configurado en el servidor.' });
    if (!req.file) return res.status(400).json({ error: 'Falta la imagen' });
    if (req.file.mimetype !== 'image/jpeg') {
      return res.status(400).json({ error: 'Instagram solo acepta JPEG. Subí la imagen como .jpg.' });
    }

    const kind = req.body?.kind === 'story' ? 'story' : 'feed';
    const caption = String(req.body?.caption || '').slice(0, 2200);

    const name = `instagram/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`;
    const imageUrl = await uploadImage(name, req.file.buffer, 'image/jpeg');

    try {
      const container = await graph(`/${userId}/media`, {
        method: 'POST',
        params: {
          image_url: imageUrl,
          media_type: kind === 'story' ? 'STORIES' : undefined,
          caption: kind === 'story' ? undefined : caption,
        },
      });
      await waitUntilReady(container.id);
      const published = await graph(`/${userId}/media_publish`, { method: 'POST', params: { creation_id: container.id } });

      let permalink = null;
      try {
        const info = await graph(`/${published.id}`, { params: { fields: 'permalink' } });
        permalink = info.permalink || null;
      } catch {
        /* el post ya está publicado; el link es opcional */
      }
      res.status(201).json({ ok: true, id: published.id, permalink, kind });
    } finally {
      // Instagram ya descargó la imagen: no hace falta dejarla en el bucket.
      supabase.storage.from(BUCKET).remove([name]).catch(() => {});
    }
  })
);

export default router;
