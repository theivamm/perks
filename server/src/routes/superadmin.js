import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireSuperAdmin } from '../middleware/auth.js';
import { resetTenancyCache } from '../tenancy.js';
import { isValidPlan, DEFAULT_PLAN } from '../plans.js';
import { slugify, slugError, slugTaken } from '../slug.js';

const router = Router();

router.use(requireSuperAdmin);

function defaultSettings(name) {
  return {
    primaryColor: '#2563eb',
    theme: 'light',
    currency: '$',
    logo: '',
    logoIso: '',
    isoIcon: 'store',
    businessName: name,
    tagline: '',
    adminUsername: 'administracion',
    adminOtpSecret: '',
    adminOtpEnabled: 'false',
    setupCompleted: 'false',
  };
}

function isMissingTable(error) {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

async function listPayments() {
  const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return data || [];
}

async function countFor(table, tenantId) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);
  if (error) throw error;
  return count || 0;
}

// Lista de apps con conteos y dueño
router.get(
  '/tenants',
  asyncHandler(async (_req, res) => {
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const list = tenants || [];

    const ownerIds = [...new Set(list.map((t) => t.owner_user_id).filter(Boolean))];
    let owners = {};
    if (ownerIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, email, name').in('id', ownerIds);
      owners = Object.fromEntries((users || []).map((u) => [u.id, u]));
    }

    const enriched = await Promise.all(
      list.map(async (t) => ({
        ...t,
        owner: owners[t.owner_user_id] || null,
        counts: {
          clients: await countFor('users', t.id),
          orders: await countFor('orders', t.id),
          coupons: await countFor('loyalty_coupons', t.id),
        },
      }))
    );

    res.json({ tenants: enriched });
  })
);

// Métricas generales del SaaS
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const total = async (table) => {
      const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    };
    const [tenants, users, orders] = await Promise.all([
      total('tenants'),
      total('users'),
      total('orders'),
    ]);
    const pays = await listPayments();
    const approved = pays.filter((p) => p.status === 'approved');
    const revenue = approved.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    res.json({ tenants, users, orders, revenue, payments: pays.length });
  })
);

router.get(
  '/payments',
  asyncHandler(async (_req, res) => {
    res.json({ payments: await listPayments() });
  })
);

// Crear una app manualmente (venta asistida)
router.post(
  '/tenants',
  asyncHandler(async (req, res) => {
    const { businessName, slug, plan, ownerEmail, status, tagline } = req.body || {};
    const name = String(businessName || '').trim();
    if (!name) return res.status(400).json({ error: 'Nombre del negocio requerido' });

    const cleanSlug = slugify(slug || name);
    const sErr = slugError(cleanSlug);
    if (sErr) return res.status(400).json({ error: sErr });
    if (await slugTaken(cleanSlug)) return res.status(409).json({ error: 'Ese link ya está en uso' });

    let ownerId = null;
    if (ownerEmail) {
      const { data: owner } = await supabase
        .from('users')
        .select('id')
        .eq('email', String(ownerEmail).toLowerCase().trim())
        .maybeSingle();
      if (!owner) {
        return res
          .status(404)
          .json({ error: 'No existe un usuario con ese email. El dueño debe ingresar al menos una vez con Google.' });
      }
      ownerId = owner.id;
    }

    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({
        slug: cleanSlug,
        business_name: name,
        tagline: String(tagline || ''),
        plan: isValidPlan(String(plan)) ? String(plan) : DEFAULT_PLAN,
        status: status === 'suspendido' ? 'suspendido' : 'activo',
        owner_user_id: ownerId,
      })
      .select()
      .single();
    if (error) throw error;

    const rows = Object.entries(defaultSettings(name)).map(([key, value]) => ({
      tenant_id: tenant.id,
      key,
      value: String(value),
    }));
    await supabase.from('settings').insert(rows);

    if (ownerId) {
      await supabase.from('users').update({ tenant_id: tenant.id, role: 'admin' }).eq('id', ownerId);
    }

    resetTenancyCache();
    res.status(201).json({ tenant });
  })
);

// Editar slug, nombre, plan o estado
router.patch(
  '/tenants/:id',
  asyncHandler(async (req, res) => {
    const { slug, business_name, plan, status, tagline } = req.body || {};
    const patch = {};

    if (slug !== undefined) {
      const cleanSlug = slugify(slug);
      const sErr = slugError(cleanSlug);
      if (sErr) return res.status(400).json({ error: sErr });
      const { data: existing } = await supabase.from('tenants').select('id').eq('slug', cleanSlug).maybeSingle();
      if (existing && existing.id !== req.params.id) {
        return res.status(409).json({ error: 'Ese link ya está en uso' });
      }
      patch.slug = cleanSlug;
    }
    if (business_name !== undefined) patch.business_name = String(business_name).trim();
    if (tagline !== undefined) patch.tagline = String(tagline);
    if (plan !== undefined && isValidPlan(String(plan))) patch.plan = String(plan);
    if (status !== undefined) {
      patch.status = ['activo', 'suspendido', 'pendiente'].includes(status) ? status : 'activo';
    }

    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Nada para actualizar' });

    const { data, error } = await supabase
      .from('tenants')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    resetTenancyCache();
    res.json({ tenant: data });
  })
);

// Eliminar una app y todos sus datos
router.delete(
  '/tenants/:id',
  asyncHandler(async (req, res) => {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, slug, business_name')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!tenant) return res.status(404).json({ error: 'App no encontrada' });

    const ignoreMissing = (e) => /relation .* does not exist/i.test(String(e?.message || ''));
    const del = async (table) => {
      const { error } = await supabase.from(table).delete().eq('tenant_id', req.params.id);
      if (error && !ignoreMissing(error)) throw error;
    };

    await Promise.all([
      del('order_items'),
      del('orders'),
      del('coupons'),
      del('loyalty_coupons'),
      del('user_coupons'),
      del('notifications'),
      del('menu_items'),
      del('clients'),
      del('reward_rules'),
      del('settings'),
      del('support_messages'),
    ]);

    // Usuarios del tenant (admin + clientes) y sus cuentas de Supabase Auth
    const { data: users = [] } = await supabase.from('users').select('id').eq('tenant_id', req.params.id);
    const { error: usersErr } = await supabase.from('users').delete().eq('tenant_id', req.params.id);
    if (usersErr && !ignoreMissing(usersErr)) throw usersErr;
    for (const u of users) {
      await supabase.auth.admin.deleteUser(u.id).catch(() => {});
    }

    const { error } = await supabase.from('tenants').delete().eq('id', req.params.id);
    if (error) throw error;

    resetTenancyCache();
    res.json({ ok: true, id: tenant.id });
  })
);

// ===== Soporte =====

async function supportMessages(tenantId) {
  let query = supabase.from('support_messages').select('*').order('created_at', { ascending: true }).limit(300);
  if (tenantId) query = query.eq('tenant_id', tenantId);
  const { data, error } = await query;
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return data || [];
}

// Hilos de conversación por app, con último mensaje y no leídos
router.get(
  '/support',
  asyncHandler(async (_req, res) => {
    const [messages, { data: tenants, error }] = await Promise.all([
      supportMessages(),
      supabase.from('tenants').select('id, slug, business_name, status'),
    ]);
    if (error) throw error;

    const byTenant = new Map();
    for (const m of messages) {
      const entry = byTenant.get(m.tenant_id) || { last: null, unread: 0 };
      entry.last = m;
      if (m.sender_role === 'admin' && !m.read_by_superadmin) entry.unread += 1;
      byTenant.set(m.tenant_id, entry);
    }

    const threads = (tenants || [])
      .map((t) => {
        const entry = byTenant.get(t.id);
        return {
          tenant: t,
          last: entry?.last || null,
          unread: entry?.unread || 0,
        };
      })
      .filter((t) => t.last)
      .sort((a, b) => new Date(b.last.created_at) - new Date(a.last.created_at));

    res.json({ threads });
  })
);

router.get(
  '/support/:tenantId',
  asyncHandler(async (req, res) => {
    const messages = await supportMessages(req.params.tenantId);
    await supabase
      .from('support_messages')
      .update({ read_by_superadmin: true })
      .eq('tenant_id', req.params.tenantId)
      .eq('sender_role', 'admin')
      .eq('read_by_superadmin', false);
    res.json({ messages });
  })
);

router.post(
  '/support/:tenantId',
  asyncHandler(async (req, res) => {
    const body = String(req.body?.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Escribí un mensaje' });
    if (body.length > 2000) return res.status(400).json({ error: 'El mensaje es demasiado largo' });

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        tenant_id: req.params.tenantId,
        sender_role: 'superadmin',
        sender_id: req.user.id,
        sender_name: req.user.name || 'Equipo PERKS',
        body,
      })
      .select()
      .single();
    if (error) {
      if (isMissingTable(error)) {
        return res.status(503).json({ error: 'Corré migracion_11_soporte.sql para habilitar el soporte.' });
      }
      throw error;
    }
    res.status(201).json({ message: data });
  })
);

export default router;
