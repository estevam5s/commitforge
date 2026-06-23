-- ============================================================
-- CommitForge — Camada SaaS (planos, assinaturas, CLI tokens)
-- Não altera installs/feedbacks/commits_log/cli_improvements/guardian.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── profiles: colunas de trial/demo ───────────────────────
alter table public.profiles add column if not exists trial_ends_at timestamptz;
alter table public.profiles add column if not exists is_demo boolean default true;

-- ── app_plans ─────────────────────────────────────────────
create table if not exists public.app_plans (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  price_month integer not null default 0,
  price_year integer not null default 0,
  stripe_price_month text,
  stripe_price_year text,
  features jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  highlighted boolean default false,
  active boolean default true,
  sort_order integer default 0
);
alter table public.app_plans enable row level security;
drop policy if exists app_plans_sel on public.app_plans;
create policy app_plans_sel on public.app_plans for select using (true);

-- ── app_subscriptions ─────────────────────────────────────
create table if not exists public.app_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_slug text not null default 'inicial',
  status text not null default 'trialing',
  cycle text default 'month',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  refund_eligible_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.app_subscriptions enable row level security;
drop policy if exists app_subs_own on public.app_subscriptions;
create policy app_subs_own on public.app_subscriptions for select using (user_id = auth.uid());

-- ── app_payment_events (idempotência webhook) ─────────────
create table if not exists public.app_payment_events (
  id text primary key,
  type text,
  payload jsonb,
  created_at timestamptz default now()
);
alter table public.app_payment_events enable row level security;

-- ── cli_tokens (auth da CLI por usuário/plano) ────────────
create table if not exists public.cli_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text unique not null,
  name text default 'CLI',
  last_used_at timestamptz,
  revoked boolean default false,
  created_at timestamptz default now()
);
alter table public.cli_tokens enable row level security;
drop policy if exists cli_tokens_own on public.cli_tokens;
create policy cli_tokens_own on public.cli_tokens for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_cli_tokens_user on public.cli_tokens(user_id);
create index if not exists idx_cli_tokens_token on public.cli_tokens(token);

-- ── updated_at helper p/ app_subscriptions ────────────────
create or replace function public.app_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_app_subs on public.app_subscriptions;
create trigger trg_app_subs before update on public.app_subscriptions
  for each row execute function public.app_touch_updated_at();

-- ── handle_new_user: profile + trial 7d + subscription ────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url, trial_ends_at, is_demo)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', now() + interval '7 days', true)
  on conflict (id) do update set trial_ends_at = coalesce(public.profiles.trial_ends_at, excluded.trial_ends_at);

  insert into public.app_subscriptions (user_id, plan_slug, status, current_period_end)
  values (new.id, 'inicial', 'trialing', now() + interval '7 days')
  on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Seed dos planos ───────────────────────────────────────
insert into public.app_plans (slug,name,description,price_month,price_year,stripe_price_month,stripe_price_year,features,limits,highlighted,sort_order) values
('inicial','Inicial','Para testar e uso pessoal',0,0,null,null,
 '["1 repositório","30 commits retroativos/mês","Modo arquivo único","CLI básica + 1 token","Provedor GitHub","Histórico de 7 dias","Suporte da comunidade"]'::jsonb,
 '{"repos":1,"commits_month":30,"providers":1,"cli_tokens":1,"batch":false,"schedule":false,"webhooks":false,"api":false,"team":false}'::jsonb,
 false,0),
('starter','Starter','Para o desenvolvedor individual',1900,18200,'price_1TldicJ6zI3Lognzf2kMOnjp','price_1TldidJ6zI3Lognzc5QWAmQF',
 '["Até 5 repositórios","500 commits/mês","Modo arquivo e projeto","Distribuição realista básica","3 templates de mensagem","2 tokens de CLI","Histórico de 30 dias","Suporte por e-mail"]'::jsonb,
 '{"repos":5,"commits_month":500,"providers":1,"cli_tokens":2,"batch":false,"schedule":false,"webhooks":false,"api":false,"team":false}'::jsonb,
 false,1),
('pro','Pro','Para profissionais e freelancers',4900,47000,'price_1TldieJ6zI3Lognzg2OPlhTL','price_1TldifJ6zI3LognzwGsWUfWT',
 '["Repositórios ilimitados","Commits ilimitados","Multi-repositório em lote","GitHub, GitLab e Bitbucket","Distribuição realista avançada","Templates ilimitados","Agendamento de jobs","Webhooks","5 tokens de CLI","Histórico ilimitado","Suporte prioritário"]'::jsonb,
 '{"repos":-1,"commits_month":-1,"providers":3,"cli_tokens":5,"batch":true,"schedule":true,"webhooks":true,"api":false,"team":false}'::jsonb,
 true,2),
('enterprise','Enterprise','Para times e empresas',14900,143000,'price_1TldigJ6zI3LognzPaXscTpI','price_1TldihJ6zI3LognzPsk0jKwf',
 '["Tudo do Pro","Organizações, equipes e permissões","API pública + tokens","SSO e auditoria completa","Tokens de CLI ilimitados","Automações agendadas","Suporte dedicado (SLA)"]'::jsonb,
 '{"repos":-1,"commits_month":-1,"providers":3,"cli_tokens":-1,"batch":true,"schedule":true,"webhooks":true,"api":true,"team":true}'::jsonb,
 false,3)
on conflict (slug) do update set
  name=excluded.name, description=excluded.description, price_month=excluded.price_month, price_year=excluded.price_year,
  stripe_price_month=excluded.stripe_price_month, stripe_price_year=excluded.stripe_price_year,
  features=excluded.features, limits=excluded.limits, highlighted=excluded.highlighted, sort_order=excluded.sort_order;
