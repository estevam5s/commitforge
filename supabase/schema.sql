-- ============================================================
-- CommitForge — Supabase Schema v1.0
-- Execute este arquivo no Supabase SQL Editor
-- ============================================================

-- ── Extensions ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tabela: installs ──────────────────────────────────────
-- Registra cada instalação do CommitForge
CREATE TABLE IF NOT EXISTS public.installs (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  method      TEXT    NOT NULL CHECK (method IN ('curl','docker','pip','brew','apt','pacman','winget','powershell','git','aur','dnf','unknown')),
  platform    TEXT    NOT NULL CHECK (platform IN ('linux','macos','windows','docker','arch','debian','ubuntu','fedora','other')),
  version     TEXT    DEFAULT '3.0.0',
  user_agent  TEXT,
  ip_hash     TEXT,    -- SHA-256 do IP (privacidade)
  country     TEXT,
  arch        TEXT     -- 'x86_64','arm64','arm32'
);

-- ── Tabela: feedbacks ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id     UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT,
  email       TEXT,
  rating      INT     CHECK (rating >= 1 AND rating <= 5),
  message     TEXT    NOT NULL,
  category    TEXT    DEFAULT 'general' CHECK (category IN ('bug','feature','general','performance','docs')),
  status      TEXT    DEFAULT 'pending' CHECK (status IN ('pending','reviewed','done','rejected')),
  admin_reply TEXT
);

-- ── Tabela: profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID    REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  username    TEXT    UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT    DEFAULT 'admin' CHECK (role IN ('admin','viewer')),
  last_login  TIMESTAMPTZ
);

-- ── Tabela: commits_log ───────────────────────────────────
-- Histórico de jobs de commits retroativos
CREATE TABLE IF NOT EXISTS public.commits_log (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id       UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
  repo_url      TEXT    NOT NULL,
  repo_name     TEXT,
  branch        TEXT,
  start_date    DATE,
  end_date      DATE,
  mode          TEXT    CHECK (mode IN ('projeto','arquivo')),
  commits_count INT     DEFAULT 0,
  status        TEXT    DEFAULT 'completed' CHECK (status IN ('pending','running','completed','failed','cancelled')),
  error_msg     TEXT,
  duration_ms   INT,
  notes         TEXT
);

-- ── Tabela: cli_improvements ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.cli_improvements (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  title       TEXT    NOT NULL,
  description TEXT,
  priority    TEXT    DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status      TEXT    DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done','cancelled','wont_fix')),
  author      TEXT,
  version_target TEXT,
  tags        TEXT[]  DEFAULT '{}'
);

-- ── Tabela: backups ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.backups (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id     UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
  type        TEXT    NOT NULL CHECK (type IN ('full','installs','feedbacks','commits')),
  size_bytes  INT,
  row_count   INT,
  filename    TEXT,
  status      TEXT    DEFAULT 'completed' CHECK (status IN ('pending','running','completed','failed'))
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE public.installs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commits_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cli_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups        ENABLE ROW LEVEL SECURITY;

-- ── Políticas: installs ───────────────────────────────────
-- Qualquer pessoa (anon) pode inserir uma instalação
CREATE POLICY "installs_insert_anon"
  ON public.installs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Apenas autenticados podem ler
CREATE POLICY "installs_select_auth"
  ON public.installs FOR SELECT
  TO authenticated
  USING (true);

-- ── Políticas: feedbacks ──────────────────────────────────
CREATE POLICY "feedbacks_insert_anyone"
  ON public.feedbacks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "feedbacks_select_auth"
  ON public.feedbacks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "feedbacks_update_auth"
  ON public.feedbacks FOR UPDATE
  TO authenticated
  USING (true);

-- ── Políticas: profiles ───────────────────────────────────
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ── Políticas: commits_log ────────────────────────────────
CREATE POLICY "commits_log_all_auth"
  ON public.commits_log FOR ALL
  TO authenticated
  USING (true);

-- ── Políticas: cli_improvements ───────────────────────────
CREATE POLICY "cli_improvements_all_auth"
  ON public.cli_improvements FOR ALL
  TO authenticated
  USING (true);

-- ── Políticas: backups ────────────────────────────────────
CREATE POLICY "backups_all_auth"
  ON public.backups FOR ALL
  TO authenticated
  USING (true);

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Trigger: criar profile automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER cli_improvements_updated_at
  BEFORE UPDATE ON public.cli_improvements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function: total de instalações (público, sem auth)
CREATE OR REPLACE FUNCTION public.get_install_count()
RETURNS INT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::INT FROM public.installs;
$$;

-- Function: instalações por plataforma
CREATE OR REPLACE FUNCTION public.get_installs_by_platform()
RETURNS TABLE(platform TEXT, count BIGINT) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT platform, COUNT(*) as count
  FROM public.installs
  GROUP BY platform
  ORDER BY count DESC;
$$;

-- Function: instalações por método
CREATE OR REPLACE FUNCTION public.get_installs_by_method()
RETURNS TABLE(method TEXT, count BIGINT) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT method, COUNT(*) as count
  FROM public.installs
  GROUP BY method
  ORDER BY count DESC;
$$;

-- Function: instalações dos últimos 30 dias
CREATE OR REPLACE FUNCTION public.get_installs_last_30_days()
RETURNS TABLE(date DATE, count BIGINT) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    DATE(created_at) as date,
    COUNT(*) as count
  FROM public.installs
  WHERE created_at >= now() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date;
$$;

-- ============================================================
-- Seed: dados iniciais de exemplo para cli_improvements
-- ============================================================

INSERT INTO public.cli_improvements (title, description, priority, status, author, version_target, tags)
VALUES
  ('Suporte a GitLab CI/CD nativo', 'Integração direta com pipelines do GitLab sem token manual', 'high', 'pending', 'Estevam Souza', 'v3.1.0', ARRAY['gitlab','ci','integration']),
  ('Modo interativo com GUI TUI', 'Interface terminal interativa com seleção de datas e repos via teclado', 'medium', 'in_progress', 'Estevam Souza', 'v3.2.0', ARRAY['tui','ux','interactive']),
  ('Cache de repositórios', 'Evitar re-clone do mesmo repositório em execuções consecutivas', 'medium', 'pending', 'Community', 'v3.1.0', ARRAY['performance','cache']),
  ('Suporte SSH nativo', 'Autenticação via chave SSH além do token HTTPS', 'high', 'pending', 'Estevam Souza', 'v3.1.0', ARRAY['ssh','auth']),
  ('Export de relatório PDF', 'Gerar PDF com histórico de commits e métricas', 'low', 'pending', 'Community', 'v4.0.0', ARRAY['report','export'])
ON CONFLICT DO NOTHING;

-- ============================================================
-- Grant acesso às functions públicas
-- ============================================================

GRANT EXECUTE ON FUNCTION public.get_install_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_installs_by_platform() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_installs_by_method() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_installs_last_30_days() TO authenticated;
