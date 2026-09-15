-- =============================================
-- Migración 05: Nuevo sistema de cupones por puntos
-- Pegá TODO este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo (usa IF NOT EXISTS).
-- =============================================

-- Catálogo de cupones creado por el administrador
create table if not exists public.loyalty_coupons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  type text not null default 'monto',       -- monto | descuento | regalo
  value numeric not null default 0,
  target_points integer not null default 10,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Progreso de cada usuario con sus cupones
create table if not exists public.user_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  coupon_id uuid references public.loyalty_coupons(id) on delete set null,
  title text not null,
  description text default '',
  type text not null default 'monto',
  value numeric not null default 0,
  target_points integer not null default 10,
  points integer not null default 0,
  status text not null default 'activado',  -- activado | completado | canjeado
  code text,
  activated_at timestamptz not null default now(),
  completed_at timestamptz,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_coupons_user on public.user_coupons(user_id);
create index if not exists idx_user_coupons_code on public.user_coupons(code);

-- Garantiza que el usuario tenga como máximo UN cupón activo a la vez
create unique index if not exists uq_user_coupons_one_active
  on public.user_coupons(user_id) where status = 'activado';