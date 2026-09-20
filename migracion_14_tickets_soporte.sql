-- =============================================
-- Migración 14: Sistema de tickets de soporte
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- =============================================

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  subject text not null,
  category text not null default 'general',
  status text not null default 'nuevo', -- nuevo | abierto | respondido | cerrado
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_messages add column if not exists ticket_id uuid references public.support_tickets(id) on delete cascade;

create index if not exists idx_support_tickets_tenant on public.support_tickets(tenant_id, updated_at desc);
create index if not exists idx_support_messages_ticket on public.support_messages(ticket_id, created_at);
