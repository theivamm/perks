-- =============================================
-- Migración 15: Usuarios en múltiples apps
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- =============================================

create table if not exists public.tenant_memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create index if not exists idx_tenant_memberships_user on public.tenant_memberships(user_id);
create index if not exists idx_tenant_memberships_tenant_role on public.tenant_memberships(tenant_id, role);

-- Conserva la relación actual de cada cuenta.
insert into public.tenant_memberships (tenant_id, user_id, role)
select tenant_id, id, case when role = 'admin' then 'admin' else 'cliente' end
from public.users
where tenant_id is not null and role in ('admin', 'cliente')
on conflict (tenant_id, user_id) do update set role = excluded.role;

-- El dueño de una app siempre es administrador de esa app.
insert into public.tenant_memberships (tenant_id, user_id, role)
select id, owner_user_id, 'admin'
from public.tenants
where owner_user_id is not null
on conflict (tenant_id, user_id) do update set role = 'admin';

-- Recupera relaciones anteriores visibles en actividad histórica.
insert into public.tenant_memberships (tenant_id, user_id, role)
select distinct tenant_id, user_id, 'cliente' from public.orders where user_id is not null
on conflict (tenant_id, user_id) do nothing;

insert into public.tenant_memberships (tenant_id, user_id, role)
select distinct tenant_id, user_id, 'cliente' from public.user_coupons where user_id is not null
on conflict (tenant_id, user_id) do nothing;

insert into public.tenant_memberships (tenant_id, user_id, role)
select distinct tenant_id, user_id, 'cliente' from public.notifications where user_id is not null
on conflict (tenant_id, user_id) do nothing;

-- Un usuario puede tener un cupón activo distinto en cada app.
drop index if exists public.uq_user_coupons_one_active;
create unique index if not exists uq_user_coupons_one_active_per_tenant
  on public.user_coupons(tenant_id, user_id) where status = 'activado';
