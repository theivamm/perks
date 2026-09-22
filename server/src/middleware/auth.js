import jwt from 'jsonwebtoken';
import { ensureMembership, getMembership } from '../memberships.js';

// Sin JWT_SECRET, cualquiera podría firmar un token con role:"superadmin".
// Igual que supabase.js, falla al arrancar en vez de degradar en silencio.
if (!process.env.JWT_SECRET) {
  console.error('[Auth] Falta JWT_SECRET en server/.env. El servidor no puede arrancar sin un secreto propio.');
  process.exit(1);
}

const SECRET = () => process.env.JWT_SECRET;

function parseToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function verify(req) {
  const token = parseToken(req);
  if (!token) return { user: null, error: 'No autorizado', status: 401 };
  try {
    return { user: jwt.verify(token, SECRET()), error: null };
  } catch {
    return { user: null, error: 'Sesión inválida o expirada', status: 401 };
  }
}

export async function requireAdmin(req, res, next) {
  const { user, error, status } = verify(req);
  if (!user) return res.status(status).json({ error });
  try {
    let membership = await getMembership(user.id, req.tenant?.id);
    if (!membership && user.role === 'admin' && user.tenant_id === req.tenant?.id) {
      membership = await ensureMembership(user.id, req.tenant.id, 'admin');
    }
    if (membership?.role !== 'admin') {
      return res.status(403).json({ error: 'Esta cuenta no administra este negocio' });
    }
    const billingRoute = req.originalUrl.startsWith('/api/payments/subscription');
    const supportRoute = req.originalUrl.startsWith('/api/support');
    if (req.tenant?.status === 'suspendido' && !billingRoute && !supportRoute) {
      return res.status(402).json({ error: 'La app está suspendida por falta de pago. Revisá Plan y facturación.' });
    }
    req.user = { ...user, role: membership.role, tenant_id: membership.tenant_id };
    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireSuperAdmin(req, res, next) {
  const { user, error, status } = verify(req);
  if (!user) return res.status(status).json({ error });
  if (user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Se requieren permisos de superadministrador' });
  }
  req.user = user;
  next();
}

export async function requireAuth(req, res, next) {
  const { user, error, status } = verify(req);
  if (!user) return res.status(status).json({ error });
  try {
    let membership = await getMembership(user.id, req.tenant?.id);
    if (!membership && ['admin', 'cliente'].includes(user.role) && user.tenant_id === req.tenant?.id) {
      membership = await ensureMembership(user.id, req.tenant.id, user.role);
    }
    if (!membership) return res.status(403).json({ error: 'Esta cuenta no pertenece a esta app' });
    // Un negocio suspendido por falta de pago no puede seguir operando su
    // programa de fidelización para los clientes (mismo criterio que requireAdmin).
    const supportRoute = req.originalUrl.startsWith('/api/support');
    if (req.tenant?.status === 'suspendido' && !supportRoute) {
      return res.status(402).json({ error: 'Este negocio tiene su app suspendida temporalmente.' });
    }
    req.user = { ...user, role: membership.role, tenant_id: membership.tenant_id };
    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireIdentity(req, res, next) {
  const { user, error, status } = verify(req);
  if (!user) return res.status(status).json({ error });
  req.user = user;
  next();
}
