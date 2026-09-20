import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireSuperAdmin } from '../middleware/auth.js';
import { resetTenancyCache } from '../tenancy.js';
import { isValidPlan, DEFAULT_PLAN } from '../plans.js';
import { slugify, slugError, slugTaken } from '../slug.js';
import { ensureMembership } from '../memberships.js';

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

async function countFor(table, tenantId, role) {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);
  if (role) query = query.eq('role', role);
  const { count, error } = await query;
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
          clients: await countFor('tenant_memberships', t.id, 'cliente'),
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
      await ensureMembership(ownerId, tenant.id, 'admin');
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
    const { data: currentTenant } = await supabase.from('tenants').select('slug').eq('id', req.params.id).maybeSingle();
    if (currentTenant?.slug === 'perks') {
      return res.status(403).json({ error: 'La app central PERKS no se puede modificar' });
    }
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
    if (tenant.slug === 'perks') return res.status(403).json({ error: 'La app central PERKS no se puede eliminar' });

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

    // `users.tenant_id` es una referencia legacy. La identidad y sus demás
    // membresías se conservan; solo se limpia el tenant que se está borrando.
    const { error: legacyUserError } = await supabase
      .from('users')
      .update({ tenant_id: null })
      .eq('tenant_id', req.params.id);
    if (legacyUserError) {
      if (legacyUserError.code === '23502') {
        return res.status(503).json({ error: 'Corré migracion_17_fk_users_tenant.sql antes de eliminar apps.' });
      }
      throw legacyUserError;
    }

    const { error } = await supabase.from('tenants').delete().eq('id', req.params.id);
    if (error) throw error;

    resetTenancyCache();
    res.json({ ok: true, id: tenant.id });
  })
);

// ===== Usuarios de una app =====

const USER_FIELDS = 'id, name, email, phone, created_at, qr_code';

// Agregar un admin a una app (crea usuario si no existe)
router.post(
  '/tenants/:tenantId/admins',
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body || {};
    const cleanEmail = String(email || '').toLowerCase().trim();
    if (!cleanEmail) return res.status(400).json({ error: 'Email requerido' });

    let user;
    const { data: existing } = await supabase.from('users').select('*').eq('email', cleanEmail).maybeSingle();

    if (existing) {
      user = existing;
    } else {
      if (!password || String(password).length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      const cleanName = String(name || '').trim() || cleanEmail.split('@')[0];
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: { name: cleanName },
      });
      if (authErr) {
        if (/already|registered|exist/i.test(authErr.message)) {
          return res.status(409).json({ error: 'Ese email ya está registrado en Supabase pero no en la base de datos.' });
        }
        throw authErr;
      }
      const { data: newUser, error: insErr } = await supabase
        .from('users')
        .insert({ id: authData.user.id, name: cleanName, email: cleanEmail, password_hash: '', role: 'cliente' })
        .select()
        .single();
      if (insErr) throw insErr;
      user = newUser;
    }

    const { data: mem } = await supabase
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', req.params.tenantId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (mem) return res.status(409).json({ error: 'Este usuario ya pertenece a la app' });

    await ensureMembership(user.id, req.params.tenantId, 'admin');
    res.status(201).json({ user: { ...user, role: 'admin' } });
  })
);

// Actualizar email o contraseña de un usuario
router.patch(
  '/tenants/:tenantId/users/:userId/credentials',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email && !password) return res.status(400).json({ error: 'Nada para actualizar' });

    const patch = {};
    if (email) patch.email = String(email).toLowerCase().trim();
    if (password) {
      if (String(password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      patch.password = String(password);
    }

    const { error: authErr } = await supabase.auth.admin.updateUserById(req.params.userId, patch);
    if (authErr) throw authErr;

    if (patch.email) {
      await supabase.from('users').update({ email: patch.email }).eq('id', req.params.userId);
    }

    res.json({ ok: true });
  })
);

// Lista todos los usuarios (admin + clientes) de una app
router.get(
  '/tenants/:id/users',
  asyncHandler(async (req, res) => {
    const { data: memberships = [], error } = await supabase
      .from('tenant_memberships')
      .select('user_id, role, created_at')
      .eq('tenant_id', req.params.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const ids = memberships.map((membership) => membership.user_id);
    if (ids.length === 0) return res.json({ users: [] });
    const { data: profiles = [], error: profileError } = await supabase.from('users').select(USER_FIELDS).in('id', ids);
    if (profileError) throw profileError;
    const profileMap = Object.fromEntries(profiles.map((profile) => [profile.id, profile]));
    const users = memberships
      .map((membership) => ({ ...profileMap[membership.user_id], role: membership.role, membership_created_at: membership.created_at }))
      .filter((user) => user.id);
    res.json({ users });
  })
);

// Quitar un usuario de una app sin eliminar su cuenta global ni otras membresías
router.delete(
  '/tenants/:tenantId/users/:userId',
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('tenant_memberships')
      .delete()
      .eq('tenant_id', req.params.tenantId)
      .eq('user_id', req.params.userId);
    if (error) throw error;
    res.json({ ok: true });
  })
);

// ===== Soporte =====

router.get(
  '/support',
  asyncHandler(async (_req, res) => {
    const [{ data: tickets = [], error: ticketError }, { data: tenants = [], error: tenantError }] = await Promise.all([
      supabase.from('support_tickets').select('*').order('updated_at', { ascending: false }),
      supabase.from('tenants').select('id, slug, business_name, status'),
    ]);
    if (ticketError) {
      if (isMissingTable(ticketError)) return res.status(503).json({ error: 'Corré migracion_14_tickets_soporte.sql para habilitar tickets.' });
      throw ticketError;
    }
    if (tenantError) throw tenantError;

    let messages = [];
    if (tickets.length > 0) {
      const result = await supabase
        .from('support_messages')
        .select('*')
        .in('ticket_id', tickets.map((ticket) => ticket.id))
        .order('created_at', { ascending: true });
      if (result.error) throw result.error;
      messages = result.data || [];
    }

    const tenantMap = Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant]));
    const enriched = tickets.map((ticket) => {
      const own = messages.filter((message) => message.ticket_id === ticket.id);
      return {
        ...ticket,
        tenant: tenantMap[ticket.tenant_id] || null,
        last_message: own.at(-1) || null,
        unread: own.filter((message) => message.sender_role === 'admin' && !message.read_by_superadmin).length,
      };
    });
    res.json({ tickets: enriched });
  })
);

router.get(
  '/support/:ticketId',
  asyncHandler(async (req, res) => {
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', req.params.ticketId)
      .maybeSingle();
    if (ticketError) throw ticketError;
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

    const { data: messages = [], error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });
    if (error) throw error;

    await supabase
      .from('support_messages')
      .update({ read_by_superadmin: true })
      .eq('ticket_id', ticket.id)
      .eq('sender_role', 'admin')
      .eq('read_by_superadmin', false);
    res.json({ ticket, messages });
  })
);

router.post(
  '/support/:ticketId',
  asyncHandler(async (req, res) => {
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', req.params.ticketId)
      .maybeSingle();
    if (ticketError) throw ticketError;
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
    if (ticket.status === 'cerrado') return res.status(409).json({ error: 'Este ticket está cerrado' });

    const body = String(req.body?.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Escribí un mensaje' });
    if (body.length > 2000) return res.status(400).json({ error: 'El mensaje es demasiado largo' });

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        tenant_id: ticket.tenant_id,
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
    await supabase
      .from('support_tickets')
      .update({ status: 'respondido', updated_at: new Date().toISOString() })
      .eq('id', ticket.id);
    res.status(201).json({ message: data });
  })
);

router.patch(
  '/support/:ticketId',
  asyncHandler(async (req, res) => {
    const status = String(req.body?.status || '');
    if (!['nuevo', 'abierto', 'respondido', 'cerrado'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.ticketId)
      .select()
      .single();
    if (error) throw error;
    res.json({ ticket });
  })
);

export default router;
