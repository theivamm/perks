import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { getDefaultTenant } from '../tenancy.js';

const router = Router();

// Tenant por defecto (usado por la web para redirigir la raíz al perfil principal)
router.get(
  '/default',
  asyncHandler(async (_req, res) => {
    const tenant = await getDefaultTenant();
    res.json({ slug: tenant.slug, business_name: tenant.business_name });
  })
);

// Datos públicos de un perfil (para validar slugs en el cliente)
router.get(
  '/check/:slug',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('tenants')
      .select('slug, business_name, tagline, status')
      .eq('slug', String(req.params.slug).toLowerCase().trim())
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Este perfil no existe' });
    if (data.status !== 'activo') {
      return res.status(403).json({ error: 'Este perfil está suspendido' });
    }
    res.json(data);
  })
);

export default router;