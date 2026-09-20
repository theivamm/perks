-- =============================================
-- Migración 16: Perfil de cliente independiente por app
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- =============================================

alter table public.tenant_memberships add column if not exists phone text default '';
alter table public.tenant_memberships add column if not exists image text default '';
alter table public.tenant_memberships add column if not exists preferences jsonb default '{}'::jsonb;

-- Los roles admin/cliente pertenecen a cada membresía, no a la identidad
-- global. `superadmin` continúa siendo el único rol global.
update public.users set role = 'cliente' where role = 'admin';

-- Conserva los datos históricos solo cuando la cuenta global todavía está
-- identificada como cliente de su app original. Los demás perfiles arrancan
-- vacíos para evitar copiar datos privados entre negocios.
update public.tenant_memberships tm
set
  phone = coalesce(u.phone, ''),
  image = coalesce(u.image, ''),
  preferences = coalesce(u.preferences, '{}'::jsonb)
from public.users u
where tm.user_id = u.id
  and tm.tenant_id = u.tenant_id
  and tm.role = 'cliente'
  and u.role = 'cliente';
