-- =============================================
-- Migración 18: Suscripciones mensuales automáticas
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- =============================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercadopago',
  provider_subscription_id text unique not null,
  user_id uuid references public.users(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  plan text not null default 'mensual',
  status text not null default 'pending',
  provider_status text default 'pending',
  payer_email text,
  amount numeric not null default 0,
  currency text not null default 'ARS',
  checkout_url text default '',
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_payment_date timestamptz,
  grace_until timestamptz,
  last_payment_status text,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments add column if not exists subscription_id uuid references public.subscriptions(id) on delete set null;

create index if not exists idx_subscriptions_user on public.subscriptions(user_id, created_at desc);
create index if not exists idx_subscriptions_tenant on public.subscriptions(tenant_id, updated_at desc);
create index if not exists idx_subscriptions_status on public.subscriptions(status, next_payment_date);
create index if not exists idx_payments_subscription on public.payments(subscription_id, created_at desc);
