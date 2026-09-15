-- =============================================
-- Migraciones pendientes para Fidelización App
-- Pegá TODO este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo (todo usa IF NOT EXISTS).
-- =============================================

-- 1) Columna de código QR único por usuario
alter table public.users add column if not exists qr_code text;
create unique index if not exists idx_users_qr_code on public.users(qr_code);

-- 2) Tabla de notificaciones
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'info',
  title text not null default '',
  body text not null default '',
  icon text not null default 'bell',
  link text not null default '',
  data jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

-- 3) Destacados / ofertas especiales en el menú
alter table public.menu_items add column if not exists featured boolean not null default false;
alter table public.menu_items add column if not exists featured_label text default '';