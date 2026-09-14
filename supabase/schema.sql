-- Fidelización App · Esquema Supabase
-- Ejecuta TODO este script en: Dashboard de Supabase -> SQL Editor -> New query -> Run
-- (Use la clave copy paste la extension pgcrypto ya esta habilitada en Supabase)

create extension if not exists "pgcrypto";

-- Usuarios administradores
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Productos del menú
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'General',
  title text not null,
  description text default '',
  price numeric not null default 0,
  image text default '',
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Clientes
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text default '',
  phone text default '',
  notes text default '',
  created_at timestamptz not null default now()
);

-- Pedidos
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  status text not null default 'nuevo',
  total numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_client on public.orders(client_id);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- Líneas de pedido
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  title text not null,
  price numeric not null default 0,
  qty integer not null default 1
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- Configuración (color de marca, tema, moneda...)
create table if not exists public.settings (
  key text primary key,
  value text not null
);

-- El servidor usa la SERVICE ROLE KEY (bypasea RLS), por lo que la web
-- pública no accede a Supabase directamente: todo pasa por la API Express.
-- Para un proyecto en producción se recomienda activar RLS con políticas
-- restringiendo acceso solo a la API.

-- ============================================================
-- Fase CUENTAS DE CLIENTE (perfil, historial, premios)
-- ============================================================

-- Datos de perfil del usuario registrado (editables por el cliente)
alter table public.users add column if not exists phone text default '';
alter table public.users add column if not exists preferences jsonb default '{}'::jsonb;

-- Pedido asociado a un usuario registrado (para historial y premios)
alter table public.orders add column if not exists user_id uuid references public.users(id) on delete set null;
create index if not exists idx_orders_user on public.orders(user_id);

-- Líneas de pedido referencian el producto del menú (para sugerencias "qué repetís")
alter table public.order_items add column if not exists menu_item_id uuid references public.menu_items(id) on delete set null;
create index if not exists idx_order_items_menu on public.order_items(menu_item_id);

-- Reglas de premios configurables desde Configuración (admin)
create table if not exists public.reward_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  every_orders integer not null default 10,
  type text not null default 'monto',   -- monto | descuento | regalo
  value numeric not null default 0,
  mode text not null default 'local',   -- web | local | ambos
  description text default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Cupones emitidos a clientes por cada hito cumplido
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  rule_id uuid references public.reward_rules(id) on delete set null,
  code text not null unique,
  type text not null default 'monto',
  value numeric not null default 0,
  mode text not null default 'local',
  description text default '',
  status text not null default 'activo',  -- activo | usado | vencido
  milestone integer not null default 0,  -- Nº de pedido completado que lo generó
  created_at timestamptz not null default now(),
  used_at timestamptz,
  order_id uuid references public.orders(id) on delete set null
);

create index if not exists idx_coupons_user on public.coupons(user_id);
create index if not exists idx_coupons_user_status on public.coupons(user_id, status);

-- Clientes de pedido: foto + preferencias estructuradas
alter table public.clients add column if not exists image text default '';
alter table public.clients add column if not exists preferences jsonb default '{}'::jsonb;