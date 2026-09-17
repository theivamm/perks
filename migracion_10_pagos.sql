-- =============================================
-- Migración 10: Pagos (MercadoPago) para onboarding
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- =============================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercadopago',
  provider_payment_id text unique,
  payer_email text,
  plan text not null default 'mensual',       -- mensual | vitalicia
  amount numeric default 0,
  currency text default 'ARS',
  status text not null default 'pending',     -- pending | approved | rejected | cancelled
  tenant_id uuid references public.tenants(id) on delete set null,
  raw jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_email on public.payments(lower(payer_email));
create index if not exists idx_payments_status on public.payments(status);