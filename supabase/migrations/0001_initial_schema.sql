-- =============================================================================
-- Cerca · Migración 0001 · Esquema inicial del MVP v1.0 + RLS + Storage
-- Fuente: CONTEXT.md (Blueprint v2.0, secciones 3 y 5) y AGENTS.md
--
-- Decisión de equipo (opción B): el móvil del mayor abre una sesión ANÓNIMA de
-- Supabase y queda unido a su ficha (elder_monitors) al canjear el código de
-- 6 dígitos. Por eso el nombre y la zona horaria del mayor viven en
-- elder_monitors: el hijo lo da de alta antes de que exista su móvil.
--
-- Llegará en migraciones posteriores (en su semana):
--   · 0002_cron_setup.sql: pg_cron + pg_net para evaluate-checkins y cleanup-expired-media
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;


-- 1. TIPOS ---------------------------------------------------------------------

create type public.member_role as enum ('admin', 'member', 'elder');
create type public.plan_status as enum ('trialing', 'free_limited', 'active_paid', 'grace_period');
create type public.checkin_status as enum (
  'pending', 'ok', 'reminded_1', 'reminded_2', 'alerted_admins', 'resolved_by_admin'
);
create type public.checkin_source as enum ('morning_button', 'photo_opened', 'manual_admin');
create type public.push_platform as enum ('ios', 'android');


-- 2. FAMILIAS Y PERSONAS -------------------------------------------------------

-- Hijos, nietos y demás familiares (cuentas Apple / Google / Email OTP).
-- El móvil del mayor NO tiene fila aquí: sus datos están en elder_monitors.
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_path  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.families (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null check (char_length(name) between 1 and 60),
  created_by             uuid references auth.users (id) on delete set null,
  -- Plan: solo lo escriben el webhook de RevenueCat y los crons (service role).
  plan_status            public.plan_status not null default 'trialing',
  trial_ends_at          timestamptz not null default (now() + interval '14 days'),
  paid_until             timestamptz,
  revenuecat_app_user_id text unique,
  -- Enlace de invitación para WhatsApp. Quien entra con él es 'member'.
  invite_token           uuid not null unique default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ÚNICA fuente de verdad de "quién pertenece a qué familia y con qué rol".
-- Todas las políticas RLS se apoyan en esta tabla.
create table public.family_members (
  id                      uuid primary key default gen_random_uuid(),
  family_id               uuid not null references public.families (id) on delete cascade,
  user_id                 uuid not null references auth.users (id) on delete cascade,
  role                    public.member_role not null,
  display_role_label      text check (char_length(display_role_label) <= 40),
  receive_critical_emails boolean not null default false,
  joined_at               timestamptz not null default now(),
  unique (family_id, user_id)
);
create index family_members_user_id_idx on public.family_members (user_id);

-- Ficha y horarios de cada mayor (máximo 4 por familia).
-- elder_user_id se rellena al canjear el código de vinculación.
create table public.elder_monitors (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references public.families (id) on delete cascade,
  elder_user_id    uuid unique references auth.users (id) on delete set null,
  display_name     text not null check (char_length(display_name) between 1 and 40),
  avatar_path      text,
  timezone         text not null default 'Europe/Madrid'
                   check (timezone in ('Europe/Madrid', 'Atlantic/Canary')),
  phone_for_call   text check (phone_for_call ~ '^\+?[0-9]{9,15}$'),
  window_start     time not null default '07:30',
  reminder_1_at    time not null default '10:30',
  reminder_2_at    time not null default '11:05',
  admin_alert_at   time not null default '11:30',
  -- Bitmask de días activos: lunes = 1, martes = 2, … domingo = 64. 127 = todos.
  active_days_mask smallint not null default 127 check (active_days_mask between 1 and 127),
  -- Modo vacaciones / acompañado: sin recordatorios ni avisos hasta esta fecha incluida.
  paused_until     date,
  is_enabled       boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint elder_monitors_schedule_order check (
    window_start < reminder_1_at and reminder_1_at < reminder_2_at and reminder_2_at < admin_alert_at
  )
);
create index elder_monitors_family_id_idx on public.elder_monitors (family_id);

-- Códigos de un solo uso (30 min) para vincular el móvil de un mayor.
-- RLS sin políticas: se crean vía RPC y se canjean vía Edge Function.
create table public.pairing_codes (
  id               uuid primary key default gen_random_uuid(),
  code_6_digits    text not null check (code_6_digits ~ '^[0-9]{6}$'),
  family_id        uuid not null references public.families (id) on delete cascade,
  elder_monitor_id uuid not null references public.elder_monitors (id) on delete cascade,
  created_by       uuid references auth.users (id) on delete set null,
  expires_at       timestamptz not null,
  used_at          timestamptz,
  used_by          uuid references auth.users (id) on delete set null,
  created_at       timestamptz not null default now()
);
create unique index pairing_codes_active_code_idx
  on public.pairing_codes (code_6_digits) where used_at is null;

-- Un usuario puede tener varios dispositivos (móvil + iPad).
create table public.device_push_tokens (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null unique,
  platform        public.push_platform not null,
  updated_at      timestamptz not null default now()
);
create index device_push_tokens_user_id_idx on public.device_push_tokens (user_id);


-- 3. FOTOS DEL DÍA (v1.0: solo foto + pie de foto) -----------------------------

create table public.moments (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references public.families (id) on delete cascade,
  author_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  storage_path text not null unique,
  caption      text check (char_length(caption) <= 140),
  -- null = se conserva siempre. La lógica del plan gratuito llega en la semana 4.
  expires_on   date,
  created_at   timestamptz not null default now(),
  constraint moments_path_in_family_folder check (storage_path like family_id::text || '/%')
);
create index moments_family_created_idx on public.moments (family_id, created_at desc);


-- 4. CHECK-IN DIARIO (protocolo de tranquilidad) -------------------------------

-- Una fila por mayor y día local. Solo la escriben las RPC y evaluate-checkins.
-- El UNIQUE (elder_monitor_id, local_date) es la base de la idempotencia.
create table public.daily_checkins (
  id                  uuid primary key default gen_random_uuid(),
  elder_monitor_id    uuid not null references public.elder_monitors (id) on delete cascade,
  family_id           uuid not null references public.families (id) on delete cascade,
  local_date          date not null,
  status              public.checkin_status not null default 'pending',
  confirmed_at        timestamptz,
  source              public.checkin_source,
  resolved_by_user_id uuid references auth.users (id) on delete set null,
  resolution_note     text check (char_length(resolution_note) <= 200),
  -- Cuándo se avisó a la familia de que el mayor ya saludó (evita avisos duplicados).
  family_notified_at  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (elder_monitor_id, local_date)
);
create index daily_checkins_family_date_idx on public.daily_checkins (family_id, local_date desc);


-- 5. FUNCIONES AUXILIARES (esquema private: invisible para la API) -------------

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Máximo 4 mayores por familia (CONTEXT.md 3.1).
create function private.enforce_elder_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.elder_monitors em where em.family_id = new.family_id) >= 4 then
    raise exception 'A family can have at most 4 elders' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Rol del usuario actual en una familia (null si no pertenece).
-- security definer: lee family_members sin pasar por su propia RLS (evita recursión).
create function private.my_role(p_family_id uuid)
returns public.member_role
language sql
stable
security definer
set search_path = ''
as $$
  select fm.role
  from public.family_members fm
  where fm.family_id = p_family_id
    and fm.user_id = (select auth.uid());
$$;

create function private.shares_family_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members mine
    join public.family_members theirs on theirs.family_id = mine.family_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = p_user_id
  );
$$;

-- true si es un familiar con cuenta real (NO el móvil anónimo del mayor).
create function private.is_permanent_user()
returns boolean
language sql
stable
set search_path = ''
as $$
  select (select auth.uid()) is not null
     and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false;
$$;

-- Rol del usuario actual en la familia dueña de una ruta {family_id}/{uuid}.webp.
-- Compara como texto para que una ruta mal formada devuelva null en vez de un error.
create function private.my_role_for_storage_path(p_object_name text)
returns public.member_role
language sql
stable
security definer
set search_path = ''
as $$
  select fm.role
  from public.family_members fm
  where fm.user_id = (select auth.uid())
    and fm.family_id::text = (storage.foldername(p_object_name))[1];
$$;

create trigger enforce_elder_limit before insert on public.elder_monitors
  for each row execute function private.enforce_elder_limit();

create trigger set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.families
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.elder_monitors
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.daily_checkins
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.device_push_tokens
  for each row execute function private.set_updated_at();


-- 6. PRIVILEGIOS POR COLUMNA ---------------------------------------------------
-- Supabase concede ALL por defecto. Lo recortamos para que, aunque una política
-- RLS permita un UPDATE, la app solo pueda tocar las columnas previstas.

revoke all on
  public.profiles, public.families, public.family_members, public.elder_monitors,
  public.pairing_codes, public.device_push_tokens, public.moments, public.daily_checkins
from anon;

revoke insert, update, delete on
  public.profiles, public.families, public.family_members, public.elder_monitors,
  public.pairing_codes, public.device_push_tokens, public.moments, public.daily_checkins
from authenticated;

revoke select on public.pairing_codes from authenticated;

grant insert (id, display_name, avatar_path),
      update (display_name, avatar_path)
  on public.profiles to authenticated;

grant update (name) on public.families to authenticated;

-- Cada familiar edita su etiqueta y si quiere emails de aviso; el rol, nunca.
grant update (display_role_label, receive_critical_emails), delete
  on public.family_members to authenticated;

grant insert (family_id, display_name, avatar_path, timezone, phone_for_call, window_start,
              reminder_1_at, reminder_2_at, admin_alert_at, active_days_mask, paused_until, is_enabled),
      update (display_name, avatar_path, timezone, phone_for_call, window_start,
              reminder_1_at, reminder_2_at, admin_alert_at, active_days_mask, paused_until, is_enabled),
      delete
  on public.elder_monitors to authenticated;

grant delete on public.device_push_tokens to authenticated;

grant insert (family_id, storage_path, caption), delete on public.moments to authenticated;


-- 7. ROW LEVEL SECURITY (100 % de las tablas) ----------------------------------

alter table public.profiles           enable row level security;
alter table public.families           enable row level security;
alter table public.family_members     enable row level security;
alter table public.elder_monitors     enable row level security;
alter table public.pairing_codes      enable row level security;
alter table public.device_push_tokens enable row level security;
alter table public.moments            enable row level security;
alter table public.daily_checkins     enable row level security;

-- profiles
create policy "profiles: read own and family" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or private.shares_family_with(id));
create policy "profiles: insert own" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and private.is_permanent_user());
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- families (se crean con la RPC create_family; se borran con Edge Function)
create policy "families: members read" on public.families
  for select to authenticated
  using (private.my_role(id) is not null);
create policy "families: admins rename" on public.families
  for update to authenticated
  using (private.my_role(id) = 'admin')
  with check (private.my_role(id) = 'admin');

-- family_members (altas y cambios de rol solo vía RPC / Edge Function)
create policy "family_members: members read" on public.family_members
  for select to authenticated
  using (private.my_role(family_id) is not null);
create policy "family_members: edit own preferences" on public.family_members
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "family_members: leave or admin removes member" on public.family_members
  for delete to authenticated
  using (
    (user_id = (select auth.uid()) and role <> 'elder')
    or (role = 'member' and private.my_role(family_id) = 'admin')
  );

-- elder_monitors (solo los admins configuran a los mayores)
create policy "elder_monitors: members read" on public.elder_monitors
  for select to authenticated
  using (private.my_role(family_id) is not null);
create policy "elder_monitors: admins insert" on public.elder_monitors
  for insert to authenticated
  with check (private.my_role(family_id) = 'admin');
create policy "elder_monitors: admins update" on public.elder_monitors
  for update to authenticated
  using (private.my_role(family_id) = 'admin')
  with check (private.my_role(family_id) = 'admin');
create policy "elder_monitors: admins delete" on public.elder_monitors
  for delete to authenticated
  using (private.my_role(family_id) = 'admin');

-- pairing_codes: RLS activado y SIN políticas = invisible para la app.

-- device_push_tokens (alta y actualización vía RPC register_push_token)
create policy "device_push_tokens: read own" on public.device_push_tokens
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy "device_push_tokens: delete own" on public.device_push_tokens
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- moments (en la v1.0 suben fotos hijos y nietos; el mayor solo las ve)
create policy "moments: members read" on public.moments
  for select to authenticated
  using (private.my_role(family_id) is not null);
create policy "moments: family uploads" on public.moments
  for insert to authenticated
  with check (private.my_role(family_id) in ('admin', 'member') and author_id = (select auth.uid()));
create policy "moments: author or admin delete" on public.moments
  for delete to authenticated
  using (author_id = (select auth.uid()) or private.my_role(family_id) = 'admin');

-- daily_checkins: solo lectura desde la app.
create policy "daily_checkins: members read" on public.daily_checkins
  for select to authenticated
  using (private.my_role(family_id) is not null);


-- 8. RPC (la app las llama con supabase.rpc desde src/features/*/api.ts) -------

-- Crea la familia y mete al creador como admin en una sola transacción.
create function public.create_family(p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_family_id uuid;
begin
  if not private.is_permanent_user() then
    raise exception 'Only family accounts can create a family' using errcode = '42501';
  end if;

  insert into public.families (name, created_by)
  values (p_name, auth.uid())
  returning id into v_family_id;

  insert into public.family_members (family_id, user_id, role, receive_critical_emails)
  values (v_family_id, auth.uid(), 'admin', true);

  return v_family_id;
end;
$$;

-- Un hermano o nieto entra con el enlace de WhatsApp (máximo 10 familiares).
create function public.join_family(p_invite_token uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_family_id uuid;
begin
  if not private.is_permanent_user() then
    raise exception 'Only family accounts can join a family' using errcode = '42501';
  end if;

  select f.id into v_family_id
  from public.families f
  where f.invite_token = p_invite_token
  for update;

  if v_family_id is null then
    raise exception 'Invalid invite link' using errcode = 'P0002';
  end if;

  if exists (select 1 from public.family_members fm
             where fm.family_id = v_family_id and fm.user_id = auth.uid()) then
    return v_family_id; -- ya era miembro: no es un error
  end if;

  if (select count(*) from public.family_members fm
      where fm.family_id = v_family_id and fm.role <> 'elder') >= 10 then
    raise exception 'This family already has 10 members' using errcode = 'P0001';
  end if;

  insert into public.family_members (family_id, user_id, role)
  values (v_family_id, auth.uid(), 'member');

  return v_family_id;
end;
$$;

-- Un admin convierte a un familiar en admin (o al revés). Nunca deja la familia sin admins.
create function public.set_member_role(p_member_id uuid, p_role public.member_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target public.family_members%rowtype;
begin
  select * into v_target
  from public.family_members fm
  where fm.id = p_member_id
  for update;

  if not found
     or not private.is_permanent_user()
     or private.my_role(v_target.family_id) is distinct from 'admin'
     or v_target.role = 'elder'
     or p_role = 'elder' then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  if v_target.role = 'admin' and p_role = 'member'
     and (select count(*) from public.family_members fm
          where fm.family_id = v_target.family_id and fm.role = 'admin') <= 1 then
    raise exception 'A family needs at least one admin' using errcode = 'P0001';
  end if;

  update public.family_members fm
  set role = p_role,
      receive_critical_emails = case when p_role = 'admin' then true else fm.receive_critical_emails end
  where fm.id = p_member_id;
end;
$$;

-- Genera el código de 6 dígitos (válido 30 min) para vincular el móvil de un mayor.
-- Invalida cualquier código pendiente anterior de ese mismo mayor.
create function public.create_pairing_code(p_elder_monitor_id uuid)
returns table (pairing_code text, valid_until timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_family_id uuid;
  v_code      text;
  v_expires   timestamptz := now() + interval '30 minutes';
begin
  select em.family_id into v_family_id
  from public.elder_monitors em
  where em.id = p_elder_monitor_id;

  if v_family_id is null
     or not private.is_permanent_user()
     or private.my_role(v_family_id) is distinct from 'admin' then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  delete from public.pairing_codes c
  where c.used_at is null
    and (c.elder_monitor_id = p_elder_monitor_id or c.expires_at < now());

  for attempt in 1..5 loop
    -- 32 bits aleatorios de un UUID v4 (generador criptográfico) → 000000-999999
    v_code := lpad(
      ((('x' || left(replace(gen_random_uuid()::text, '-', ''), 8))::bit(32)::bigint) % 1000000)::text,
      6, '0'
    );
    begin
      insert into public.pairing_codes
        (code_6_digits, family_id, elder_monitor_id, created_by, expires_at)
      values
        (v_code, v_family_id, p_elder_monitor_id, auth.uid(), v_expires);

      pairing_code := v_code;
      valid_until := v_expires;
      return next;
      return;
    exception when unique_violation then
      null; -- colisión con otro código activo: se reintenta
    end;
  end loop;

  raise exception 'Could not generate a unique pairing code' using errcode = 'P0001';
end;
$$;

-- Canje del código. SOLO la llama la Edge Function redeem-pairing-code (service role),
-- que antes valida con Zod y limita intentos contra fuerza bruta.
-- Si el mayor ya tenía otro móvil vinculado, ese móvil pierde el acceso.
create function public.redeem_pairing_code(p_code text, p_user_id uuid)
returns table (paired_family_id uuid, paired_elder_monitor_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pairing  public.pairing_codes%rowtype;
  v_old_user uuid;
  v_name     text;
begin
  if not exists (select 1 from auth.users u where u.id = p_user_id and u.is_anonymous) then
    raise exception 'Elder devices must use an anonymous session' using errcode = '42501';
  end if;

  select * into v_pairing
  from public.pairing_codes c
  where c.code_6_digits = p_code
    and c.used_at is null
    and c.expires_at > now()
  for update;

  if not found then
    raise exception 'Invalid or expired code' using errcode = 'P0002';
  end if;

  select em.elder_user_id, em.display_name into v_old_user, v_name
  from public.elder_monitors em
  where em.id = v_pairing.elder_monitor_id
  for update;

  if v_old_user is not null then
    delete from public.family_members fm
    where fm.family_id = v_pairing.family_id
      and fm.user_id = v_old_user;
  end if;

  update public.elder_monitors em
  set elder_user_id = p_user_id
  where em.id = v_pairing.elder_monitor_id;

  insert into public.family_members (family_id, user_id, role, display_role_label)
  values (v_pairing.family_id, p_user_id, 'elder', v_name);

  update public.pairing_codes c
  set used_at = now(), used_by = p_user_id
  where c.id = v_pairing.id;

  paired_family_id := v_pairing.family_id;
  paired_elder_monitor_id := v_pairing.elder_monitor_id;
  return next;
end;
$$;

-- Señal de vida del mayor: pulsar «Buenos días ☀️» o abrir la foto del día.
-- p_occurred_at permite sincronizar toques hechos sin cobertura.
-- Devuelve true si ESTA llamada ha confirmado el día (para avisar a la familia una sola vez).
create function public.register_checkin(
  p_source      public.checkin_source,
  p_occurred_at timestamptz default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_monitor    public.elder_monitors%rowtype;
  v_occurred   timestamptz;
  v_local_date date;
  v_prev       public.checkin_status;
begin
  if p_source = 'manual_admin' then
    raise exception 'Invalid source for an elder device' using errcode = '22023';
  end if;

  select * into v_monitor
  from public.elder_monitors em
  where em.elder_user_id = auth.uid();

  if not found then
    raise exception 'Only paired elder devices can check in' using errcode = '42501';
  end if;

  -- Acepta toques encolados hasta 36 h atrás y nunca del futuro.
  v_occurred := least(greatest(coalesce(p_occurred_at, now()), now() - interval '36 hours'), now());
  v_local_date := (v_occurred at time zone v_monitor.timezone)::date;

  select dc.status into v_prev
  from public.daily_checkins dc
  where dc.elder_monitor_id = v_monitor.id
    and dc.local_date = v_local_date
  for update;

  insert into public.daily_checkins as dc
    (elder_monitor_id, family_id, local_date, status, confirmed_at, source)
  values
    (v_monitor.id, v_monitor.family_id, v_local_date, 'ok', v_occurred, p_source)
  on conflict (elder_monitor_id, local_date) do update
  set status = 'ok',
      source = case
        when dc.confirmed_at is null or excluded.confirmed_at < dc.confirmed_at then excluded.source
        else dc.source
      end,
      confirmed_at = least(dc.confirmed_at, excluded.confirmed_at);

  return v_prev is distinct from 'ok';
end;
$$;

-- Un admin pulsa «Ya hablé con ella, todo bien ✅» y el aviso se cierra para todos.
create function public.resolve_checkin(p_checkin_id uuid, p_note text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_family_id uuid;
begin
  select dc.family_id into v_family_id
  from public.daily_checkins dc
  where dc.id = p_checkin_id;

  if v_family_id is null
     or not private.is_permanent_user()
     or private.my_role(v_family_id) is distinct from 'admin' then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  update public.daily_checkins dc
  set status = 'resolved_by_admin',
      source = 'manual_admin',
      confirmed_at = now(),
      resolved_by_user_id = auth.uid(),
      resolution_note = p_note
  where dc.id = p_checkin_id
    and dc.status in ('pending', 'reminded_1', 'reminded_2', 'alerted_admins');

  return found;
end;
$$;

-- Registra (o reasigna, si el móvil cambió de cuenta) el token push del dispositivo.
create function public.register_push_token(p_token text, p_platform public.push_platform)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if p_token !~ '^Expo(nent)?PushToken\[.+\]$' then
    raise exception 'Invalid Expo push token' using errcode = '22023';
  end if;

  insert into public.device_push_tokens (user_id, expo_push_token, platform)
  values (auth.uid(), p_token, p_platform)
  on conflict (expo_push_token) do update
  set user_id = excluded.user_id,
      platform = excluded.platform,
      updated_at = now();
end;
$$;

-- Permisos de ejecución: nada para anon; redeem solo para la service role.
revoke execute on all functions in schema public from public, anon;
revoke execute on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated, service_role;
grant execute on function
  public.create_family(text),
  public.join_family(uuid),
  public.set_member_role(uuid, public.member_role),
  public.create_pairing_code(uuid),
  public.register_checkin(public.checkin_source, timestamptz),
  public.resolve_checkin(uuid, text),
  public.register_push_token(text, public.push_platform)
to authenticated;
revoke execute on function public.redeem_pairing_code(text, uuid) from authenticated;
grant execute on function public.redeem_pairing_code(text, uuid) to service_role;


-- 9. STORAGE: bucket privado + políticas por carpeta de familia ----------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('family-moments', 'family-moments', false, 1048576, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

create policy "family-moments: members read" on storage.objects
  for select to authenticated
  using (bucket_id = 'family-moments' and private.my_role_for_storage_path(name) is not null);
create policy "family-moments: family uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'family-moments' and private.my_role_for_storage_path(name) in ('admin', 'member'));
create policy "family-moments: owner deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'family-moments' and owner_id = (select auth.uid())::text);
