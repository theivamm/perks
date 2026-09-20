// Planes de PERKS usados para crear preferencias de Mercado Pago Checkout Pro.
export function getPlans() {
  return [
    {
      id: 'mensual',
      name: 'Mensual',
      period: 'por mes',
      price: Number(process.env.PLAN_MONTHLY_PRICE || 30000),
      currency: 'ARS',
    },
    {
      id: 'vitalicia',
      name: 'De por vida',
      period: 'pago único',
      price: Number(process.env.PLAN_LIFETIME_PRICE || 300000),
      currency: 'ARS',
    },
  ];
}

export const DEFAULT_PLAN = 'mensual';

export function isValidPlan(plan) {
  return getPlans().some((p) => p.id === plan);
}
