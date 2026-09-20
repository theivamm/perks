-- =============================================
-- Migración 17: Referencia legacy de usuarios a tenants
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo.
--
-- La relación real usuario/app vive en tenant_memberships. users.tenant_id
-- queda temporalmente como referencia legacy y no debe impedir que una app
-- se elimine ni provocar que se borre la identidad global del usuario.
-- =============================================

alter table public.users alter column tenant_id drop not null;

alter table public.users drop constraint if exists fk_tenants_users;
alter table public.users add constraint fk_tenants_users
  foreign key (tenant_id) references public.tenants(id) on delete set null;
