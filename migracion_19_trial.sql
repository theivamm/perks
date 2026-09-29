-- =============================================
-- Migración 19: Prueba gratuita de 7 días (plan mensual)
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- =============================================

-- Fecha en la que termina la prueba gratuita de una suscripción (si aplica).
-- Mientras esta fecha sea futura, Mercado Pago tiene la tarjeta autorizada
-- pero todavía no cobró nada; el primer cobro real ocurre automáticamente
-- ese día (o el negocio cancela antes y no se le cobra).
alter table public.subscriptions add column if not exists trial_ends_at timestamptz;

create index if not exists idx_subscriptions_trial on public.subscriptions(trial_ends_at) where trial_ends_at is not null;
