# Grupos Semânticos do CommitForge

No modo `projeto`, o CommitForge analisa os arquivos do repositório e os organiza
automaticamente em 17 grupos semânticos.

## Lista de grupos

| Grupo              | Padrões detectados                                                | Mensagem gerada                           |
|--------------------|-------------------------------------------------------------------|-------------------------------------------|
| `configuração`     | `package.json`, `requirements.txt`, `*.config.*`, `*.toml`       | `chore: configuração e dependências`      |
| `estilos`          | `*.css`, `*.scss`, `*.sass`, `*.less`, `tailwind.*`               | `feat: estilos globais e design system`   |
| `componentes`      | `src/components/**`, `*.tsx`, `*.vue`, `*.svelte`                 | `feat: componentes da interface`          |
| `páginas`          | `pages/**`, `app/**`, `views/**`, `screens/**`                    | `feat: páginas e rotas da aplicação`      |
| `lógica`           | `utils/**`, `lib/**`, `helpers/**`, `services/**`                 | `feat: lógica de negócio e serviços`      |
| `api`              | `api/**`, `routes/**`, `controllers/**`, `handlers/**`            | `feat: endpoints e lógica de API`         |
| `banco`            | `models/**`, `migrations/**`, `*.sql`, `prisma/**`                | `feat: modelos de dados e banco`          |
| `testes`           | `*.test.*`, `*.spec.*`, `__tests__/**`, `test/**`                 | `test: suite de testes automatizados`     |
| `documentação`     | `*.md`, `docs/**`, `*.txt`, `*.rst`                               | `docs: documentação e guias`              |
| `assets`           | `*.png`, `*.jpg`, `*.svg`, `*.ico`, `*.gif`, `public/**`          | `feat: recursos e assets estáticos`       |
| `scripts`          | `scripts/**`, `Makefile`, `*.sh`, `*.bash`, `Justfile`            | `chore: scripts de automação`             |
| `infraestrutura`   | `Dockerfile`, `docker-compose.*`, `k8s/**`, `.github/**`          | `chore: infraestrutura e deployment`      |
| `ambiente`         | `.env*`, `.gitignore`, `.editorconfig`, `.prettierrc`             | `chore: configuração de ambiente`         |
| `tipos`            | `*.d.ts`, `types/**`, `interfaces/**`, `schemas/**`               | `feat: definições de tipos e interfaces`  |
| `i18n`             | `locales/**`, `i18n/**`, `*.po`, `*.pot`, `translations/**`       | `feat: internacionalização`               |
| `segurança`        | `auth/**`, `middleware/**`, `guards/**`, `policies/**`            | `feat: autenticação e segurança`          |
| `outros`           | Qualquer arquivo não classificado                                 | `chore: demais arquivos do projeto`       |

## Como visualizar o agrupamento antes de commitar

```bash
commitforge grupos --repo https://github.com/user/repo.git

# Saída:
#   [configuração]       4 arquivos → chore: configuração e dependências
#   [estilos]            6 arquivos → feat: estilos globais e design system
#   [componentes]       18 arquivos → feat: componentes da interface
#   [páginas]            5 arquivos → feat: páginas e rotas da aplicação
#   [documentação]       2 arquivos → docs: documentação e guias
#   Total: 5 commits serão criados no modo projeto.
```

## Personalizar mensagens

Use o parâmetro `--mensagem` para customizar o template:

```bash
commitforge commit \
  --repo URL \
  --year 2021 \
  --mensagem "build: {group} — {date}"
```

Variáveis disponíveis no template:
- `{group}` — nome do grupo semântico
- `{date}` — data do commit (YYYY-MM-DD)
- `{count}` — número de arquivos no grupo
