-- =============================================================================
-- Convite Ayla Sophia: confirmações de presença (Postgres / Neon)
--
-- Execute com `npm run db:setup` (usa a DATABASE_URL do .env.local) ou cole
-- no SQL Editor do Neon. Pode ser executado mais de uma vez sem perder dados.
--
-- Segurança: o banco só é acessível com a DATABASE_URL, que fica apenas no
-- servidor (Vercel). Os convidados enviam a confirmação para /api/rsvp, que
-- valida, aplica o limite de envios e chama public.submit_rsvp().
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Regras de integridade (repetem as validações do site como última defesa)
-- ---------------------------------------------------------------------------
create or replace function public.rsvp_name_is_valid(p_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_name is not null
     and p_name = btrim(p_name)
     and char_length(p_name) between 1 and 120
$$;

create or replace function public.rsvp_companions_are_valid(p_companions text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_companions is not null
     and coalesce(array_ndims(p_companions), 1) = 1
     and cardinality(p_companions) <= 15
     and not exists (
       select 1 from unnest(p_companions) as c(name)
       where not public.rsvp_name_is_valid(c.name)
     )
$$;

-- ---------------------------------------------------------------------------
-- Confirmações: uma linha por grupo (convidado principal + familiares).
-- A linha única garante gravação atômica: não existe registro parcial.
-- ---------------------------------------------------------------------------
create table if not exists public.rsvps (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  primary_name  text not null,
  companions    text[] not null default '{}',
  -- Total sempre calculado pelo banco a partir das pessoas informadas.
  total_people  integer generated always as (1 + cardinality(companions)) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint rsvps_primary_name_valid check (public.rsvp_name_is_valid(primary_name)),
  constraint rsvps_companions_valid  check (public.rsvp_companions_are_valid(companions))
);

comment on table public.rsvps is 'Confirmações de presença do aniversário da Ayla Sophia (privado).';
comment on column public.rsvps.submission_id is 'Identificador gerado pelo navegador para tornar reenvios idempotentes.';

create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists rsvps_set_updated_at on public.rsvps;
create trigger rsvps_set_updated_at
  before update on public.rsvps
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Limite de tentativas (envios de confirmação e login do admin).
-- Compatível com serverless: o contador fica no banco, não na memória.
-- Guarda apenas um hash do IP (HMAC feito no servidor), nunca o IP em si.
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  bucket       text not null,
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (bucket, window_start)
);

create or replace function public.rate_limit_hit(
  p_bucket text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_hits   integer;
begin
  if p_bucket is null or char_length(p_bucket) > 128 or p_max < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments';
  end if;

  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limits as r (bucket, window_start, hits)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning r.hits into v_hits;

  -- Limpeza oportunista de janelas antigas.
  if random() < 0.05 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_max;
end;
$$;

-- ---------------------------------------------------------------------------
-- Gravação idempotente de uma confirmação.
-- Reenvio com o mesmo submission_id devolve o registro já salvo, sem duplicar.
-- ---------------------------------------------------------------------------
create or replace function public.submit_rsvp(
  p_submission_id uuid,
  p_primary_name text,
  p_companions text[]
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row      public.rsvps%rowtype;
  v_replayed boolean := false;
begin
  insert into public.rsvps (submission_id, primary_name, companions)
  values (p_submission_id, p_primary_name, coalesce(p_companions, '{}'))
  on conflict (submission_id) do nothing
  returning * into v_row;

  if not found then
    select * into v_row from public.rsvps r where r.submission_id = p_submission_id;
    v_replayed := true;
  end if;

  return jsonb_build_object(
    'name', v_row.primary_name,
    'companions', to_jsonb(v_row.companions),
    'total', v_row.total_people,
    'replayed', v_replayed
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Defesa extra: nenhum papel além do dono do banco acessa as tabelas.
-- (Relevante se algum dia a "Data API" do Neon for ativada.)
-- ---------------------------------------------------------------------------
alter table public.rsvps       enable row level security;
alter table public.rate_limits enable row level security;
revoke all on table public.rsvps       from public;
revoke all on table public.rate_limits from public;
revoke all on function public.submit_rsvp(uuid, text, text[])          from public;
revoke all on function public.rate_limit_hit(text, integer, integer)   from public;
