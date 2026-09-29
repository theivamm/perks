import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireIdentity } from '../middleware/auth.js';
import { DEFAULT_PLAN, isValidPlan } from '../plans.js';
import { slugify, slugError, slugTaken } from '../slug.js';
import { signToken } from './auth.js';
import { ensureMembership } from '../memberships.js';
import { TERMS_VERSION, clientIp } from '../legal.js';

const router = Router();

// El pago solo se omite cuando se habilita explícitamente para desarrollo.
function onboardingOpen() {
  return process.env.ONBOARDING_OPEN === 'true';
}

async function approvedPayment(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('payer_email', String(email).toLowerCase())
    .eq('status', 'approved')
    .is('tenant_id', null)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return (data && data[0]) || null;
}

async function approvedSubscription(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'authorized')
    .is('tenant_id', null)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

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

// Estado del onboarding para el usuario logueado.
router.get(
  '/status',
  requireIdentity,
  asyncHandler(async (req, res) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, tenant_id, email')
      .eq('id', req.user.id)
      .maybeSingle();
    if (error) throw error;

    const { data: adminMemberships, error: membershipError } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', req.user.id)
      .eq('role', 'admin')
      .limit(1);
    if (membershipError) throw membershipError;

    if (adminMemberships?.[0]?.tenant_id) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('slug, status')
        .eq('id', adminMemberships[0].tenant_id)
        .maybeSingle();
      return res.json({ hasTenant: true, slug: tenant?.slug || null, status: tenant?.status || null, canStart: false });
    }

    const [payment, subscription] = await Promise.all([
      approvedPayment(user?.email),
      approvedSubscription(user?.id),
    ]);
    const entitlement = subscription || payment;
    const open = onboardingOpen();
    res.json({
      hasTenant: false,
      canStart: Boolean(entitlement) || open,
      paymentApproved: Boolean(payment),
      subscriptionApproved: Boolean(subscription),
      plan: entitlement?.plan || null,
      paymentRequired: !open,
    });
  })
);

// Disponibilidad de un slug en vivo mientras el usuario escribe.
router.get(
  '/slug',
  asyncHandler(async (req, res) => {
    const slug = slugify(req.query.value);
    const err = slugError(slug);
    if (err) return res.json({ slug, available: false, reason: err });
    const taken = await slugTaken(slug);
    res.json({ slug, available: !taken, reason: taken ? 'Ese link ya está en uso' : '' });
  })
);

// Crea la app (tenant) del usuario logueado y lo convierte en su admin.
router.post(
  '/create',
  requireIdentity,
  asyncHandler(async (req, res) => {
    const { businessName, slug, plan, acceptedTerms } = req.body || {};
    if (acceptedTerms !== true) {
      return res.status(400).json({ error: 'Tenés que aceptar los Términos del Servicio y la Política de Privacidad para crear tu app.' });
    }
    const name = String(businessName || '').trim();
    if (!name) return res.status(400).json({ error: 'Poné el nombre de tu negocio' });
    if (name.length > 60) return res.status(400).json({ error: 'El nombre es demasiado largo (máx. 60)' });

    const cleanSlug = slugify(slug || name);
    const sErr = slugError(cleanSlug);
    if (sErr) return res.status(400).json({ error: sErr });

    const { data: user, error: uErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();
    if (uErr) throw uErr;
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { data: adminMemberships, error: membershipError } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .limit(1);
    if (membershipError) throw membershipError;
    if (adminMemberships?.[0]?.tenant_id) {
      const { data: t } = await supabase.from('tenants').select('slug').eq('id', adminMemberships[0].tenant_id).maybeSingle();
      return res.status(409).json({ error: 'Esta cuenta ya tiene una app', slug: t?.slug || null });
    }

    if (await slugTaken(cleanSlug)) {
      return res.status(409).json({ error: 'Ese link ya está en uso' });
    }

    const [payment, subscription] = await Promise.all([
      approvedPayment(user.email),
      approvedSubscription(user.id),
    ]);
    if (!payment && !subscription && !onboardingOpen()) {
      return res.status(402).json({
        error: 'Todavía no registramos tu pago. Si ya pagaste, esperá unos minutos y volvé a intentar.',
      });
    }

    const chosenPlan = subscription?.plan || payment?.plan || (isValidPlan(String(plan)) ? String(plan) : DEFAULT_PLAN);

    const { data: tenant, error: tErr } = await supabase
      .from('tenants')
      .insert({
        slug: cleanSlug,
        business_name: name,
        tagline: '',
        plan: chosenPlan,
        status: 'activo',
        owner_user_id: user.id,
      })
      .select()
      .single();
    if (tErr) throw tErr;

    const rows = Object.entries(defaultSettings(name)).map(([key, value]) => ({
      tenant_id: tenant.id,
      key,
      value: String(value),
    }));
    const { error: sInsErr } = await supabase.from('settings').insert(rows);
    if (sInsErr) throw sInsErr;

    const membership = await ensureMembership(user.id, tenant.id, 'admin');

    // Firma digital de aceptación de Términos/Privacidad: queda registrada al
    // crear la app, con fecha, IP y user-agent, visible para el superadmin.
    const { error: legalErr } = await supabase.from('legal_acceptances').insert({
      tenant_id: tenant.id,
      user_id: user.id,
      email: user.email,
      terms_version: TERMS_VERSION,
      ip: clientIp(req),
      user_agent: req.headers['user-agent'] || null,
      context: 'onboarding',
    });
    if (legalErr) console.error('[Onboarding] No se pudo registrar la aceptación de términos:', legalErr.message);

    if (payment) {
      await supabase.from('payments').update({ tenant_id: tenant.id }).eq('id', payment.id);
    }
    if (subscription) {
      await supabase.from('subscriptions').update({ tenant_id: tenant.id }).eq('id', subscription.id);
    }

    // Devolvemos una sesión nueva ya como admin de la app recién creada: si
    // no, el cliente queda con el token viejo (rol cliente) y lo expulsa del
    // panel apenas entra.
    res.status(201).json({ slug: tenant.slug, tenant, ...signToken(user, tenant.slug, membership) });
  })
);

export default router;
