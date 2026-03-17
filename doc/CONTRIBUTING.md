# Contribuindo com o CommitForge

## Como contribuir

1. Faça um fork do repositório
2. Crie um branch para sua feature: `git checkout -b feat/minha-feature`
3. Faça commits seguindo o padrão Conventional Commits
4. Abra um Pull Request descrevendo as mudanças

## Padrão de commits

```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
chore: manutenção, dependências
refactor: refatoração sem mudança de comportamento
test: adição/correção de testes
perf: melhoria de performance
```

## Estrutura do projeto

```
commitforge/
├── app/                    # Next.js frontend (landing page, docs, dashboard)
│   ├── page.tsx            # Landing page principal
│   ├── docs/page.tsx       # Documentação interativa
│   ├── git/page.tsx        # Guia de referência Git
│   ├── changelog/page.tsx  # Changelog
│   ├── login/page.tsx      # Login via Supabase Auth
│   ├── dashboard/          # Dashboard administrativo
│   └── api/                # API Routes (Next.js)
│       ├── install-track/  # Rastrear instalações
│       ├── stats/          # Métricas agregadas
│       └── feedbacks/      # Sistema de feedback
├── cli-commit/             # CLI Python
│   ├── forge.py            # Motor da CLI (comandos principais)
│   ├── app.py              # Servidor Flask (API REST)
│   ├── cli.py              # Entrypoint alternativo
│   ├── install.sh          # Instalador Linux/macOS
│   ├── install-arch.sh     # Instalador Arch Linux
│   ├── install-debian.sh   # Instalador Debian/Ubuntu
│   └── install-windows.ps1 # Instalador Windows
├── components/             # Componentes React reutilizáveis
├── doc/                    # Documentação técnica
├── supabase/               # Schema SQL do banco de dados
└── public/                 # Assets estáticos
```

## Setup do ambiente de desenvolvimento

### Frontend (Next.js)

```bash
git clone https://github.com/estevam5s/commitforge.git
cd commitforge
npm install
cp .env.example .env.local
# Preencher com suas credenciais Supabase
npm run dev
```

### CLI Python

```bash
cd cli-commit
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Testar
python forge.py --help
python forge.py --version
```

## Reportar bugs

Abra uma issue em: https://github.com/estevam5s/commitforge/issues

Inclua:
- Sistema operacional e versão
- Versão do CommitForge (`commitforge --version`)
- Comando executado
- Saída completa do terminal (com erro)
