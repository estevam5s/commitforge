# CommitForge — Histórico de Versões

## v1.0.0 — 2026-03-17 (atual)

### Lançamento oficial

#### CLI
- `commitforge commit` com modos `projeto` e `arquivo`
- `commitforge commit --interativo` com guia passo a passo
- `commitforge grupos` — preview semântico sem modificar o repositório
- `commitforge preview` — contagem de commits antes de executar
- `commitforge validar-token` — verificação de token GitHub
- `commitforge historico` — log de jobs anteriores
- `commitforge lote` — processamento em batch via JSON
- `commitforge desinstalar` — remoção completa do sistema
- `commitforge configure` — configuração de usuário/token
- Detecção automática de e-mail via API GitHub (`/user/emails`)
- Commits aparecem no gráfico de contribuições do GitHub
- Suporte a horários aleatórios realistas (`--aleatorio`)
- Suporte a pular fins de semana (`--pular-fins-de-semana`)

#### Instaladores
- `install.sh` — Linux/macOS via curl
- `install-arch.sh` — Arch Linux via pacman
- `install-debian.sh` — Debian/Ubuntu via apt
- `install-windows.ps1` — Windows via PowerShell + winget
- Docker image (`ghcr.io/estevam5s/commitforge:latest`)

#### Site (commitforge.vercel.app)
- Landing page com TVA/Loki animated canvas background
- PWA instalável (iOS, Android, Desktop)
- SEO 100%: OpenGraph, Twitter Card, JSON-LD, sitemap, robots.txt
- `/docs` — documentação interativa completa
- `/git` — guia de referência Git (básico ao avançado)
- `/changelog` — changelog + seção quantum v2.0.0
- Contador de instalações ao vivo (Supabase)
- Formulário de feedback integrado

#### Dashboard administrativo
- Login via Supabase Auth (email/senha)
- Métricas: instalações por dia (30 dias), por plataforma, por método
- Gráficos interativos (Recharts)
- Log de commits realizados pelos usuários
- Tabela de feedbacks com filtro por categoria
- Lista de melhorias da CLI com prioridade e status

#### Backend / API
- `POST /api/install-track` — rastreia instalações (IP hasheado)
- `GET /api/install-track` — retorna total de instalações
- `GET /api/stats` — métricas completas (autenticado)
- `POST /api/feedbacks` — recebe feedback do formulário

---

## v0.9.0 — 2026-01 (beta privado)

- Protótipo inicial da CLI com forge.py
- Suporte a modo projeto e arquivo
- Servidor Flask para API REST
- Interface web básica

---

## v0.1.0 — 2025-11 (proof of concept)

- Script shell rudimentar para criar commits retroativos
- Sem agrupamento semântico
- Apenas modo arquivo com datas manuais
