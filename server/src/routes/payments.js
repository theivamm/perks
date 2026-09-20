import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { getPlans, isValidPlan, DEFAULT_PLAN } from '../plans.js';
import { requireAdmin, requireIdentity } from '../middleware/auth.js';
import { resetTenancyCache } from '../tenancy.js';

const router = Router();

function accessToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN || '';
}

function graceDays() {
  return Math.max(0, Number(process.env.SUBSCRIPTION_GRACE_DAYS || 5));
}

function appOrigin(req) {
  return String(process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

function addDays(value, days) {
  const date = value ? new Date(value) : new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

async function mercadoPago(path, options = {}) {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Mercado Pago no pudo procesar la solicitud');
    error.status = 502;
    throw error;
  }
  return data;
}

async function setTenantStatus(tenantId, status) {
  if (!tenantId) return;
  const { error } = await supabase.from('tenants').update({ status }).eq('id', tenantId);
  if (error) throw error;
  resetTenancyCache();
}

async function savePayment(payment, fallbackId, context = {}) {
  const metaPlan = context.plan || payment?.metadata?.plan || payment?.external_reference;
  const plan = isValidPlan(String(metaPlan)) ? String(metaPlan) : DEFAULT_PLAN;
  const expected = getPlans().find((item) => item.id === plan);
  const paidAmount = Number(payment?.transaction_amount || 0);
  const paidCurrency = payment?.currency_id || 'ARS';
  const validTotal = expected && paidAmount >= expected.price && paidCurrency === expected.currency;
  const status = payment?.status === 'approved' && !validTotal ? 'rejected' : payment?.status || 'pending';
  const userId = context.userId || payment?.metadata?.user_id || null;
  let accountEmail = null;
  if (userId) {
    const { data: user } = await supabase.from('users').select('email').eq('id', userId).maybeSingle();
    accountEmail = user?.email || null;
  }
  const row = {
    provider: 'mercadopago',
    provider_payment_id: String(payment.id || fallbackId),
    payer_email: String(accountEmail || payment?.payer?.email || '').toLowerCase() || null,
    plan,
    amount: paidAmount,
    currency: paidCurrency,
    status,
    raw: payment,
    updated_at: new Date().toISOString(),
  };
  if (context.tenantId) row.tenant_id = context.tenantId;
  if (context.subscriptionId) row.subscription_id = context.subscriptionId;
  const { error } = await supabase.from('payments').upsert(row, { onConflict: 'provider_payment_id' });
  if (error) throw error;
  return row;
}

async function subscriptionByProvider(providerId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('provider_subscription_id', String(providerId))
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function saveSubscription(preapproval, context = {}) {
  const providerId = String(preapproval.id || context.providerId || '');
  if (!providerId) throw new Error('Suscripción de Mercado Pago inválida');
  const existing = await subscriptionByProvider(providerId);
  const providerStatus = preapproval.status || existing?.provider_status || 'pending';
  let status = providerStatus;
  if (providerStatus === 'authorized') status = existing?.last_payment_status === 'rejected' ? 'past_due' : 'authorized';

  const row = {
    provider: 'mercadopago',
    provider_subscription_id: providerId,
    user_id: context.userId || existing?.user_id || null,
    tenant_id: context.tenantId || existing?.tenant_id || null,
    plan: 'mensual',
    status,
    provider_status: providerStatus,
    payer_email: String(preapproval.payer_email || existing?.payer_email || '').toLowerCase() || null,
    amount: Number(preapproval.auto_recurring?.transaction_amount || existing?.amount || 0),
    currency: preapproval.auto_recurring?.currency_id || existing?.currency || 'ARS',
    checkout_url: preapproval.init_point || existing?.checkout_url || '',
    current_period_start: preapproval.date_created || existing?.current_period_start || null,
    current_period_end: preapproval.next_payment_date || existing?.current_period_end || null,
    next_payment_date: preapproval.next_payment_date || existing?.next_payment_date || null,
    grace_until: existing?.grace_until || null,
    last_payment_status: existing?.last_payment_status || null,
    raw: preapproval,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(row, { onConflict: 'provider_subscription_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function latestPendingSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .is('tenant_id', null)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

async function processAuthorizedPayment(authorizedPayment) {
  const providerId = authorizedPayment.preapproval_id || authorizedPayment.subscription_id;
  if (!providerId) return null;
  let subscription = await subscriptionByProvider(providerId);
  if (!subscription) {
    const preapproval = await mercadoPago(`/preapproval/${encodeURIComponent(providerId)}`);
    subscription = await saveSubscription(preapproval);
  }

  const monthlyPlan = getPlans().find((plan) => plan.id === 'mensual');
  const validAmount = Number(authorizedPayment.transaction_amount || 0) >= monthlyPlan.price
    && (!authorizedPayment.currency_id || authorizedPayment.currency_id === monthlyPlan.currency);
  const paymentStatus = authorizedPayment.status === 'approved' && !validAmount
    ? 'rejected'
    : authorizedPayment.status || 'pending';
  const patch = {
    last_payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  };
  if (paymentStatus === 'approved') {
    patch.status = 'authorized';
    patch.grace_until = null;
    patch.current_period_start = authorizedPayment.date_created || new Date().toISOString();
    if (subscription.next_payment_date) patch.current_period_end = subscription.next_payment_date;
  } else if (['rejected', 'cancelled'].includes(paymentStatus)) {
    patch.status = 'past_due';
    patch.grace_until = subscription.grace_until || addDays(new Date(), graceDays());
  }

  const { data: updated, error } = await supabase
    .from('subscriptions')
    .update(patch)
    .eq('id', subscription.id)
    .select()
    .single();
  if (error) throw error;

  if (paymentStatus === 'approved') await setTenantStatus(updated.tenant_id, 'activo');
  const paymentId = authorizedPayment.payment?.id || authorizedPayment.payment_id;
  if (paymentId) {
    const payment = await mercadoPago(`/v1/payments/${encodeURIComponent(paymentId)}`);
    await savePayment(payment, paymentId, {
      plan: 'mensual',
      userId: updated.user_id,
      tenantId: updated.tenant_id,
      subscriptionId: updated.id,
    });
  }
  return updated;
}

router.post(
  '/mercadopago/preference',
  requireIdentity,
  asyncHandler(async (req, res) => {
    if (!accessToken()) return res.status(503).json({ error: 'Mercado Pago todavía no está configurado' });
    const plan = getPlans().find((item) => item.id === req.body?.plan);
    if (!plan) return res.status(400).json({ error: 'Plan inválido' });
    const origin = appOrigin(req);

    if (plan.id === 'mensual') {
      const existing = await latestPendingSubscription(req.user.id);
      if (existing?.status === 'authorized') {
        return res.json({ approved: true, type: 'subscription' });
      }
      const preapproval = await mercadoPago('/preapproval', {
        method: 'POST',
        body: JSON.stringify({
          reason: 'PERKS · Plan Mensual',
          external_reference: `perks:${req.user.id}:mensual`,
          payer_email: req.user.email,
          back_url: `${origin}/comenzar?plan=mensual&subscription=success`,
          status: 'pending',
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: plan.price,
            currency_id: plan.currency,
          },
        }),
      });
      const subscription = await saveSubscription(preapproval, { userId: req.user.id });
      return res.json({ checkoutUrl: preapproval.init_point, subscriptionId: subscription.id, type: 'subscription' });
    }

    const preference = await mercadoPago('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify({
        items: [{
          id: plan.id,
          title: `PERKS · Plan ${plan.name}`,
          description: 'App de fidelización personalizada',
          quantity: 1,
          currency_id: plan.currency,
          unit_price: plan.price,
        }],
        metadata: { plan: plan.id, user_id: req.user.id },
        external_reference: plan.id,
        notification_url: `${origin}/api/payments/mercadopago/webhook`,
        back_urls: {
          success: `${origin}/comenzar?plan=${plan.id}&payment=success`,
          pending: `${origin}/comenzar?plan=${plan.id}&payment=pending`,
          failure: `${origin}/comenzar?plan=${plan.id}&payment=failure`,
        },
        auto_return: 'approved',
      }),
    });
    const checkoutUrl = accessToken().startsWith('TEST-')
      ? preference.sandbox_init_point || preference.init_point
      : preference.init_point;
    res.json({ checkoutUrl, preferenceId: preference.id, type: 'payment' });
  })
);

router.post(
  '/mercadopago/confirm',
  requireIdentity,
  asyncHandler(async (req, res) => {
    const paymentId = String(req.body?.paymentId || '').trim();
    if (!paymentId) return res.status(400).json({ error: 'Pago requerido' });
    const payment = await mercadoPago(`/v1/payments/${encodeURIComponent(paymentId)}`);
    const paymentUserId = String(payment?.metadata?.user_id || '');
    const payerEmail = String(payment?.payer?.email || '').toLowerCase();
    const belongsToUser = paymentUserId
      ? paymentUserId === req.user.id
      : payerEmail && payerEmail === String(req.user.email || '').toLowerCase();
    if (!belongsToUser) return res.status(403).json({ error: 'El pago no corresponde a esta cuenta' });
    const saved = await savePayment(payment, paymentId);
    res.json({ status: saved.status, approved: saved.status === 'approved', plan: saved.plan });
  })
);

router.post(
  '/mercadopago/subscription/confirm',
  requireIdentity,
  asyncHandler(async (req, res) => {
    const current = await latestPendingSubscription(req.user.id);
    if (!current) return res.status(404).json({ error: 'Suscripción no encontrada' });
    const preapproval = await mercadoPago(`/preapproval/${encodeURIComponent(current.provider_subscription_id)}`);
    const subscription = await saveSubscription(preapproval, { userId: req.user.id });
    res.json({ status: subscription.status, approved: subscription.status === 'authorized', plan: 'mensual' });
  })
);

router.post(
  '/subscription/start',
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (req.tenant.plan !== 'mensual') return res.status(400).json({ error: 'El plan vitalicio no requiere renovación' });
    const { data: current } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('tenant_id', req.tenant.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (current?.status === 'authorized') return res.json({ active: true });
    if (current?.status === 'pending' && current.checkout_url) {
      return res.json({ checkoutUrl: current.checkout_url });
    }

    const plan = getPlans().find((item) => item.id === 'mensual');
    const origin = appOrigin(req);
    const preapproval = await mercadoPago('/preapproval', {
      method: 'POST',
      body: JSON.stringify({
        reason: 'PERKS · Plan Mensual',
        external_reference: `perks:${req.user.id}:${req.tenant.id}`,
        payer_email: req.user.email,
        back_url: `${origin}/${req.tenant.slug}/dashboard/configuracion?subscription=success`,
        status: 'pending',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: plan.price,
          currency_id: plan.currency,
        },
      }),
    });
    await saveSubscription(preapproval, { userId: req.user.id, tenantId: req.tenant.id });
    res.json({ checkoutUrl: preapproval.init_point });
  })
);

router.post(
  '/subscription/confirm',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data: current, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('tenant_id', req.tenant.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!current) return res.status(404).json({ error: 'Suscripción no encontrada' });
    const preapproval = await mercadoPago(`/preapproval/${encodeURIComponent(current.provider_subscription_id)}`);
    const subscription = await saveSubscription(preapproval, { userId: req.user.id, tenantId: req.tenant.id });
    if (subscription.status === 'authorized') await setTenantStatus(req.tenant.id, 'activo');
    res.json({ subscription });
  })
);

router.get(
  '/subscription',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data: subscriptions = [], error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('tenant_id', req.tenant.id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    const { data: payments = [], error: paymentError } = await supabase
      .from('payments')
      .select('id, amount, currency, status, created_at, provider_payment_id')
      .eq('tenant_id', req.tenant.id)
      .order('created_at', { ascending: false })
      .limit(24);
    if (paymentError) throw paymentError;
    res.json({
      plan: req.tenant.plan,
      tenantStatus: req.tenant.status,
      subscription: subscriptions[0] || null,
      payments,
    });
  })
);

router.post(
  '/subscription/cancel',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('tenant_id', req.tenant.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!subscription) return res.status(404).json({ error: 'Suscripción no encontrada' });
    const preapproval = await mercadoPago(`/preapproval/${encodeURIComponent(subscription.provider_subscription_id)}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' }),
    });
    const updated = await saveSubscription(preapproval);
    const end = updated.current_period_end || updated.next_payment_date || new Date().toISOString();
    const { data } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', grace_until: end, updated_at: new Date().toISOString() })
      .eq('id', updated.id)
      .select()
      .single();
    res.json({ subscription: data });
  })
);

router.get(
  '/subscriptions/reconcile',
  asyncHandler(async (req, res) => {
    const secret = process.env.CRON_SECRET || '';
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    const { data: subscriptions = [], error } = await supabase
      .from('subscriptions')
      .select('*')
      .not('tenant_id', 'is', null);
    if (error) throw error;

    let suspended = 0;
    let reactivated = 0;
    for (const item of subscriptions) {
      let subscription = item;
      try {
        const preapproval = await mercadoPago(`/preapproval/${encodeURIComponent(item.provider_subscription_id)}`);
        subscription = await saveSubscription(preapproval);
      } catch (err) {
        console.warn('[MP] No se pudo conciliar suscripción', item.provider_subscription_id, err.message);
      }

      if (subscription.status === 'authorized' && subscription.last_payment_status !== 'rejected') {
        await setTenantStatus(subscription.tenant_id, 'activo');
        reactivated += 1;
        continue;
      }
      let graceUntil = subscription.grace_until;
      if (!graceUntil && ['paused', 'cancelled', 'past_due'].includes(subscription.status)) {
        const base = subscription.current_period_end || subscription.next_payment_date || new Date();
        graceUntil = addDays(base, subscription.status === 'cancelled' ? 0 : graceDays());
        await supabase.from('subscriptions').update({ grace_until: graceUntil }).eq('id', subscription.id);
      }
      if (graceUntil && new Date(graceUntil) <= new Date()) {
        await setTenantStatus(subscription.tenant_id, 'suspendido');
        suspended += 1;
      }
    }
    res.json({ ok: true, checked: subscriptions.length, suspended, reactivated });
  })
);

router.post(
  '/mercadopago/webhook',
  asyncHandler(async (req, res) => {
    const type = String(req.query.type || req.body?.type || '').toLowerCase();
    const dataId = req.query['data.id'] || req.body?.data?.id;
    if (!dataId) return res.json({ ok: true, ignored: true });
    if (!accessToken()) return res.json({ ok: true, ignored: true });

    if (type === 'payment') {
      const payment = await mercadoPago(`/v1/payments/${encodeURIComponent(dataId)}`);
      const saved = await savePayment(payment, dataId);
      console.log(`[MP] Pago ${saved.provider_payment_id} -> ${saved.status}`);
      return res.json({ ok: true });
    }
    if (type === 'subscription_preapproval' || type === 'preapproval') {
      const preapproval = await mercadoPago(`/preapproval/${encodeURIComponent(dataId)}`);
      const subscription = await saveSubscription(preapproval);
      if (subscription.status === 'authorized') await setTenantStatus(subscription.tenant_id, 'activo');
      return res.json({ ok: true });
    }
    if (type === 'subscription_authorized_payment' || type === 'authorized_payment') {
      const authorized = await mercadoPago(`/authorized_payments/${encodeURIComponent(dataId)}`);
      await processAuthorizedPayment(authorized);
      return res.json({ ok: true });
    }
    res.json({ ok: true, ignored: true });
  })
);

export default router;
