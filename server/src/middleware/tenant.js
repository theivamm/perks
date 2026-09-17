import { resolveTenant } from '../tenancy.js';

// Adjunta `req.tenant` a partir del header `x-tenant-slug`.
// Sin header usa el tenant por defecto (SHANTI-CHI) para no romper compatibilidad.
export function attachTenant(req, res, next) {
  resolveTenant(req.headers['x-tenant-slug'])
    .then((tenant) => {
      if (!tenant) {
        return res.status(404).json({ error: 'Este perfil no existe' });
      }
      req.tenant = tenant;
      next();
    })
    .catch(next);
}
