import jwt from 'jsonwebtoken';

const SECRET = () => process.env.JWT_SECRET || 'dev-secret';

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

export function requireAdmin(req, res, next) {
  const { user, error, status } = verify(req);
  if (!user) return res.status(status).json({ error });
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Se requieren permisos de administrador' });
  }
  req.user = user;
  next();
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

export function requireAuth(req, res, next) {
  const { user, error, status } = verify(req);
  if (!user) return res.status(status).json({ error });
  if (user.role !== 'admin' && user.role !== 'cliente') {
    return res.status(403).json({ error: 'Acceso restringido' });
  }
  req.user = user;
  next();
}

export function optionalAuth(req, _res, next) {
  const { user } = verify(req);
  if (user) req.user = user;
  next();
}