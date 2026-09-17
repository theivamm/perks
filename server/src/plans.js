// Planes de PERKS. Los links de pago se configuran desde el panel de MercadoPago
// (MercadoPago > Link de pago) y se pegan en el .env del servidor.
export function getPlans() {
  return [
    {
      id: 'mensual',
      name: 'Mensual',
      period: 'por mes',
      price: Number(process.env.PLAN_MONTHLY_PRICE || 30000),
      currency: 'ARS',
      link: process.env.MERCADOPAGO_LINK_MENSUAL || '',
    },
    {
      id: 'vitalicia',
      name: 'De por vida',
      period: 'pago único',
      price: Number(process.env.PLAN_LIFETIME_PRICE || 300000),
      currency: 'ARS',
      link: process.env.MERCADOPAGO_LINK_VITALICIA || '',
    },
  ];
}

export const DEFAULT_PLAN = 'mensual';

export function isValidPlan(plan) {
  return getPlans().some((p) => p.id === plan);
}
