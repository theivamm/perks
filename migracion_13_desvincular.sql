-- =============================================
-- Migración 13: Desvincular usuarios de una app (superadmin)
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo.
--
-- Permite que un usuario quede sin app (tenant_id NULL) cuando el
-- superadmin lo desvincula. Antes la columna era NOT NULL y solo se
-- podía eliminar la cuenta entera.
-- =============================================

alter table public.users alter column tenant_id drop not null;