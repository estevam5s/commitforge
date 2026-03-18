-- ─── Guardião AVT — Schema ──────────────────────────────────────────────────
-- Tabelas para o sistema de monitoramento da Linha do Tempo Sagrada

-- Registra cada evento de commit da CLI ou Flask
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  operator      TEXT        DEFAULT 'anonymous',
  repo_name     TEXT,
  repo_url      TEXT,
  commit_year   INT,
  commits_count INT         DEFAULT 0,
  branch_name   TEXT,
  mode          TEXT        DEFAULT 'unknown',
  timeline_type TEXT        DEFAULT 'sacred' CHECK (timeline_type IN ('sacred','branched','nexus','pruned')),
  nexus_level   INT         DEFAULT 0 CHECK (nexus_level >= 0 AND nexus_level <= 10),
  is_future     BOOLEAN     DEFAULT FALSE,
  is_deep_past  BOOLEAN     DEFAULT FALSE,
  status        TEXT        DEFAULT 'active' CHECK (status IN ('active','pruned','monitored','warning')),
  source        TEXT        DEFAULT 'cli' CHECK (source IN ('cli','flask','api','manual')),
  ip_hash       TEXT,
  session_id    TEXT,
  metadata      JSONB       DEFAULT '{}'
);

-- Registra ações do guardião (poda, alerta, monitoramento)
CREATE TABLE IF NOT EXISTS public.guardian_prunes (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  event_id    UUID        REFERENCES public.timeline_events(id) ON DELETE CASCADE,
  guardian    TEXT        DEFAULT 'Guardião AVT',
  action      TEXT        DEFAULT 'pruned' CHECK (action IN ('pruned','warned','monitored','escalated')),
  reason      TEXT,
  notes       TEXT
);

-- ─── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_prunes  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_events_insert_anon"
  ON public.timeline_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "timeline_events_select_auth"
  ON public.timeline_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "timeline_events_update_auth"
  ON public.timeline_events FOR UPDATE TO authenticated USING (true);

CREATE POLICY "guardian_prunes_all_auth"
  ON public.guardian_prunes FOR ALL TO authenticated USING (true);

-- ─── Seed Data ───────────────────────────────────────────────────────────────

INSERT INTO public.timeline_events (operator, repo_name, repo_url, commit_year, commits_count, branch_name, mode, timeline_type, nexus_level, is_future, is_deep_past, status, source)
VALUES
  ('estevam5s', 'commitforge', 'https://github.com/estevam5s/commitforge', 2019, 12, 'historico-2019', 'projeto', 'sacred', 0, false, true, 'active', 'cli'),
  ('estevam5s', 'portfolio', 'https://github.com/estevam5s/portfolio', 2021, 8, 'historico-2021', 'projeto', 'sacred', 0, false, false, 'active', 'cli'),
  ('variante-7', 'dark-repo', 'https://github.com/variante7/dark-repo', 2027, 42, 'future-branch', 'arquivo', 'nexus', 8, true, false, 'active', 'cli'),
  ('unknown', 'mystery-repo', null, 2018, 3, 'historico-2018', 'projeto', 'branched', 3, false, true, 'monitored', 'api')
ON CONFLICT DO NOTHING;
