# Como o CommitForge Funciona

## Visão técnica do processo

Quando você executa `commitforge commit`, o sistema realiza as seguintes etapas:

### 1. Clonagem do repositório

```
commitforge commit --repo https://github.com/user/repo.git --year 2020
     ↓
Clona o repositório em /tmp/forge_abc123/
```

O repositório é clonado em um diretório temporário para não interferir com
seu ambiente de trabalho local.

### 2. Análise semântica dos arquivos

O CommitForge percorre todos os arquivos rastreados pelo Git e os agrupa
por significado semântico baseado no nome do arquivo, extensão e localização:

```
package.json, requirements.txt, go.mod  → grupo "configuração"
*.css, *.scss, tailwind.config.*        → grupo "estilos"
*.test.*, *.spec.*                      → grupo "testes"
README.md, docs/*, *.md                 → grupo "documentação"
src/components/**, *.tsx, *.vue         → grupo "componentes"
```

17 grupos semânticos são detectados automaticamente.

### 3. Criação de commits com datas retroativas

O Git permite especificar datas de author e committer via variáveis de ambiente:

```bash
GIT_AUTHOR_DATE="2020-03-15T14:32:00"
GIT_COMMITTER_DATE="2020-03-15T14:32:00"
git commit -m "feat: estilos globais"
```

CommitForge distribui os commits uniformemente ao longo do período especificado,
com opção de horários aleatórios realistas (evita padrões suspeitos como 00:00:00).

### 4. Branch dedicado

Os commits são criados em um branch separado:

```
historico-2020  ← commits retroativos aqui
main            ← branch original intacto
```

Isso garante que o trabalho atual nunca seja sobrescrito.

### 5. Push e contribuições

Após os commits locais, o CommitForge faz push do branch para o repositório remoto.
O GitHub registra os commits nas datas históricas, que aparecem no gráfico de
contribuições do ano correspondente.

**Requisito importante:** o e-mail do autor dos commits deve ser o mesmo
cadastrado na sua conta do GitHub. CommitForge detecta isso automaticamente
via `GET /user/emails` quando um token é fornecido.

## Modo Projeto vs Modo Arquivo

### Modo Projeto (`--modo projeto`)

- Analisa todos os arquivos do repositório
- Cria um commit por grupo semântico
- Mensagens no padrão Conventional Commits
- Ideal para commits de histórico de projeto

```
2020-01-10  chore: configuração e dependências        (3 arquivos)
2020-02-15  feat: estilos globais e design system     (8 arquivos)
2020-04-20  feat: componentes da interface            (21 arquivos)
2020-07-01  feat: lógica de negócio e serviços        (12 arquivos)
```

### Modo Arquivo (`--modo arquivo`)

- Um commit por arquivo por dia
- Simula o histórico de desenvolvimento real
- Ideal para preencher o gráfico de contribuições

```
2020-01-03  feat: add index.html
2020-01-04  feat: add styles.css
2020-01-05  feat: add main.js
...
```

## Segurança e privacidade

- O IP de instalação é armazenado como SHA-256 hash (irreversível)
- Tokens nunca são logados ou enviados para servidores externos
- O repositório clonado é deletado após o processo
- Todas as operações são locais; a API do GitHub é usada apenas para push e validação de token
