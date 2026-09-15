-- =============================================
-- Migración 04: % de descuento en ofertas del menú
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo (usa IF NOT EXISTS).
-- =============================================

alter table public.menu_items add column if not exists discount numeric not null default 0;