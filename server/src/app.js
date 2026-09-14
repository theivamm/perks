import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import clientsRoutes from './routes/clients.js';
import ordersRoutes from './routes/orders.js';
import settingsRoutes from './routes/settings.js';
import profileRoutes from './routes/profile.js';
import couponsRoutes from './routes/coupons.js';
import rewardsRoutes from './routes/rewards.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();
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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

export default app;