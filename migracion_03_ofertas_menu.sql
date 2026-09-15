-- =============================================
-- Migración 03: Ofertas especiales / favoritos en el menú
-- Pegá TODO este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo (usa IF NOT EXISTS).
-- =============================================

alter table public.menu_items add column if not exists featured boolean not null default false;
alter table public.menu_items add column if not exists featured_label text default '';
