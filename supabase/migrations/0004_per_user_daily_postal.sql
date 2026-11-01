-- =============================================================================
-- Cerca · Migración 0004 · 1 postal gratis al día POR PERSONA + capa social
--
--   · Plan gratuito: cada acompañante o miembro puede mandar 1 postal al día
--     (antes era 1 por círculo). Con Círculo Plus, ilimitadas.
--   · Mini-comentarios de cariño (1 línea, máx. 100 caracteres).
--   · «Animar 👋»: un toque al día de una persona a otra para que suba su postal.
--   · Los acompañantes pueden editar la relación de un miembro y quitarlo del círculo.
-- =============================================================================

-- 1. Límite por (círculo, autor, día natural de Madrid).
create or replace function private.enforce_daily_postcard()
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
      and m.author_id = new.author_id
      and (m.created_at at time zone 'Europe/Madrid')::date = (now() at time zone 'Europe/Madrid')::date
  ) then
    raise exception 'Daily free postcard already used' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create index if not exists moments_family_author_created_idx
  on public.moments (family_id, author_id, created_at desc);

-- 2. Acompañantes y miembros suben postales con los mismos permisos (la persona acompañada, no).
drop policy if exists "moments: family uploads" on public.moments;
create policy "moments: circle members upload" on public.moments
  for insert to authenticated
  with check (private.my_role(family_id) in ('admin', 'member') and author_id = (select auth.uid()));

-- 3. Mini-comentarios de cariño.
create table public.moment_comments (
  id         uuid primary key default gen_random_uuid(),
  moment_id  uuid not null references public.moments (id) on delete cascade,
  family_id  uuid not null references public.families (id) on delete cascade,
  author_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 100),
  created_at timestamptz not null default now()
);
create index moment_comments_moment_idx on public.moment_comments (moment_id, created_at);
create index moment_comments_family_idx on public.moment_comments (family_id);

alter table public.moment_comments enable row level security;
revoke all on public.moment_comments from anon;
revoke insert, update, delete on public.moment_comments from authenticated;
grant insert (moment_id, family_id, body), delete on public.moment_comments to authenticated;

create policy "moment_comments: members read" on public.moment_comments
  for select to authenticated
  using (private.my_role(family_id) is not null);
create policy "moment_comments: circle members write" on public.moment_comments
  for insert to authenticated
  with check (
    private.my_role(family_id) in ('admin', 'member')
    and author_id = (select auth.uid())
    and exists (select 1 from public.moments m where m.id = moment_id and m.family_id = moment_comments.family_id)
  );
create policy "moment_comments: author or admin delete" on public.moment_comments
  for delete to authenticated
  using (author_id = (select auth.uid()) or private.my_role(family_id) = 'admin');

-- 4. «Animar 👋»: un toque al día por remitente y destinatario. El envío del push lo hace
--    evaluate-checkins (marca notified_at para no repetirlo).
create table public.member_nudges (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references public.families (id) on delete cascade,
  from_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  to_user_id   uuid not null references auth.users (id) on delete cascade,
  local_date   date not null default ((now() at time zone 'Europe/Madrid')::date),
  notified_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (family_id, from_user_id, to_user_id, local_date),
  constraint member_nudges_not_self check (from_user_id <> to_user_id)
);
create index member_nudges_pending_idx on public.member_nudges (created_at) where notified_at is null;

alter table public.member_nudges enable row level security;
revoke all on public.member_nudges from anon;
revoke insert, update, delete on public.member_nudges from authenticated;
grant insert (family_id, to_user_id) on public.member_nudges to authenticated;

create policy "member_nudges: members read" on public.member_nudges
  for select to authenticated
  using (private.my_role(family_id) is not null);
create policy "member_nudges: circle members send" on public.member_nudges
  for insert to authenticated
  with check (
    private.my_role(family_id) in ('admin', 'member')
    and from_user_id = (select auth.uid())
    and exists (
      select 1 from public.family_members fm
      where fm.family_id = member_nudges.family_id
        and fm.user_id = member_nudges.to_user_id
        and fm.role <> 'elder'
    )
  );

-- 5. Gestión de miembros por los acompañantes (desde el menú ⋯ de cada persona).
create function public.set_member_label(p_member_id uuid, p_label text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target public.family_members%rowtype;
begin
  select * into v_target from public.family_members fm where fm.id = p_member_id;
  if not found
     or not private.is_permanent_user()
     or private.my_role(v_target.family_id) is distinct from 'admin' then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(p_label, ''))) > 40 then
    raise exception 'Label too long' using errcode = '22023';
  end if;
  update public.family_members fm
  set display_role_label = nullif(btrim(coalesce(p_label, '')), '')
  where fm.id = p_member_id;
end;
$$;

create function public.remove_member(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target public.family_members%rowtype;
begin
  select * into v_target from public.family_members fm where fm.id = p_member_id for update;
  if not found
     or not private.is_permanent_user()
     or private.my_role(v_target.family_id) is distinct from 'admin'
     or v_target.role = 'elder'
     or v_target.user_id = auth.uid() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if v_target.role = 'admin'
     and (select count(*) from public.family_members fm
          where fm.family_id = v_target.family_id and fm.role = 'admin') <= 1 then
    raise exception 'A family needs at least one admin' using errcode = 'P0001';
  end if;
  delete from public.family_members fm where fm.id = p_member_id;
end;
$$;

revoke execute on function public.set_member_label(uuid, text) from public, anon;
revoke execute on function public.remove_member(uuid) from public, anon;
grant execute on function public.set_member_label(uuid, text) to authenticated;
grant execute on function public.remove_member(uuid) to authenticated;
