# CommitForge — Referência Completa da CLI

## Comandos disponíveis

```
commitforge --help
commitforge --version

commitforge commit        # criar commits retroativos
commitforge grupos        # visualizar agrupamento semântico
commitforge preview       # prévia sem escrever no git
commitforge validar-token # verificar token do GitHub
commitforge historico     # ver jobs anteriores
commitforge lote          # processar múltiplos repositórios
commitforge desinstalar   # remover o sistema
commitforge info          # informações do sistema
commitforge configure     # configurar usuário/token
```

---

## `commitforge commit`

Cria commits retroativos em um repositório Git.

### Sintaxe

```bash
commitforge commit [OPÇÕES]
```

### Opções

| Flag                    | Tipo          | Padrão              | Descrição                                      |
|-------------------------|---------------|---------------------|------------------------------------------------|
| `--repo, -r`            | string        | —                   | URL HTTPS ou SSH do repositório                |
| `--year, -y`            | int           | —                   | Ano completo (ex: 2020)                        |
| `--start-date`          | YYYY-MM-DD    | —                   | Data de início do período                      |
| `--end-date`            | YYYY-MM-DD    | —                   | Data de fim do período                         |
| `--dias, -d`            | int           | 30                  | Últimos N dias a partir de hoje                |
| `--modo, -M`            | projeto/arquivo | projeto           | Modo de criação de commits                     |
| `--branch`              | string        | `historico-{year}`  | Branch a criar                                 |
| `--token, -t`           | string        | `$GITHUB_TOKEN`     | Token de acesso pessoal do GitHub              |
| `--usuario`             | string        | auto-detect         | Nome do autor dos commits                      |
| `--email`               | string        | auto-detect         | E-mail do autor                                |
| `--commits-por-dia`     | int           | 1                   | Commits por dia (modo arquivo)                 |
| `--mensagem, -m`        | string        | Commit retroativo   | Template de mensagem                           |
| `--aleatorio`           | flag          | false               | Horários aleatórios realistas                  |
| `--pular-fins-de-semana`| flag          | false               | Pular sábado e domingo                         |
| `--sem-push`            | flag          | false               | Criar commits locais sem enviar ao remote      |
| `--interativo`          | flag          | false               | Modo interativo com prompts                    |

### Exemplos

```bash
# Modo interativo (recomendado para iniciantes)
commitforge commit --interativo

# Ano 2019, modo projeto
commitforge commit \
  --repo https://github.com/user/repo.git \
  --year 2019 \
  --modo projeto \
  --token ghp_xxx

# Período específico, modo arquivo
commitforge commit \
  --repo https://github.com/user/repo.git \
  --start-date 2021-01-01 \
  --end-date 2021-06-30 \
  --modo arquivo \
  --commits-por-dia 3 \
  --aleatorio

# Sem fins de semana, sem push
commitforge commit \
  --repo https://github.com/user/repo.git \
  --year 2022 \
  --pular-fins-de-semana \
  --sem-push
```

---

## `commitforge grupos`

Exibe prévia dos grupos semânticos sem modificar o repositório.

```bash
commitforge grupos --repo https://github.com/user/repo.git
commitforge grupos --repo URL --token ghp_xxx
```

**Saída esperada:**
```
  [configuração]       3 arquivos → chore: configuração e dependências
  [estilos]            2 arquivos → feat: estilos globais
  [componentes]       21 arquivos → feat: componentes da interface
  [página-principal]   1 arquivo  → feat: página principal
  Total: 4 commits serão criados no modo projeto.
```

---

## `commitforge preview`

Prévia completa dos commits sem escrever no git.

```bash
commitforge preview \
  --year 2022 \
  --commits-por-dia 2 \
  --pular-fins-de-semana
# → Total de commits: 522
```

---

## `commitforge validar-token`

```bash
commitforge validar-token --token ghp_seu_token
# ✓ Token válido!
# Login:  estevam5s
# Nome:   Estevam Souza
# Plano:  free
```

---

## `commitforge lote`

Processa múltiplos repositórios a partir de um arquivo JSON.

```bash
commitforge lote --arquivo repos.json
commitforge lote --arquivo repos.json --continuar-em-erro
commitforge lote --arquivo repos.json --sem-push
```

**Formato do `repos.json`:**

```json
{
  "token": "ghp_token_global",
  "repositorios": [
    { "repo": "https://github.com/user/projeto-a.git", "year": 2020, "modo": "projeto" },
    { "repo": "https://github.com/user/projeto-b.git", "year": 2021, "modo": "arquivo", "commits_por_dia": 2 }
  ]
}
```

---

## `commitforge desinstalar`

```bash
commitforge desinstalar        # com confirmação interativa
commitforge desinstalar -y     # sem confirmação
```

Remove: `~/.commitforge/`, `~/.local/bin/commitforge`, `~/.local/bin/forge`, entradas do PATH.

---

## `commitforge configure`

```bash
commitforge configure --token ghp_xxx
commitforge configure --usuario "Seu Nome" --email "email@example.com"
```
