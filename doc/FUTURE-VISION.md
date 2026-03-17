# CommitForge — Visão de Futuro

## Onde estamos hoje

CommitForge v1.0.0 resolve um problema real e específico: desenvolvedores que trabalharam
em projetos por meses sem usar Git, e perderam todo esse histórico no momento do push inicial.

A ferramenta hoje é uma CLI simples, funcional, instalável em qualquer sistema, com suporte
a múltiplas plataformas e um painel de controle web.

---

## Para onde vamos

### Curto prazo (v1.x) — Polimento e alcance

A prioridade é tornar CommitForge a ferramenta de referência para gestão de histórico Git:

**Interface mais rica:**
- TUI (Terminal User Interface) com seleção visual de datas usando teclas
- Progresso em tempo real com ETA
- Preview visual antes de confirmar

**Mais plataformas:**
- GitLab nativo (hoje funciona via HTTPS genérico)
- Bitbucket com App Passwords
- GitHub Enterprise
- Gitea e self-hosted instâncias

**Produtividade:**
- Cache de repositórios (evitar re-clone)
- Processamento paralelo no modo `lote`
- Webhook para notificar no Slack/Discord quando um job termina

---

### Médio prazo (v2.x) — Inteligência

**Mensagens geradas por IA:**

Em vez de mensagens genéricas como `feat: componentes da interface`, CommitForge analisará
o diff real dos arquivos e gerará mensagens contextuais:

```
feat(auth): implement JWT token refresh with sliding window expiration
fix(ui): resolve button hover state not applying on Safari
docs: add detailed API response examples for /users endpoint
```

A geração será feita localmente via modelos pequenos (Ollama, llama.cpp) para não depender
de APIs externas ou expor código-fonte.

**Migração de sistemas legados:**

Importar histórico real de:
- SVN (`svn log` → commits git com datas originais)
- Mercurial (`hg log`)
- CSV/Excel com anotações de datas de desenvolvimento

**Replay de histórico:**

Dado um repositório A, recriar exatamente o mesmo histórico (com datas e mensagens idênticas)
em um repositório B. Útil para migrações entre organizações GitHub.

---

### Longo prazo (v3.x) — Plataforma colaborativa

**CommitForge Cloud:**

Uma versão SaaS onde equipes podem gerenciar o histórico de contribuições de forma centralizada:

- Dashboard compartilhado por organização
- Relatórios automáticos de produtividade (commits por dev, por repositório, por período)
- Exportação PDF de relatórios
- Integração com Jira, Linear, Notion para correlacionar commits com tarefas

**API pública:**

```
POST /v1/jobs              # criar um job de commits retroativos
GET  /v1/jobs/:id          # status do job
GET  /v1/analytics/:user   # métricas públicas de um usuário
```

---

## O que nunca vamos fazer

CommitForge é uma ferramenta para **documentar trabalho real** que foi feito mas não registrado.
Não é, e nunca será, uma ferramenta para:

- Falsificar contribuições em projetos de outras pessoas
- Inflar métricas de forma enganosa em processos seletivos
- Violar os Termos de Serviço do GitHub ou qualquer plataforma

A filosofia do projeto é: *"você fez o trabalho, você merece o registro"*.

---

## Valores do projeto

1. **Privacidade first** — nenhum dado sensível é coletado ou armazenado
2. **Open source para sempre** — o core da CLI será sempre MIT
3. **Developer experience** — instala em um comando, funciona sem configuração
4. **Honestidade** — a ferramenta documenta trabalho real, não inventa histórico
