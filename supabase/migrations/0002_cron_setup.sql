-- =============================================================================
-- Cerca · Migración 0002 · Tareas programadas (pg_cron + pg_net)
--
--   · evaluate-checkins      cada 5 minutos  → recordatorios al mayor y avisos a admins
--   · cleanup-expired-media  cada día 04:00 UTC → borra fotos > 30 días del plan gratuito
--
-- Las URLs y el secreto NO van en git. Se guardan en Supabase Vault UNA vez por entorno
-- (SQL Editor del proyecto en la nube, o Studio local) con:
--
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<mismo valor que CRON_SECRET en las Edge Functions>', 'cron_secret');
--
-- Mientras esos secretos no existan, los jobs se ejecutan pero no hacen nada (sin errores).
-- =============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Llama a una Edge Function con el secreto compartido. security definer para poder leer Vault.
create or replace function private.invoke_edge_function(p_function_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url    text;
  v_secret text;
begin
  select ds.decrypted_secret into v_url
  from vault.decrypted_secrets ds
  where ds.name = 'project_url';

  select ds.decrypted_secret into v_secret
  from vault.decrypted_secrets ds
  where ds.name = 'cron_secret';

  if v_url is null or v_secret is null then
    return; -- entorno sin configurar todavía: no hacemos nada
  end if;

  perform net.http_post(
    url := v_url || '/functions/v1/' || p_function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body := jsonb_build_object('triggered_at', now()),
    timeout_milliseconds := 30000
  );
end;
$$;

revoke execute on function private.invoke_edge_function(text) from public, anon, authenticated;

-- cron.schedule con el mismo nombre actualiza el job: esta migración es re-ejecutable.
select cron.schedule(
  'evaluate-checkins-every-5-min',
  '*/5 * * * *',
  $$ select private.invoke_edge_function('evaluate-checkins'); $$
);

select cron.schedule(
  'cleanup-expired-media-daily',
  '0 4 * * *',
  $$ select private.invoke_edge_function('cleanup-expired-media'); $$
);
