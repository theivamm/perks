-- =============================================
-- Migración 06: Limpiar usuarios para arrancar de cero
-- ELIMINA todos los clientes y su actividad (pedidos, cupones, notificaciones)
-- y también sus cuentas de Supabase Auth, para que puedan volver a registrarse
-- con el mismo email/Google como usuarios nuevos.
-- OJO: NO toca usuarios administradores, NI el menú, NI la configuración.
-- Pegá TODO este archivo en el SQL Editor de Supabase y presioná "Run".
-- =============================================

-- Guarda los ids de todos los clientes antes de borrar nada
create temp table _client_ids on commit drop as
  select id from public.users where role = 'cliente';

-- Elimina sus cuentas de autenticación (Supabase Auth)
delete from auth.users where id in (select id from _client_ids);

-- Elimina la actividad y los registros del lado público
delete from public.order_items;
delete from public.orders;
delete from public.coupons;         -- cupones viejos
delete from public.user_coupons;
delete from public.notifications;
delete from public.clients;         -- clientes de mostrador
delete from public.reward_rules;    -- reglas viejas
delete from public.users where role = 'cliente';