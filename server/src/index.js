import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { runSeed } from './seed.js';
import { ensureBucket } from './supabase.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import clientsRoutes from './routes/clients.js';
import ordersRoutes from './routes/orders.js';
import settingsRoutes from './routes/settings.js';
import profileRoutes from './routes/profile.js';
import couponsRoutes from './routes/coupons.js';
import rewardsRoutes from './routes/rewards.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/rewards', rewardsRoutes);

app.get('/', (_req, res) => {
  const clientUrl = `http://localhost:${process.env.CLIENT_PORT || 5173}`;
  res.send(`<html lang="es"><head><meta charset="utf-8"/><title>API Fidelización App</title></head>
<body style="font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0">
<div style="text-align:center;padding:2rem">
<h1 style="font-size:1.5rem;margin-bottom:.5rem">API Fidelización App</h1>
<p style="color:#94a3b8;margin-bottom:1.5rem">El servidor está funcionando correctamente.</p>
<p>La aplicación web está en: <a style="color:#60a5fa;font-weight:bold;text-decoration:none" href="${clientUrl}">${clientUrl}</a></p>
<p style="color:#64748b;margin-top:1.5rem;font-size:.85rem">Endpoints: /api/menu · /api/auth/login · /api/clients · /api/orders · /api/settings</p>
</div></body></html>`);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;

try {
  await ensureBucket();
} catch (e) {
  console.warn('[SUPABASE] Bucket no disponible:', e.message);
}

try {
  await runSeed();
} catch (e) {
  console.warn('[Seed] No se pudo completar el seed:', e.message);
}

app.listen(PORT, () => {
  console.log(`API Fidelización escuchando en http://localhost:${PORT}`);
});