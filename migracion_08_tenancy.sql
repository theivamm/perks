-- =============================================
-- Migración 08: Multi-tenant (SaaS PERKS)
-- Pegá TODO este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo (usa IF NOT EXISTS).
--
-- Crea la tabla `tenants`, identifica el perfil actual (SHANTI-CHI) como
-- el primer tenant y agrega `tenant_id` a todas las tablas de negocio.
-- =============================================

-- 1) Tabla de tenants (cada negocio es una "app" dentro de PERKS)
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  business_name text not null,
  tagline text default '',
  plan text not null default 'mensual',      -- mensual | vitalicia
  status text not null default 'activo',     -- activo | suspendido | pendiente
  owner_user_id uuid,
  created_at timestamptz not null default now()
);

-- 2) El perfil ya vendido y activo se transforma en el primer tenant.
--    El business_name sale de la configuración existente si está cargado.
insert into public.tenants (slug, business_name, tagline, plan, status)
select
  'shanti-chi',
  coalesce((select value from public.settings where key = 'businessName'), 'SHANTI-CHI DECO STORE'),
  coalesce((select value from public.settings where key = 'tagline'), ''),
  'vitalicia',
  'activo'
where not exists (select 1 from public.tenants where slug = 'shanti-chi');

-- 3) Columna tenant_id en todas las tablas de negocio
alter table public.users add column if not exists tenant_id uuid;
alter table public.menu_items add column if not exists tenant_id uuid;
alter table public.clients add column if not exists tenant_id uuid;
alter table public.orders add column if not exists tenant_id uuid;
alter table public.order_items add column if not exists tenant_id uuid;
alter table public.settings add column if not exists tenant_id uuid;
alter table public.reward_rules add column if not exists tenant_id uuid;
alter table public.notifications add column if not exists tenant_id uuid;
alter table public.loyalty_coupons add column if not exists tenant_id uuid;
alter table public.user_coupons add column if not exists tenant_id uuid;
alter table public.coupons add column if not exists tenant_id uuid;  -- tabla legacy (si existe)

-- 4) Backfill: todos los datos actuales pertenecen al tenant shanti-chi
update public.users           set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.users.tenant_id is null;
update public.menu_items      set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.menu_items.tenant_id is null;
update public.clients         set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.clients.tenant_id is null;
update public.orders          set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.orders.tenant_id is null;
update public.order_items     set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.order_items.tenant_id is null;
update public.settings        set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.settings.tenant_id is null;
update public.reward_rules    set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.reward_rules.tenant_id is null;
update public.notifications   set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.notifications.tenant_id is null;
update public.loyalty_coupons set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.loyalty_coupons.tenant_id is null;
update public.user_coupons    set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.user_coupons.tenant_id is null;
update public.coupons         set tenant_id = t.id from public.tenants t where t.slug = 'shanti-chi' and public.coupons.tenant_id is null;

-- 5) settings pasa a key/value POR TENANT (clave primaria compuesta)
alter table public.settings drop constraint if exists settings_pkey;
alter table public.settings alter column tenant_id set not null;
alter table public.settings add constraint settings_pk primary key (tenant_id, key);

-- 6) Integridad: FKs e índices de tenant
alter table public.users           alter column tenant_id set not null;
alter table public.menu_items      alter column tenant_id set not null;
alter table public.clients         alter column tenant_id set not null;
alter table public.orders          alter column tenant_id set not null;
alter table public.order_items     alter column tenant_id set not null;
alter table public.reward_rules    alter column tenant_id set not null;
alter table public.notifications   alter column tenant_id set not null;
alter table public.loyalty_coupons alter column tenant_id set not null;
alter table public.user_coupons    alter column tenant_id set not null;

alter table public.users           add constraint fk_tenants_users           foreign key (tenant_id) references public.tenants(id);
alter table public.menu_items      add constraint fk_tenants_menu_items      foreign key (tenant_id) references public.tenants(id);
alter table public.clients         add constraint fk_tenants_clients         foreign key (tenant_id) references public.tenants(id);
alter table public.orders          add constraint fk_tenants_orders          foreign key (tenant_id) references public.tenants(id);
alter table public.order_items     add constraint fk_tenants_order_items     foreign key (tenant_id) references public.tenants(id);
alter table public.settings        add constraint fk_tenants_settings        foreign key (tenant_id) references public.tenants(id);
alter table public.reward_rules    add constraint fk_tenants_reward_rules    foreign key (tenant_id) references public.tenants(id);
alter table public.notifications   add constraint fk_tenants_notifications   foreign key (tenant_id) references public.tenants(id);
alter table public.loyalty_coupons add constraint fk_tenants_loyalty_coupons foreign key (tenant_id) references public.tenants(id);
alter table public.user_coupons    add constraint fk_tenants_user_coupons    foreign key (tenant_id) references public.tenants(id);

create index if not exists idx_users_tenant           on public.users(tenant_id);
create index if not exists idx_menu_items_tenant      on public.menu_items(tenant_id);
create index if not exists idx_clients_tenant         on public.clients(tenant_id);
create index if not exists idx_orders_tenant          on public.orders(tenant_id);
create index if not exists idx_order_items_tenant     on public.order_items(tenant_id);
create index if not exists idx_reward_rules_tenant    on public.reward_rules(tenant_id);
create index if not exists idx_notifications_tenant   on public.notifications(tenant_id);
create index if not exists idx_loyalty_coupons_tenant on public.loyalty_coupons(tenant_id);
create index if not exists idx_user_coupons_tenant    on public.user_coupons(tenant_id);

-- 7) El administrador actual queda como dueño del tenant shanti-chi
update public.tenants
set owner_user_id = (select u.id from public.users u where u.role = 'admin' order by u.created_at limit 1)
where slug = 'shanti-chi' and owner_user_id is null;

alter table public.tenants add constraint fk_tenants_owner
  foreign key (owner_user_id) references public.users(id) on delete set null;