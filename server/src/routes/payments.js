import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { isValidPlan, DEFAULT_PLAN } from '../plans.js';

const router = Router();

// Webhook de MercadoPago: cuando se aprueba un pago, guardamos el email del
// comprador y el plan para habilitar el onboarding automáticamente.
// Configurar en MercadoPago > Notificaciones la URL:
//   https://TU-SERVIDOR/api/payments/mercadopago/webhook
router.post(
  '/mercadopago/webhook',
  asyncHandler(async (req, res) => {
    const type = req.query.type || (req.body && req.body.type);
    const dataId = req.query['data.id'] || (req.body && req.body.data && req.body.data.id);

    if (String(type || '').toLowerCase() !== 'payment' || !dataId) {
      return res.json({ ok: true, ignored: true });
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      console.warn('[MP] Webhook recibido pero falta MERCADOPAGO_ACCESS_TOKEN');
      return res.json({ ok: true, ignored: true });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!mpRes.ok) {
      console.warn('[MP] No se pudo consultar el pago', dataId, mpRes.status);
      return res.status(202).json({ ok: false });
    }

    const pay = await mpRes.json();
    const metaPlan = pay?.metadata?.plan || pay?.external_reference;
    const plan = isValidPlan(String(metaPlan)) ? String(metaPlan) : DEFAULT_PLAN;

    const row = {
      provider: 'mercadopago',
      provider_payment_id: String(pay.id || dataId),
      payer_email: pay?.payer?.email ? String(pay.payer.email).toLowerCase() : null,
      plan,
      amount: Number(pay?.transaction_amount || 0),
      currency: pay?.currency_id || 'ARS',
      status: pay?.status || 'pending',
      raw: pay,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('payments')
      .upsert(row, { onConflict: 'provider_payment_id' });
    if (error) throw error;

    console.log(
      `[MP] Pago ${row.provider_payment_id} → ${row.status} (${row.payer_email || 'sin email'}) plan ${row.plan}`
    );
    res.json({ ok: true });
  })
);

export default router;
