# CommitForge — Roadmap

## Versão atual: v1.0.0 (Estável)

### ✅ Concluído

- [x] CLI completa com `commitforge commit`, `grupos`, `preview`, `lote`, `desinstalar`
- [x] Modo projeto (agrupamento semântico, 17 categorias)
- [x] Modo arquivo (um commit por arquivo)
- [x] Modo interativo com prompts
- [x] Detecção automática de e-mail via API do GitHub
- [x] Instaladores: curl (Linux/macOS), PowerShell (Windows), apt (Debian), pacman (Arch)
- [x] Docker support
- [x] Sistema de telemetria anônimo (contagem de instalações)
- [x] Dashboard administrativo com métricas (Supabase)
- [x] Landing page com PWA, SEO 100%, OG image
- [x] Documentação completa em `/docs`
- [x] Guia de referência Git em `/git`
- [x] Changelog em `/changelog`

---

## v1.1.0 — Melhorias de UX (próxima versão)

- [ ] **TUI interativa** — seleção de datas e repositórios via interface visual no terminal (usando `textual` ou `curses`)
- [ ] **Cache de repositórios** — evitar re-clone em execuções consecutivas do mesmo repo
- [ ] **Progresso em tempo real** — barra de progresso com ETA durante commits
- [ ] **Desfazer último job** — reverter commits criados na última execução
- [ ] **Alias `cf`** — além de `commitforge` e `forge`, suportar `cf commit`

---

## v1.2.0 — Plataformas e integrações

- [ ] **GitLab CI/CD nativo** — integração direta com pipelines sem token manual
- [ ] **Bitbucket support** — autenticação com app passwords
- [ ] **SSH nativo** — autenticação via chave SSH além do token HTTPS
- [ ] **Gitea / self-hosted** — suporte a instâncias próprias de Git
- [ ] **GitHub Actions** — workflow YAML pronto para uso em `.github/workflows/`

---

## v2.0.0 — Inteligência e automação

- [ ] **AI commit messages** — geração de mensagens de commit usando LLM local (Ollama)
- [ ] **Análise de diff** — gerar mensagens baseadas no conteúdo real das mudanças
- [ ] **Padrão customizável** — suporte a Conventional Commits, Gitmoji, Angular, etc.
- [ ] **Importar histórico de SVN/Mercurial** — migrar projetos legados com histórico real
- [ ] **Replay de histórico** — recriar exatamente o histórico de outro repositório
- [ ] **Sync bidirecional** — sincronizar contribuições entre organizações GitHub

---

## v3.0.0 — Plataforma (futuro distante)

- [ ] **CommitForge Cloud** — serviço SaaS para equipes
- [ ] **Dashboard de time** — visualizar contribuições de todos os membros
- [ ] **Relatórios PDF** — exportar histórico de commits e métricas
- [ ] **Webhooks** — integração com Slack, Discord, email
- [ ] **API pública** — endpoints para integrar em ferramentas de terceiros
- [ ] **Marketplace de templates** — repositório de configurações pré-definidas por linguagem/stack

---

## Ideias da comunidade (backlog)

| Ideia                                    | Votos | Status    |
|------------------------------------------|-------|-----------|
| Suporte SSH nativo                       | 🔥🔥🔥 | planejado |
| TUI com seleção visual de datas          | 🔥🔥🔥 | planejado |
| Cache de repositórios                    | 🔥🔥   | planejado |
| Export relatório PDF                     | 🔥     | backlog   |
| Integração GitLab CI/CD                  | 🔥🔥🔥 | planejado |
| Plugin para VS Code                      | 🔥🔥   | backlog   |
| Suporte a monorepos                      | 🔥🔥   | planejado |
| Commits com emojis Gitmoji               | 🔥     | backlog   |

---

## Como contribuir com ideias

Abra uma issue no repositório com a label `enhancement`:

```
https://github.com/estevam5s/commitforge/issues/new
```
