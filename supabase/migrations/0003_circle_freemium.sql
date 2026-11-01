-- =============================================================================
-- Cerca · Migración 0003 · "Tu Círculo" + freemium permanente + reacciones
--
-- Modelo de lanzamiento (decisión de producto, prevalece sobre CONTEXT.md v2.0):
--   · GRATIS PARA SIEMPRE: 1 postal al día por círculo, 1 ser querido acompañado,
--     saludo diario + aviso básico en la app, historial de los últimos 14 días.
--   · CÍRCULO PLUS: postales ilimitadas, hasta 4 seres queridos, recuerdos sin límite,
--     doble recordatorio, avisos push/email a todos los acompañantes y modo vacaciones.
-- Los límites se aplican AQUÍ (servidor). La app solo los muestra.
-- =============================================================================

-- 1. Sin prueba de 14 días: todo círculo nace en el plan gratuito.
alter table public.families alter column plan_status set default 'free_limited';
update public.families set plan_status = 'free_limited' where plan_status = 'trialing';

-- 2. Etiqueta abierta de la relación: Madre, Abuela, Vecina especial, Madrina…
alter table public.elder_monitors
  add column relationship_label text check (char_length(relationship_label) <= 30);
grant insert (relationship_label), update (relationship_label) on public.elder_monitors to authenticated;

-- 3. ¿Tiene el círculo Círculo Plus? Única fuente de verdad del plan en la base de datos.
create function private.family_has_plus(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.families f
    where f.id = p_family_id
      and (
        (f.plan_status = 'active_paid' and (f.paid_until is null or f.paid_until > now()))
        or f.plan_status = 'grace_period'
      )
  );
$$;

-- 4. Seres queridos: 1 gratis, hasta 4 con Plus.
create or replace function private.enforce_elder_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.elder_monitors em
  where em.family_id = new.family_id;

  if v_count >= 4 then
    raise exception 'A family can have at most 4 elders' using errcode = 'P0001';
  end if;
  if v_count >= 1 and not private.family_has_plus(new.family_id) then
    raise exception 'Free plan allows 1 loved one' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- 5. Una postal gratis al día por círculo (día natural de la península).
create function private.enforce_daily_postcard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.family_has_plus(new.family_id) then
    return new;
  end if;
  if exists (
    select 1
    from public.moments m
    where m.family_id = new.family_id
      and (m.created_at at time zone 'Europe/Madrid')::date = (now() at time zone 'Europe/Madrid')::date
  ) then
    raise exception 'Daily free postcard already used' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger enforce_daily_postcard before insert on public.moments
  for each row execute function private.enforce_daily_postcard();

-- 6. Historial: el plan gratuito ve los últimos 14 días; Círculo Plus, todo.
drop policy "moments: members read" on public.moments;
create policy "moments: members read" on public.moments
  for select to authenticated
  using (
    private.my_role(family_id) is not null
    and (private.family_has_plus(family_id) or created_at > now() - interval '14 days')
  );

-- Cuántos recuerdos antiguos quedan bloqueados (para enseñar "🔒 23 recuerdos más").
create function public.count_locked_moments(p_family_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when private.my_role(p_family_id) is null or private.family_has_plus(p_family_id) then 0
    else (
      select count(*)::integer
      from public.moments m
      where m.family_id = p_family_id
        and m.created_at <= now() - interval '14 days'
    )
  end;
$$;

-- 7. Reacciones rápidas a la postal (❤️ 🥰 ☀️ 👏). Una de cada tipo por persona.
create table public.moment_reactions (
  moment_id  uuid not null references public.moments (id) on delete cascade,
  family_id  uuid not null references public.families (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  emoji      text not null check (emoji in ('❤️', '🥰', '☀️', '👏')),
  created_at timestamptz not null default now(),
  primary key (moment_id, user_id, emoji)
);
create index moment_reactions_family_id_idx on public.moment_reactions (family_id);

alter table public.moment_reactions enable row level security;
revoke all on public.moment_reactions from anon;
revoke insert, update, delete on public.moment_reactions from authenticated;
grant insert (moment_id, family_id, emoji), delete on public.moment_reactions to authenticated;

create policy "moment_reactions: members read" on public.moment_reactions
  for select to authenticated
  using (private.my_role(family_id) is not null);
create policy "moment_reactions: members react" on public.moment_reactions
  for insert to authenticated
  with check (
    private.my_role(family_id) is not null
    and user_id = (select auth.uid())
    and exists (
      select 1 from public.moments m
      where m.id = moment_id and m.family_id = moment_reactions.family_id
    )
  );
create policy "moment_reactions: remove own" on public.moment_reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- 8. Permisos de las funciones nuevas.
revoke execute on function private.family_has_plus(uuid) from public, anon;
grant execute on function private.family_has_plus(uuid) to authenticated, service_role;
revoke execute on function private.enforce_daily_postcard() from public, anon;
revoke execute on function public.count_locked_moments(uuid) from public, anon;
grant execute on function public.count_locked_moments(uuid) to authenticated;
