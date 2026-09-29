-- =============================================
-- Migración 20: Registro de aceptación de Términos y Privacidad
-- ("firma digital" al crear una app). Pegá este archivo en el SQL Editor
-- de Supabase y presioná "Run".
-- =============================================

create table if not exists public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  email text,
  terms_version text not null,
  ip text,
  user_agent text,
  -- Momento en el que se registró la aceptación (por ahora, siempre "onboarding":
  -- al crear la app). Deja lugar a futuras re-aceptaciones si cambian las
  -- condiciones (por ejemplo, "reaceptacion").
  context text not null default 'onboarding',
  accepted_at timestamptz not null default now()
);

create index if not exists idx_legal_acceptances_tenant on public.legal_acceptances(tenant_id, accepted_at desc);
create index if not exists idx_legal_acceptances_user on public.legal_acceptances(user_id, accepted_at desc);
