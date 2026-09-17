-- =============================================
-- Migración 11: Soporte (chat admin <-> PERKS)
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- =============================================

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sender_role text not null default 'admin',   -- admin | superadmin
  sender_id uuid,
  sender_name text default '',
  body text not null,
  read_by_admin boolean not null default false,
  read_by_superadmin boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_support_messages_tenant on public.support_messages(tenant_id, created_at);
create index if not exists idx_support_messages_unread_admin on public.support_messages(tenant_id) where read_by_admin = false;
create index if not exists idx_support_messages_unread_super on public.support_messages(tenant_id) where read_by_superadmin = false;
