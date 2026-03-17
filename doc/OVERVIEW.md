# CommitForge — Visão Geral

CommitForge é uma CLI open-source que permite criar commits retroativos em repositórios Git,
com datas precisas no passado, mensagens semânticas automáticas e suporte a múltiplas plataformas.

## Por que CommitForge existe?

Desenvolvedores frequentemente trabalham em projetos por meses antes de inicializar um repositório
Git. Quando finalmente fazem o push inicial, todo o histórico é perdido — o gráfico de contribuições
fica vazio e o trabalho real não aparece nos relatórios de atividade.

CommitForge resolve isso: você aponta para um repositório, informa o período desejado, e a ferramenta
analisa a estrutura dos arquivos, cria grupos semânticos e faz commits retroativos com datas reais.

## Arquitetura

```
commitforge (CLI)
    ├── Análise semântica de arquivos
    ├── Agrupamento automático por tipo/pasta
    ├── Geração de mensagens de commit (Conventional Commits)
    ├── Controle de datas via GIT_AUTHOR_DATE / GIT_COMMITTER_DATE
    └── Push automático para o repositório remoto
```

## Modos de operação

| Modo       | Descrição                                                  |
|------------|------------------------------------------------------------|
| `projeto`  | Agrupa arquivos por tipo semântico (configs, estilos, etc.) |
| `arquivo`  | Um commit por arquivo, com data distribuída no período      |
| `interativo` | Guia passo a passo via prompts no terminal               |
| `lote`     | Processa múltiplos repositórios via arquivo JSON            |

## Plataformas suportadas

- macOS (Intel e Apple Silicon)
- Linux (Debian, Ubuntu, Fedora, Arch Linux, Manjaro)
- Windows (PowerShell + winget)
- Docker (CI/CD, ambientes isolados)

## Stack tecnológica

| Componente | Tecnologia             |
|------------|------------------------|
| CLI        | Python 3.8+ + Click    |
| Output     | Rich (terminal colors) |
| Git ops    | GitPython              |
| API calls  | Requests               |
| Config     | python-dotenv          |
| Site       | Next.js 15 + Tailwind  |
| Database   | Supabase (PostgreSQL)  |
