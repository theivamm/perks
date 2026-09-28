// Planes de PERKS usados para crear preferencias de Mercado Pago Checkout Pro.
export function getPlans() {
  return [
    {
      id: 'mensual',
      name: 'Mensual',
      period: 'por mes',
      // TEMPORAL: precio bajado a $100 para probar un cobro real de punta a
      // punta. Volver a 30000 (o setear PLAN_MONTHLY_PRICE) después de probar.
      price: Number(process.env.PLAN_MONTHLY_PRICE || 100),
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
