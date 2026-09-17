-- =============================================
-- Migración 09: Tenant "perks" (casa de PERKS)
-- Pegá este archivo en el SQL Editor de Supabase y presioná "Run".
-- Es seguro repetirlo (usa IF NOT EXISTS).
-- El usuario superadmin se crea aparte con: node src/create-superadmin.js
-- =============================================

insert into public.tenants (slug, business_name, tagline, plan, status)
select 'perks', 'PERKS', 'Fidelización inteligente para tu negocio', 'vitalicia', 'activo'
where not exists (select 1 from public.tenants where slug = 'perks');