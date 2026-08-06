-- =========================================================================
-- Rifa a beneficio de Dayana Huerta — esquema de base de datos (Supabase)
-- Ejecuta este archivo completo en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------

do $$ begin
  create type estado_numero as enum ('disponible', 'reservado', 'pagado');
exception
  when duplicate_object then null;
end $$;

create table if not exists numeros (
  numero text primary key check (numero ~ '^[0-9]{4}$'),
  estado estado_numero not null default 'disponible',
  comprador_nombre text,
  comprador_telefono text,
  comprador_correo text,
  codigo_ticket text unique,
  fecha timestamptz,
  metodo_pago text,
  referido_por text,
  notas text,
  referencia_pago text,
  comprobante_url text,
  pais_compra text
);

-- Por si la tabla ya existía de una instalación previa sin estas columnas.
alter table numeros add column if not exists metodo_pago text;
alter table numeros add column if not exists referido_por text;
alter table numeros add column if not exists notas text;
alter table numeros add column if not exists referencia_pago text;
alter table numeros add column if not exists comprobante_url text;
alter table numeros add column if not exists pais_compra text;

-- Bucket de Storage para las capturas de pago (privado: solo admins pueden verlas).
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null
);

-- Sembrar los 1,000 números (0000-0999). Seguro de re-ejecutar.
insert into numeros (numero)
select lpad(n::text, 4, '0')
from generate_series(0, 999) as n
on conflict (numero) do nothing;

-- ---------------------------------------------------------------------
-- Seguridad (Row Level Security)
-- ---------------------------------------------------------------------

alter table numeros enable row level security;
alter table admins enable row level security;

drop policy if exists "numeros_select_publico" on numeros;
create policy "numeros_select_publico" on numeros
  for select using (true);

-- No se crean policies de insert/update/delete para numeros: toda escritura
-- pasa por las funciones "security definer" de abajo, que controlan quién
-- puede hacer qué (público solo puede reservar un número disponible;
-- marcar pagado / liberar / editar requiere ser administradora).

drop policy if exists "admins_select_propio" on admins;
create policy "admins_select_propio" on admins
  for select using (auth.uid() = user_id);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- Cualquiera puede subir un comprobante (al reservar), pero solo las
-- administradoras pueden verlos/descargarlos.
drop policy if exists "comprobantes_insert_publico" on storage.objects;
create policy "comprobantes_insert_publico" on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'comprobantes');

drop policy if exists "comprobantes_select_admin" on storage.objects;
create policy "comprobantes_select_admin" on storage.objects
  for select
  to authenticated
  using (bucket_id = 'comprobantes' and is_admin());

-- ---------------------------------------------------------------------
-- Utilidad: generar código de ticket único
-- ---------------------------------------------------------------------

create or replace function generar_codigo_ticket() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  codigo text;
begin
  loop
    codigo := 'RIFA-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
    exit when not exists (select 1 from numeros where codigo_ticket = codigo);
  end loop;
  return codigo;
end;
$$;

-- ---------------------------------------------------------------------
-- Reservar un número (público) — operación atómica.
-- Si dos personas intentan el mismo número a la vez, el UPDATE ... WHERE
-- estado = 'disponible' garantiza que solo una lo consiga; la otra
-- llamada no actualiza ninguna fila y recibe la excepción NUMERO_NO_DISPONIBLE.
-- ---------------------------------------------------------------------

create or replace function reservar_numero(
  p_numero text,
  p_nombre text,
  p_telefono text,
  p_correo text,
  p_metodo_pago text default null,
  p_referencia_pago text default null,
  p_comprobante_url text default null,
  p_pais_compra text default null
) returns numeros
language plpgsql security definer set search_path = public as $$
declare
  fila numeros;
  codigo text;
begin
  if p_nombre is null or length(trim(p_nombre)) = 0 then
    raise exception 'NOMBRE_REQUERIDO';
  end if;
  if p_telefono is null or length(trim(p_telefono)) = 0 then
    raise exception 'TELEFONO_REQUERIDO';
  end if;

  codigo := generar_codigo_ticket();

  update numeros
     set estado = 'reservado',
         comprador_nombre = trim(p_nombre),
         comprador_telefono = trim(p_telefono),
         comprador_correo = nullif(trim(coalesce(p_correo, '')), ''),
         codigo_ticket = codigo,
         fecha = now(),
         metodo_pago = nullif(trim(coalesce(p_metodo_pago, '')), ''),
         referencia_pago = nullif(trim(coalesce(p_referencia_pago, '')), ''),
         comprobante_url = nullif(trim(coalesce(p_comprobante_url, '')), ''),
         pais_compra = nullif(trim(coalesce(p_pais_compra, '')), '')
   where numero = p_numero
     and estado = 'disponible'
  returning * into fila;

  if fila is null then
    raise exception 'NUMERO_NO_DISPONIBLE';
  end if;

  return fila;
end;
$$;

grant execute on function reservar_numero(text, text, text, text, text, text, text, text) to anon, authenticated;
drop function if exists reservar_numero(text, text, text, text);

-- ---------------------------------------------------------------------
-- Reservar varios números a la vez (compra múltiple) — mismo mecanismo
-- atómico por número. Los que ya no estén disponibles simplemente se omiten
-- (no se lanza excepción para todo el lote); el cliente compara cuántos pidió
-- vs. cuántos recibió de vuelta para saber si alguno falló.
-- ---------------------------------------------------------------------

create or replace function reservar_numeros_lote(
  p_numeros text[],
  p_nombre text,
  p_telefono text,
  p_correo text,
  p_metodo_pago text default null,
  p_referencia_pago text default null,
  p_comprobante_url text default null,
  p_pais_compra text default null
) returns setof numeros
language plpgsql security definer set search_path = public as $$
begin
  if p_nombre is null or length(trim(p_nombre)) = 0 then
    raise exception 'NOMBRE_REQUERIDO';
  end if;
  if p_telefono is null or length(trim(p_telefono)) = 0 then
    raise exception 'TELEFONO_REQUERIDO';
  end if;
  if p_numeros is null or array_length(p_numeros, 1) is null then
    raise exception 'NUMEROS_REQUERIDOS';
  end if;

  return query
    update numeros
       set estado = 'reservado',
           comprador_nombre = trim(p_nombre),
           comprador_telefono = trim(p_telefono),
           comprador_correo = nullif(trim(coalesce(p_correo, '')), ''),
           codigo_ticket = generar_codigo_ticket(),
           fecha = now(),
           metodo_pago = nullif(trim(coalesce(p_metodo_pago, '')), ''),
           referencia_pago = nullif(trim(coalesce(p_referencia_pago, '')), ''),
           comprobante_url = nullif(trim(coalesce(p_comprobante_url, '')), ''),
           pais_compra = nullif(trim(coalesce(p_pais_compra, '')), '')
     where numero = any(p_numeros)
       and estado = 'disponible'
    returning *;
end;
$$;

grant execute on function reservar_numeros_lote(text[], text, text, text, text, text, text, text) to anon, authenticated;
drop function if exists reservar_numeros_lote(text[], text, text, text);

-- ---------------------------------------------------------------------
-- Acciones de administración (requieren sesión y pertenecer a "admins")
-- ---------------------------------------------------------------------

create or replace function marcar_pagado(p_numero text, p_metodo_pago text default null) returns numeros
language plpgsql security definer set search_path = public as $$
declare fila numeros;
begin
  if not is_admin() then
    raise exception 'NO_AUTORIZADO';
  end if;

  update numeros
     set estado = 'pagado',
         metodo_pago = coalesce(nullif(trim(p_metodo_pago), ''), metodo_pago)
   where numero = p_numero
  returning * into fila;

  if fila is null then
    raise exception 'NUMERO_NO_ENCONTRADO';
  end if;

  return fila;
end;
$$;

grant execute on function marcar_pagado(text, text) to authenticated;

-- Marcar varios números como pagados a la vez (ej. una compra múltiple confirmada
-- de un solo pago). El comprobante es opcional: si la administradora sube uno,
-- reemplaza al que haya (si lo hay); si no, se deja el que ya estuviera guardado.
create or replace function marcar_pagados_lote(
  p_numeros text[],
  p_metodo_pago text default null,
  p_comprobante_url text default null
) returns setof public.numeros
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'NO_AUTORIZADO';
  end if;
  if p_numeros is null or array_length(p_numeros, 1) is null then
    raise exception 'NUMEROS_REQUERIDOS';
  end if;

  return query
    update numeros
       set estado = 'pagado',
           metodo_pago = coalesce(nullif(trim(p_metodo_pago), ''), metodo_pago),
           comprobante_url = coalesce(nullif(trim(p_comprobante_url), ''), comprobante_url)
     where numero = any(p_numeros)
    returning *;
end;
$$;

grant execute on function marcar_pagados_lote(text[], text, text) to authenticated;

create or replace function liberar_numero(p_numero text) returns numeros
language plpgsql security definer set search_path = public as $$
declare fila numeros;
begin
  if not is_admin() then
    raise exception 'NO_AUTORIZADO';
  end if;

  update numeros
     set estado = 'disponible',
         comprador_nombre = null,
         comprador_telefono = null,
         comprador_correo = null,
         codigo_ticket = null,
         fecha = null,
         metodo_pago = null,
         referido_por = null,
         notas = null,
         referencia_pago = null,
         comprobante_url = null,
         pais_compra = null
   where numero = p_numero
  returning * into fila;

  if fila is null then
    raise exception 'NUMERO_NO_ENCONTRADO';
  end if;

  return fila;
end;
$$;

grant execute on function liberar_numero(text) to authenticated;

-- Registrar o editar manualmente un comprador (ej. ventas en efectivo/presenciales),
-- incluyendo método de pago, quién lo refirió y notas internas de la administradora.
create or replace function registrar_manual(
  p_numero text,
  p_nombre text,
  p_telefono text,
  p_correo text,
  p_estado estado_numero,
  p_metodo_pago text default null,
  p_referido_por text default null,
  p_notas text default null,
  p_referencia_pago text default null,
  p_pais_compra text default null
) returns numeros
language plpgsql security definer set search_path = public as $$
declare
  fila numeros;
  codigo text;
begin
  if not is_admin() then
    raise exception 'NO_AUTORIZADO';
  end if;

  select codigo_ticket into codigo from numeros where numero = p_numero;
  if codigo is null then
    codigo := generar_codigo_ticket();
  end if;

  update numeros
     set estado = p_estado,
         comprador_nombre = nullif(trim(coalesce(p_nombre, '')), ''),
         comprador_telefono = nullif(trim(coalesce(p_telefono, '')), ''),
         comprador_correo = nullif(trim(coalesce(p_correo, '')), ''),
         codigo_ticket = case when p_estado = 'disponible' then null else codigo end,
         fecha = case when p_estado = 'disponible' then null else coalesce(fecha, now()) end,
         metodo_pago = nullif(trim(coalesce(p_metodo_pago, '')), ''),
         referido_por = nullif(trim(coalesce(p_referido_por, '')), ''),
         notas = nullif(trim(coalesce(p_notas, '')), ''),
         referencia_pago = nullif(trim(coalesce(p_referencia_pago, '')), ''),
         pais_compra = nullif(trim(coalesce(p_pais_compra, '')), '')
   where numero = p_numero
  returning * into fila;

  if fila is null then
    raise exception 'NUMERO_NO_ENCONTRADO';
  end if;

  return fila;
end;
$$;

grant execute on function registrar_manual(text, text, text, text, estado_numero, text, text, text, text, text) to authenticated;
drop function if exists registrar_manual(text, text, text, text, estado_numero);
drop function if exists registrar_manual(text, text, text, text, estado_numero, text, text, text);

-- ---------------------------------------------------------------------
-- Tiempo real: publica los cambios de "numeros" a todos los clientes suscritos
-- ---------------------------------------------------------------------

do $$ begin
  alter publication supabase_realtime add table numeros;
exception
  when duplicate_object then null;
end $$;
