# 💸 CommitForge — Planos, Preços e Funcionalidades

> Documento de produto e pricing do **CommitForge** — a plataforma + CLI para gerenciar
> e criar commits retroativos no Git de forma controlada, auditável e profissional.
> Moeda: **BRL (R$)**. Ciclos: **mensal** e **anual (−20%)**.
> Última atualização: 2026-06.

---

## 1) O que é o CommitForge

CommitForge é uma ferramenta para desenvolvedores e times que precisam **escrever a data
de autoria/commit do Git** (`GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE`) de forma programática e
organizada. Funciona em dois lados:

- **Dashboard web** (Next.js): o usuário gerencia repositórios, agenda jobs de commits
  retroativos, vê histórico, métricas e logs de cada execução.
- **CLI de terminal** (Python): o usuário faz login com e-mail e senha, recebe um **token**
  vinculado à sua conta/plano, conecta o Git e executa os jobs direto no terminal.

A web e a CLI compartilham a mesma conta, o mesmo plano e os mesmos limites.

---

## 2) Análise de mercado (resumo)

### 2.1 Categoria e concorrência
A função "preencher a grade de contribuições / commitar no passado" hoje é atendida por
**scripts open-source gratuitos e fragmentados** (ex.: `github-activity-generator`,
`gitfiti`, gists soltos). Eles têm três problemas claros: exigem configuração manual, não
têm histórico/auditoria e não funcionam em equipe.

No mercado de **ferramentas de produtividade Git** (referência de faixa de preço, não de
função idêntica) os patamares praticados internacionalmente são:

| Produto (referência) | Faixa mensal (USD) | Equivalente aprox. (BRL) |
|---|---|---|
| GitKraken Pro | US$ 4,95–8/usuário | ~R$ 25–45 |
| Tower (Git GUI) | ~US$ 7/usuário | ~R$ 35 |
| Warp (terminal) Teams | US$ 15/usuário | ~R$ 75 |
| Ferramentas de automação dev (faixa) | US$ 0–20 | R$ 0–100 |

### 2.2 Posicionamento do CommitForge
- **Substituir scripts manuais** por uma ferramenta com histórico, limites claros e CLI estável.
- Preço de entrada **abaixo** do GitKraken para o plano individual (atrair quem hoje usa script grátis).
- Plano **Pro** como âncora de valor (multi-repo, multi-provedor, distribuição realista).
- Plano **Enterprise** para times (organizações, API, auditoria), onde está a margem.
- **Sem cobrança por GB de armazenamento** — o produto não hospeda repositórios; ele opera
  sobre o Git do próprio usuário. Os limites são por **repositórios, jobs e recursos**, não por espaço.

### 2.3 Uso legítimo e conformidade (importante)
O CommitForge é uma ferramenta de **engenharia de histórico Git**, com casos de uso legítimos:

- **Migração/importação** de projetos antigos para o Git preservando as datas reais de autoria.
- **Correção de fuso/relógio** errados em commits e reconstrução de timeline real de um projeto.
- **Repositórios pessoais e de estudo**, portfólios e provas de conceito.
- **Reconstrução de histórico** ao mover código entre sistemas de versionamento.

A plataforma **não** se posiciona como ferramenta de fraude. Toda execução é **registrada e
auditável** (`commits_log`) por conta. O usuário é responsável pelo uso conforme as regras do
seu empregador e dos provedores (GitHub/GitLab/Bitbucket). Esse enquadramento mantém o produto
**regular** e fora de práticas enganosas — o valor vendido é **controle, organização e auditoria**
do histórico, não enganar terceiros.

---

## 3) Os 4 planos

| | **Inicial** | **Starter** | **Pro** ⭐ | **Enterprise** |
|---|---|---|---|---|
| **Preço mensal** | **R$ 0** | **R$ 19/mês** | **R$ 49/mês** | **R$ 149/mês** |
| **Preço anual (−20%)** | R$ 0 | R$ 182/ano (R$ 15,17/mês) | R$ 470/ano (R$ 39,17/mês) | R$ 1.430/ano (R$ 119,17/mês) |
| **Para quem** | Testar / uso pessoal | Dev individual | Profissional / freelancer | Times e empresas |
| **Repositórios** | 1 | 5 | Ilimitados | Ilimitados |
| **Jobs de commit / mês** | 30 commits | 500 commits | Ilimitado | Ilimitado |
| **Modo arquivo único** | ✅ | ✅ | ✅ | ✅ |
| **Modo projeto (intervalo de datas)** | — | ✅ | ✅ | ✅ |
| **Multi-repositório em lote** | — | — | ✅ | ✅ |
| **Provedores (GitHub/GitLab/Bitbucket)** | GitHub | GitHub | Todos | Todos |
| **Distribuição realista (padrões de dias/horas)** | — | Básica | Avançada | Avançada |
| **Templates de mensagem de commit** | — | 3 | Ilimitados | Ilimitados |
| **Agendamento de jobs** | — | — | ✅ | ✅ |
| **CLI de terminal** | ✅ básica | ✅ | ✅ | ✅ |
| **Token de CLI** | 1 | 2 | 5 | Ilimitados |
| **Histórico/logs** | 7 dias | 30 dias | Ilimitado | Ilimitado |
| **Métricas e dashboard** | Básico | ✅ | ✅ avançado | ✅ avançado |
| **Webhooks** | — | — | ✅ | ✅ |
| **API pública + tokens** | — | — | — | ✅ |
| **Organizações, equipes e permissões** | — | — | — | ✅ |
| **SSO / auditoria completa** | — | — | — | ✅ |
| **Suporte** | Comunidade | E-mail | Prioritário | Dedicado (SLA) |

⭐ **Pro é o plano em destaque** (melhor custo-benefício para a maioria).

---

## 4) Detalhe de funcionalidades por plano

### 🆓 Inicial (Grátis) — R$ 0
Ponto de entrada para conhecer o produto.
- 1 repositório conectado
- Até **30 commits retroativos por mês**
- Modo **arquivo único**
- CLI básica + **1 token**
- Provedor: GitHub
- Histórico de 7 dias
- Dashboard básico
- Suporte da comunidade

### 🚀 Starter — R$ 19/mês (R$ 182/ano)
Para o desenvolvedor individual que já usa com frequência.
- Até **5 repositórios**
- **500 commits/mês**
- Modo **arquivo** e **projeto** (intervalo de datas)
- Distribuição realista básica
- 3 templates de mensagem
- **2 tokens** de CLI
- Histórico de 30 dias
- Métricas no dashboard
- Suporte por e-mail

### ⭐ Pro — R$ 49/mês (R$ 470/ano) — DESTAQUE
Para profissionais e freelancers que cuidam de vários projetos.
- **Repositórios ilimitados**
- **Commits ilimitados**
- **Multi-repositório em lote**
- **GitHub, GitLab e Bitbucket**
- Distribuição realista **avançada** (padrões por dia/horário)
- Templates ilimitados
- **Agendamento de jobs**
- **Webhooks**
- **5 tokens** de CLI
- Histórico ilimitado + métricas avançadas
- Suporte prioritário

### 🏢 Enterprise — R$ 149/mês (R$ 1.430/ano)
Para times e empresas com governança.
- Tudo do **Pro**
- **Organizações, equipes e permissões**
- **API pública + tokens**
- **SSO** e **auditoria completa**
- **Tokens de CLI ilimitados**
- Automações e jobs agendados avançados
- Suporte **dedicado com SLA**

---

## 5) Trial, downgrade e reembolso

- **7 dias grátis**: toda conta nova começa com **acesso completo nível Pro** por 7 dias, sem
  precisar de cartão.
- **Após o trial**: se o usuário não escolher um plano pago, a conta passa para o nível
  **Inicial** e as rotas/recursos são **reduzidos** automaticamente (gating por plano na web e na CLI).
- **Reembolso de 7 dias**: em qualquer plano pago, o usuário tem **7 dias** após a primeira
  cobrança para solicitar reembolso integral (`refund_eligible_until`).
- **Cancelamento**: a qualquer momento pelo portal Stripe; o acesso permanece até o fim do
  período já pago e depois cai para o Inicial.

---

## 6) Ciclo anual

Todos os planos pagos têm opção **anual com 20% de desconto** em relação a 12× o preço mensal:

| Plano | Mensal × 12 | Anual (−20%) | Economia |
|---|---|---|---|
| Starter | R$ 228 | **R$ 182** | R$ 46 |
| Pro | R$ 588 | **R$ 470** | R$ 118 |
| Enterprise | R$ 1.788 | **R$ 1.430** | R$ 358 |

---

## 7) Novas funcionalidades adicionadas ao transformar em SaaS

Além do que já existe (CLI, dashboard, timeline, feedbacks, tracking de instalação, guardian),
o produto ganha como SaaS:

- **Contas de usuário** (Supabase Auth) com perfil, plano e trial.
- **Assinaturas Stripe** (checkout, portal, webhook, reembolso 7d).
- **Gating por plano** na web e na CLI (limites de repos/commits/tokens/recursos).
- **Tokens de CLI** vinculados à conta — login por e-mail+senha gera token para o terminal.
- **Painel administrativo** (visão de usuários, assinaturas, receita, jobs).
- **Página de preços** e fluxo de upgrade/downgrade no dashboard.
- **Auditoria de jobs** por usuário (`commits_log`) e métricas por plano.

---

## 8) Resumo de preços (cola rápida)

```
Inicial     R$ 0
Starter     R$ 19/mês   ·  R$ 182/ano
Pro ⭐      R$ 49/mês   ·  R$ 470/ano   (destaque)
Enterprise  R$ 149/mês  ·  R$ 1.430/ano

Trial: 7 dias (nível Pro)  ·  Reembolso: 7 dias  ·  Sem cobrança por GB.
```
