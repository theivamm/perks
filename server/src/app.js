import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
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
import notificationsRoutes from './routes/notifications.js';
import tenantsRoutes from './routes/tenants.js';
import plansRoutes from './routes/plans.js';
import paymentsRoutes from './routes/payments.js';
import onboardingRoutes from './routes/onboarding.js';
import supportRoutes from './routes/support.js';
import superadminRoutes from './routes/superadmin.js';
import { attachTenant } from './middleware/tenant.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Sin lista propia, permite todo (comportamiento previo) para no romper un
// deploy que todavía no configuró ALLOWED_ORIGINS. Configurarla restringe
// el acceso a los dominios reales de la app.
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const app = express();
app.use(
  cors(
    allowedOrigins.length > 0
      ? {
          origin(origin, callback) {
            // Sin header Origin (curl, apps móviles, el propio webhook de MP) → permitir.
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error('Origen no permitido por CORS'));
          },
        }
      : undefined
  )
);
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Límite general: amortigua abuso/DoS básico sobre toda la API.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Límite estricto para login/registro/OTP: son los blancos típicos de fuerza bruta.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Esperá unos minutos y volvé a intentar.' },
});
app.use(
  [
    '/api/auth/login',
    '/api/auth/admin-login',
    '/api/auth/global-login',
    '/api/auth/superadmin/login',
    '/api/auth/otp',
    '/api/auth/register',
  ],
  authLimiter
);

app.use('/api', attachTenant);

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/superadmin', superadminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

export default app;