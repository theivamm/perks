-- =============================================
-- Migración 07: QR único por cupón activo
-- Agrega la columna qr_code a user_coupons (el código que se
-- escanea en el local) y un índice único para evitar duplicados.
-- Pegá TODO este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo (usa IF NOT EXISTS).
-- =============================================

alter table public.user_coupons
  add column if not exists qr_code text;

create unique index if not exists uq_user_coupons_qr_code
  on public.user_coupons(qr_code) where qr_code is not null;