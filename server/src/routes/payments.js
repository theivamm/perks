import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { getPlans, isValidPlan, DEFAULT_PLAN } from '../plans.js';
import { requireIdentity } from '../middleware/auth.js';

const router = Router();

function accessToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN || '';
}

function appOrigin(req) {
  return String(process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
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

async function savePayment(payment, fallbackId) {
  const metaPlan = payment?.metadata?.plan || payment?.external_reference;
  const plan = isValidPlan(String(metaPlan)) ? String(metaPlan) : DEFAULT_PLAN;
  const expected = getPlans().find((item) => item.id === plan);
  const paidAmount = Number(payment?.transaction_amount || 0);
  const paidCurrency = payment?.currency_id || 'ARS';
  const validTotal = expected && paidAmount >= expected.price && paidCurrency === expected.currency;
  const status = payment?.status === 'approved' && !validTotal ? 'rejected' : payment?.status || 'pending';
  const userId = payment?.metadata?.user_id || null;
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
  const { error } = await supabase.from('payments').upsert(row, { onConflict: 'provider_payment_id' });
  if (error) throw error;
  return row;
}

router.post(
  '/mercadopago/preference',
  requireIdentity,
  asyncHandler(async (req, res) => {
    if (!accessToken()) return res.status(503).json({ error: 'Mercado Pago todavía no está configurado' });
    const plan = getPlans().find((item) => item.id === req.body?.plan);
    if (!plan) return res.status(400).json({ error: 'Plan inválido' });

    const origin = appOrigin(req);
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
        payer: { email: req.user.email },
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

    res.json({ checkoutUrl: preference.init_point, preferenceId: preference.id });
  })
);

router.post(
  '/mercadopago/confirm',
  requireIdentity,
  asyncHandler(async (req, res) => {
    const paymentId = String(req.body?.paymentId || '').trim();
    if (!paymentId) return res.status(400).json({ error: 'Pago requerido' });
    if (!accessToken()) return res.status(503).json({ error: 'Mercado Pago todavía no está configurado' });

    const payment = await mercadoPago(`/v1/payments/${encodeURIComponent(paymentId)}`);
    const paymentUserId = String(payment?.metadata?.user_id || '');
    const payerEmail = String(payment?.payer?.email || '').toLowerCase();
    const belongsToUser = paymentUserId
      ? paymentUserId === req.user.id
      : payerEmail && payerEmail === String(req.user.email || '').toLowerCase();
    if (!belongsToUser) {
      return res.status(403).json({ error: 'El pago no corresponde a esta cuenta' });
    }
    const saved = await savePayment(payment, paymentId);
    res.json({ status: saved.status, approved: saved.status === 'approved', plan: saved.plan });
  })
);

router.post(
  '/mercadopago/webhook',
  asyncHandler(async (req, res) => {
    const type = req.query.type || req.body?.type;
    const dataId = req.query['data.id'] || req.body?.data?.id;
    if (String(type || '').toLowerCase() !== 'payment' || !dataId) {
      return res.json({ ok: true, ignored: true });
    }
    if (!accessToken()) {
      console.warn('[MP] Webhook recibido pero falta MERCADOPAGO_ACCESS_TOKEN');
      return res.json({ ok: true, ignored: true });
    }

    const payment = await mercadoPago(`/v1/payments/${encodeURIComponent(dataId)}`);
    const saved = await savePayment(payment, dataId);
    console.log(`[MP] Pago ${saved.provider_payment_id} -> ${saved.status} (${saved.payer_email || 'sin email'}) plan ${saved.plan}`);
    res.json({ ok: true });
  })
);

export default router;
