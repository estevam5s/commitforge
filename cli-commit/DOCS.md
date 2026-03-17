# CommitForge — Documentação Completa

> Crie commits retroativos no Git com datas do passado via CLI ou interface web.

---

## Índice

1. [O que é o CommitForge](#1-o-que-é-o-commitforge)
2. [Como funciona](#2-como-funciona)
3. [Instalação](#3-instalação)
4. [Configuração](#4-configuração)
5. [Interface Web](#5-interface-web)
6. [CLI — Linha de Comando](#6-cli--linha-de-comando)
7. [Modos de Commit](#7-modos-de-commit)
8. [Modos de Data](#8-modos-de-data)
9. [Token do GitHub](#9-token-do-github)
10. [API REST](#10-api-rest)
11. [Docker](#11-docker)
12. [Exemplos Práticos](#12-exemplos-práticos)
13. [Solução de Problemas](#13-solução-de-problemas)

---

## 1. O que é o CommitForge

O **CommitForge** é uma ferramenta local que clona um repositório Git, cria commits com datas retroativas usando as variáveis de ambiente `GIT_AUTHOR_DATE` e `GIT_COMMITTER_DATE` do Git, e envia esses commits ao repositório remoto via `git push --force`.

**Casos de uso legítimos:**

- Migrar um projeto antigo para o GitHub preservando as datas reais de desenvolvimento
- Recriar o histórico de um repositório que teve seus commits perdidos
- Testar pipelines de CI/CD que dependem de datas de commit
- Demonstrações e estudos sobre comportamento do Git

---

## 2. Como funciona

```
Você informa → URL do repo + período desejado
      ↓
CommitForge clona o repositório localmente
      ↓
Agrupa os arquivos por tipo (modo Projeto)
ou gera entradas em um arquivo de log (modo Arquivo)
      ↓
Para cada grupo/dia, cria um commit com:
  GIT_AUTHOR_DATE    = data retroativa
  GIT_COMMITTER_DATE = data retroativa
      ↓
git push --force para o branch alvo
```

O GitHub, GitLab e Bitbucket registram a data informada nas variáveis de ambiente, não a data do sistema — por isso os commits aparecem no passado no histórico e no gráfico de contribuições.

---

## 3. Instalação

### Pré-requisitos

- Python 3.9 ou superior
- Git instalado e configurado
- Acesso ao repositório de destino (com permissão de push)

### Passo a passo

```bash
# 1. Clone este repositório
git clone https://github.com/estevam5s/retro-commit.git
cd retro-commit

# 2. Crie e ative um ambiente virtual
python3 -m venv venv
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows

# 3. Instale as dependências
pip install -r requirements.txt
```

**Dependências instaladas:**

| Pacote | Versão | Função |
|--------|--------|--------|
| flask | 2.3.3 | Servidor web e API REST |
| gitpython | 3.1.40 | Operações Git via Python |
| click | 8.1.7 | Interface de linha de comando |
| rich | 13.7.0 | UI rica no terminal |
| requests | 2.31.0 | Chamadas à API do GitHub |
| python-dotenv | 1.0.0 | Variáveis de ambiente |
| gunicorn | 21.2.0 | Servidor WSGI para produção |

---

## 4. Configuração

### Arquivo `.env` (opcional)

Crie um arquivo `.env` dentro da pasta `cli-commit/` para definir variáveis padrão:

```env
# Token do GitHub (evita digitar a cada uso)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx

# Porta do servidor (padrão: 5000)
PORT=5000

# Nível de debug (true = modo desenvolvimento)
DEBUG=true

# Limite máximo de commits por processo (padrão: 5000)
MAX_COMMITS=5000

# Diretório onde os repos são clonados temporariamente
UPLOAD_FOLDER=repos
```

### Configurar usuário Git global (recomendado)

Para que os commits exibam seu nome corretamente:

```bash
git config --global user.name  "Seu Nome"
git config --global user.email "seu@email.com"
```

---

## 5. Interface Web

### Iniciar o servidor

```bash
cd cli-commit
source venv/bin/activate
python app.py
```

Acesse em: **http://localhost:5000**

### Campos do formulário

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| URL do Repositório | Sim | URL HTTPS ou SSH do repo de destino |
| Modo de Commit | Sim | `Projeto` (arquivos reais) ou `Arquivo` (log) |
| Modo de Data | Sim | Por Ano, Intervalo ou Últimos N dias |
| Commits por Dia | Não | Quantos commits criar por dia (1–10) |
| Mensagem de Commit | Não | Template com `{date}` como placeholder |
| Nome do Arquivo | Não | Arquivo modificado no modo Arquivo |
| Nome de Autor | Não | Sobrescreve `git config user.name` |
| Email de Autor | Não | Sobrescreve `git config user.email` |
| Token do GitHub | Não* | Necessário para repos privados |
| Nome do Branch | Não | Branch alvo (padrão: `historico-YYYY`) |
| Enviar ao remoto | Não | Fazer `push` ao final (padrão: ligado) |
| Horários aleatórios | Não | Varia o horário dos commits (mais natural) |
| Pular fins de semana | Não | Commits somente em dias úteis |

*Obrigatório para repositórios privados.

### Abas disponíveis

- **Criar Commits** — formulário principal
- **Histórico** — lista de todos os processos executados com status e progresso
- **Sobre** — informações da ferramenta

---

## 6. CLI — Linha de Comando

### Iniciar o servidor via CLI

A CLI requer que o servidor Flask esteja rodando:

```bash
# Opção 1: pelo comando dedicado
python cli.py servidor

# Opção 2: diretamente
python app.py
```

### Sintaxe geral

```bash
python cli.py COMANDO [OPÇÕES]
```

### Comando `commit`

```bash
python cli.py commit --repo URL [OPÇÕES]
```

**Opções:**

| Flag | Atalho | Padrão | Descrição |
|------|--------|--------|-----------|
| `--repo` | `-r` | — | URL do repositório (obrigatório) |
| `--year` | `-y` | — | Ano completo (ex: `2020`) |
| `--start-date` | — | — | Data de início `YYYY-MM-DD` |
| `--end-date` | — | — | Data de fim `YYYY-MM-DD` |
| `--dias` | `-d` | — | Últimos N dias a partir de hoje |
| `--modo` | `-M` | `arquivo` | `projeto` ou `arquivo` |
| `--branch` | — | `historico-YYYY` | Nome do branch de destino |
| `--commits-por-dia` | — | `1` | Commits por dia (1–10) |
| `--mensagem` | `-m` | `Commit retroativo: {date}` | Template da mensagem |
| `--arquivo` | `-f` | `data.txt` | Arquivo modificado (modo arquivo) |
| `--token` | `-t` | — | Token de acesso pessoal |
| `--usuario` | — | — | Nome do autor nos commits |
| `--email` | — | — | Email do autor nos commits |
| `--sem-push` | — | desligado | Não enviar ao repositório remoto |
| `--aleatorio` | — | desligado | Horários aleatórios |
| `--pular-fins-de-semana` | — | desligado | Somente dias úteis |
| `--nao-aguardar` | — | desligado | Não aguardar o término |

### Comando `status`

```bash
# Listar todos os processos
python cli.py status

# Ver detalhes de um processo específico
python cli.py status --job job_1234567890
```

### Comando `historico`

```bash
python cli.py historico
```

Lista todos os processos executados com ID, repositório, período, commits e status.

### Comando `cancelar`

```bash
python cli.py cancelar --job job_1234567890
```

### Comando `preview`

Mostra quantos commits seriam criados, sem criar nada:

```bash
python cli.py preview --year 2020
python cli.py preview --start-date 2019-01-01 --end-date 2019-12-31
python cli.py preview --dias 90 --commits-por-dia 2 --pular-fins-de-semana
```

### Comando `validar-token`

```bash
python cli.py validar-token --token ghp_xxxxxxxxxxxxxxxxx
```

Exibe o usuário, nome e escopos do token.

### Comando `info`

```bash
python cli.py info
```

Mostra versão, status do servidor, token configurado e diretório.

---

## 7. Modos de Commit

### Modo `projeto` — Arquivos reais do repositório

O CommitForge usa `git ls-files` para detectar todos os arquivos rastreados, agrupa-os por tipo em commits semânticos e distribui as datas uniformemente pelo período escolhido.

**Grupos criados automaticamente:**

| Grupo | Arquivos incluídos | Mensagem do commit |
|-------|-------------------|-------------------|
| configuração | `package.json`, `tsconfig.json`, `next.config*`, `.gitignore`, `*.lock`... | `chore: configuração e dependências do projeto` |
| assets | `public/*`, `static/*`, `assets/*` | `feat: recursos e assets estáticos` |
| estilos | `*.css`, `*.scss`, `app/globals*`, `styles/*` | `feat: estilos globais e design system` |
| layout | `app/layout*`, `app/loading*`, `app/error*` | `feat: layout base e estrutura da aplicação` |
| utilitarios | `lib/*`, `hooks/*`, `utils/*` | `feat: utilitários, hooks e funções auxiliares` |
| componentes-base | `components/ui/button*`, `input*`, `label*`, `badge*`... | `feat: componentes UI base e formulários` |
| componentes-nav | `navigation*`, `menu*`, `tabs*`, `sidebar*`... | `feat: componentes de navegação` |
| componentes-overlay | `dialog*`, `drawer*`, `tooltip*`, `dropdown*`... | `feat: componentes de overlay e modais` |
| componentes-dados | `table*`, `card*`, `chart*`, `calendar*`... | `feat: componentes de dados e visualização` |
| componentes-util | demais `components/ui/*` | `feat: componentes utilitários` |
| pagina-principal | `app/page*` | `feat: página principal e landing page` |
| paginas | `app/**/page*`, `pages/*` | `feat: páginas da aplicação` |
| readme | `README*`, `*.md` | `docs: documentação do projeto` |

Arquivos que não se encaixam em nenhum grupo vão para um commit final `chore: demais arquivos do projeto`.

**Este modo cria um branch órfão** (sem histórico anterior), garantindo que o histórico exibido no GitHub reflita exatamente os commits retroativos.

### Modo `arquivo` — Log único

Cria commits adicionando uma linha de texto a um arquivo de log (`data.txt` por padrão) para cada data do período. Útil para preencher o gráfico de contribuições sem alterar código existente.

---

## 8. Modos de Data

### Por Ano

Preenche o ano inteiro, de 1º de janeiro a 31 de dezembro.

```bash
# CLI
python cli.py commit --repo URL --year 2020

# Web: selecione "Por Ano" e informe o ano
```

### Intervalo de Datas

Define exatamente o período desejado.

```bash
# CLI
python cli.py commit --repo URL --start-date 2019-03-01 --end-date 2019-11-30

# Web: selecione "Intervalo de Datas"
```

### Últimos N Dias

Cria commits retroativos contados a partir de hoje.

```bash
# CLI — últimos 60 dias
python cli.py commit --repo URL --dias 60

# Web: selecione "Últimos N Dias" e mova o slider
```

---

## 9. Token do GitHub

Um token de acesso pessoal é **necessário** para repositórios privados e **recomendado** para repositórios públicos (evita limite de requisições).

### Como gerar o token

1. Acesse **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Clique em **Generate new token (classic)**
3. Selecione os escopos:
   - `repo` — acesso completo a repositórios (necessário para push)
   - `workflow` — se o repositório usar GitHub Actions
4. Clique em **Generate token** e copie o valor gerado

> O token começa com `ghp_` e não será exibido novamente após fechar a página.

### Usar o token

```bash
# Via CLI
python cli.py commit --repo https://github.com/user/repo.git --year 2020 --token ghp_xxx

# Via variável de ambiente (não precisa digitar toda vez)
export GITHUB_TOKEN=ghp_xxx
python cli.py commit --repo URL --year 2020

# Via arquivo .env
echo "GITHUB_TOKEN=ghp_xxx" >> .env
```

### Validar o token

```bash
python cli.py validar-token --token ghp_xxx
```

Saída esperada:
```
✓ Token válido!
  Usuário:  seu-usuario
  Nome:     Seu Nome
  Escopos:  repo, workflow
```

---

## 10. API REST

O servidor Flask expõe os seguintes endpoints:

### `POST /api/start-job`

Inicia um processo de criação de commits.

**Body JSON:**

```json
{
  "repo_url": "https://github.com/user/repo.git",
  "commit_mode": "projeto",
  "year": 2020,
  "commits_per_day": 1,
  "random_times": true,
  "skip_weekends": false,
  "push": true,
  "github_token": "ghp_xxx",
  "branch_name": "historico-2020",
  "custom_username": "Seu Nome",
  "custom_email": "seu@email.com"
}
```

Campos alternativos para data (use um dos três):

```json
{ "year": 2020 }
{ "start_date": "2019-01-01", "end_date": "2019-12-31" }
{ "num_days": 90 }
```

**Resposta:**

```json
{
  "status": "success",
  "job_id": "job_1234567890123",
  "commit_mode": "projeto",
  "use_api": true
}
```

### `GET /api/job-status/<job_id>`

Retorna o status atual de um processo.

**Resposta:**

```json
{
  "status": "success",
  "job": {
    "id": "job_1234567890123",
    "repo_url": "https://github.com/user/repo.git",
    "status": "running",
    "progress": 42,
    "commits_made": 6,
    "total_commits": 14,
    "branch": "historico-2020",
    "start_time": 1700000000.0
  }
}
```

**Status possíveis:** `cloning` → `running` → `pushing` → `completed` | `failed` | `cancelled`

### `GET /api/jobs`

Lista todos os processos.

### `POST /api/cancel-job/<job_id>`

Cancela um processo em andamento.

### `POST /api/clean-job/<job_id>`

Remove os arquivos temporários de um processo concluído.

### `POST /api/preview`

Retorna uma prévia sem criar commits.

```json
{
  "year": 2020,
  "commits_per_day": 2,
  "skip_weekends": true
}
```

### `POST /api/validate-token`

```json
{ "token": "ghp_xxx" }
```

### `GET /api/config`

Retorna a configuração atual do servidor (versão, limites, modos suportados).

---

## 11. Docker

### Build e execução

```bash
cd cli-commit

# Build
docker build -t commitforge .

# Executar
docker run -p 5000:5000 commitforge

# Com token e variáveis personalizadas
docker run -p 5000:5000 \
  -e GITHUB_TOKEN=ghp_xxx \
  -e MAX_COMMITS=10000 \
  commitforge
```

Acesse: **http://localhost:5000**

### Docker Compose (opcional)

Crie um arquivo `docker-compose.yml`:

```yaml
version: "3.8"
services:
  commitforge:
    build: .
    ports:
      - "5000:5000"
    environment:
      - GITHUB_TOKEN=ghp_xxx
      - MAX_COMMITS=5000
      - DEBUG=false
    volumes:
      - ./repos:/app/repos
```

```bash
docker compose up -d
```

---

## 12. Exemplos Práticos

### Exemplo 1 — Preencher o ano 2020 inteiro (modo arquivo)

```bash
python cli.py commit \
  --repo https://github.com/user/meu-projeto.git \
  --year 2020 \
  --modo arquivo \
  --token ghp_xxx \
  --aleatorio
```

Resultado: 365 commits de 01/jan/2020 a 31/dez/2020 com horários variados.

---

### Exemplo 2 — Commitar arquivos reais do projeto com datas de 2019

```bash
python cli.py commit \
  --repo https://github.com/user/meu-projeto.git \
  --year 2019 \
  --modo projeto \
  --branch historico-2019 \
  --token ghp_xxx \
  --aleatorio
```

Resultado: branch `historico-2019` com commits agrupados semanticamente (configuração → assets → estilos → layout → componentes → página principal → documentação), cada um com uma data diferente de 2019.

---

### Exemplo 3 — Intervalo específico, somente dias úteis

```bash
python cli.py commit \
  --repo https://github.com/user/repo.git \
  --start-date 2018-06-01 \
  --end-date 2018-12-31 \
  --modo arquivo \
  --commits-por-dia 3 \
  --pular-fins-de-semana \
  --token ghp_xxx
```

Resultado: 3 commits por dia útil entre junho e dezembro de 2018.

---

### Exemplo 4 — Últimos 90 dias, sem enviar ao remote

```bash
python cli.py commit \
  --repo https://github.com/user/repo.git \
  --dias 90 \
  --sem-push
```

Útil para testar localmente antes de enviar.

---

### Exemplo 5 — Prévia antes de executar

```bash
python cli.py preview \
  --year 2021 \
  --commits-por-dia 2 \
  --pular-fins-de-semana
```

Saída:
```
Prévia CommitForge
  Período:       2021-01-01 → 2021-12-31
  Commits/dia:   2
  Fins semana:   Pulados
  Total commits: 522

  Primeiros commits:
    2021-01-04 12:00:00
    2021-01-04 12:00:00
    2021-01-05 12:00:00
```

---

### Exemplo 6 — Via API com curl

```bash
# Iniciar um processo
curl -X POST http://localhost:5000/api/start-job \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/user/repo.git",
    "commit_mode": "projeto",
    "year": 2020,
    "github_token": "ghp_xxx",
    "random_times": true
  }'

# Verificar progresso (substitua o job_id)
curl http://localhost:5000/api/job-status/job_1234567890123
```

---

## 13. Solução de Problemas

### Servidor não está rodando

```
✗ Servidor CommitForge não está rodando.
```

**Solução:** inicie o servidor antes de usar a CLI:

```bash
python app.py
# ou
python cli.py servidor
```

---

### Erro de autenticação no push

```
Push falhou: remote: Invalid username or password.
```

**Causas e soluções:**

1. **Token ausente ou inválido** — gere um novo token em `github.com/settings/tokens`
2. **Token sem escopo `repo`** — edite o token e adicione o escopo
3. **Repositório privado sem token** — passe `--token ghp_xxx`
4. **2FA ativo sem token** — tokens são obrigatórios com autenticação de dois fatores

---

### Erro ao clonar repositório

```
Erro ao clonar: Repository not found
```

**Soluções:**

- Verifique se a URL está correta (deve terminar em `.git`)
- Confirme que você tem acesso ao repositório
- Para repos privados, use `--token` com escopo `repo`

---

### Branch órfão falhou

Se o CommitForge não conseguir criar o branch órfão, ele cria um branch normal com sufixo numérico (ex: `historico-2019-4521`). Isso é um fallback automático e funciona normalmente.

---

### Limite de commits excedido

```
Total de commits (6000) excede o limite máximo!
```

**Solução:** aumente o limite no `.env`:

```env
MAX_COMMITS=10000
```

Ou reduza o período / número de commits por dia.

---

### Repositório clonado ocupando espaço

Os repositórios clonados ficam em `cli-commit/repos/`. Para limpar:

```bash
# Via interface web: aba Histórico → ícone de lixeira no processo
# Via CLI
python cli.py status           # anote o job_id
# ou remova manualmente
rm -rf cli-commit/repos/
```

---

### `git push --force` recusado

Alguns repositórios têm proteção de branch ativada. Para contornar:

1. Acesse **GitHub → Settings → Branches → Branch protection rules**
2. Desative "Require pull request reviews" e "Restrict who can push" temporariamente
3. Execute o CommitForge
4. Reative as proteções

---

## Estrutura do Projeto

```
cli-commit/
├── app.py              # Servidor Flask + lógica de commits
├── cli.py              # CLI (Click + Rich)
├── requirements.txt    # Dependências Python
├── Dockerfile          # Containerização
├── .gitignore
├── DOCS.md             # Esta documentação
├── static/
│   ├── css/
│   │   └── styles.css  # Estilos da interface web
│   └── js/
│       └── main.js     # JavaScript da interface web
├── templates/
│   └── index.html      # Interface web (HTML)
└── repos/              # Repositórios clonados (gerado automaticamente)
```

---

*CommitForge v2.1 — Use com responsabilidade e em conformidade com os termos de serviço da plataforma Git que você utiliza.*
