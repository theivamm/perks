-- =============================================
-- Migración 12: Primeros pasos (setup wizard)
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo (idempotente).
--
-- Los negocios que YA están en marcha no deben ver el asistente de
-- primeros pasos. Marcamos como completado a todo tenant existente que
-- todavía no tenga el flag. Los tenants nuevos se crean con
-- `setupCompleted = 'false'` (ver onboarding/superadmin), así que arrancan
-- con el asistente y su app vacía.
-- =============================================

insert into public.settings (tenant_id, key, value)
select t.id, 'setupCompleted', 'true'
from public.tenants t
where not exists (
  select 1
  from public.settings s
  where s.tenant_id = t.id
    and s.key = 'setupCompleted'
);
