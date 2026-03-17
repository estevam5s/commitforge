#!/usr/bin/env python3
"""
forge.py — CommitForge Standalone v3.0
Commits retroativos sem necessidade de servidor Flask.

Uso:
  python forge.py commit --repo URL --year 2020 --modo projeto --token ghp_xxx
  python forge.py commit --interativo
  python forge.py grupos  --repo URL
  python forge.py preview --year 2020 --commits-por-dia 2
  python forge.py validar-token --token ghp_xxx
  python forge.py historico
"""

import os
import sys
import re
import time
import json
import random
import shutil
import fnmatch
import tempfile
import threading
from datetime import datetime, timedelta
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse

# ── Dependências opcionais com fallback ─────────────────────────────
try:
    import click
except ImportError:
    print("Erro: instale as dependências — pip install -r requirements.txt")
    sys.exit(1)

try:
    import git
except ImportError:
    print("Erro: gitpython não instalado — pip install gitpython")
    sys.exit(1)

try:
    import requests as _requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    from rich.console import Console
    from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn, TaskProgressColumn
    from rich.table import Table
    from rich.panel import Panel
    from rich import box
    from rich.prompt import Prompt, Confirm
    HAS_RICH = True
except ImportError:
    HAS_RICH = False

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))
except ImportError:
    pass

VERSION   = '1.0.0'
SYNODIC   = 29.530589
MAX_COMMITS = int(os.getenv('MAX_COMMITS', '5000'))
HISTORY_FILE = os.path.join(os.path.dirname(__file__), '.forge_history.json')

console = Console() if HAS_RICH else None


# ── Output helpers ────────────────────────────────────────────────────

def out(msg, style=None, nl=True):
    if HAS_RICH and console:
        console.print(msg, style=style, end='\n' if nl else '')
    else:
        import re as _re
        print(_re.sub(r'\[/?[^\]]+\]', '', str(msg)))


def success(msg): out(f'[bold green]✓[/bold green] {msg}')
def error(msg):   out(f'[bold red]✗[/bold red]   {msg}')
def info(msg):    out(f'[dim]→ {msg}[/dim]')
def warn(msg):    out(f'[yellow]⚠[/yellow]  {msg}')


def banner():
    if HAS_RICH:
        art = (
            '[bold green] ██████╗ ██████╗ [/bold green][bold white]███╗   ███╗███╗   ███╗██╗████████╗[/bold white]\n'
            '[bold green]██╔════╝██╔═══██╗[/bold green][bold white]████╗ ████║████╗ ████║██║╚══██╔══╝[/bold white]\n'
            '[bold green]██║     ██║   ██║[/bold green][bold white]██╔████╔██║██╔████╔██║██║   ██║   [/bold white]\n'
            '[bold green]██║     ██║   ██║[/bold green][bold white]██║╚██╔╝██║██║╚██╔╝██║██║   ██║   [/bold white]\n'
            '[bold green]╚██████╗╚██████╔╝[/bold green][bold white]██║ ╚═╝ ██║██║ ╚═╝ ██║██║   ██║   [/bold white]\n'
            '[bold green] ╚═════╝ ╚═════╝ [/bold green][bold white]╚═╝     ╚═╝╚═╝     ╚═╝╚═╝   ╚═╝   [/bold white]'
        )
        sub = (
            f'  [dim]Forge[/dim] [bold white]v{VERSION}[/bold white]  '
            '[dim]·  Commits retroativos no Git  ·  '
            'github.com/estevam5s/commitforge[/dim]'
        )
        console.print(Panel(
            art + '\n\n' + sub,
            border_style='green',
            padding=(0, 1),
            expand=False,
        ))
    else:
        print(f'\n  ╔══════════════════════════╗')
        print(f'  ║  CommitForge  v{VERSION}  ║')
        print(f'  ╚══════════════════════════╝\n')


# ── Histórico local ───────────────────────────────────────────────────

def _load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    return []


def _save_history(entry):
    history = _load_history()
    history.insert(0, entry)
    history = history[:50]  # mantém os 50 mais recentes
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2, default=str)


# ── Padrões de agrupamento ────────────────────────────────────────────

FILE_GROUPS = [
    ('configuração',
     ['package.json', 'tsconfig.json', 'next.config*', 'postcss.config*',
      'components.json', 'tailwind.config*', '.gitignore', '.eslintrc*',
      '.prettierrc*', '*.lock', 'Dockerfile', 'docker-compose*',
      '.env*', 'requirements.txt', 'setup.py', 'pyproject.toml',
      'Makefile', '.editorconfig'],
     'chore: configuração e dependências do projeto'),

    ('assets',
     ['public/*', 'static/*', 'assets/*', 'media/*', 'images/*'],
     'feat: recursos e assets estáticos'),

    ('estilos',
     ['*.css', '*.scss', '*.sass', '*.less',
      'app/globals*', 'styles/*', 'src/styles/*'],
     'feat: estilos globais e design system'),

    ('layout',
     ['app/layout*', 'app/loading*', 'app/error*', 'app/not-found*',
      'src/layout*', 'layouts/*'],
     'feat: layout base e estrutura da aplicação'),

    ('utilitarios',
     ['lib/*', 'utils/*', 'helpers/*', 'hooks/*',
      'src/lib/*', 'src/utils/*', 'src/hooks/*'],
     'feat: utilitários, hooks e funções auxiliares'),

    ('componentes-base',
     ['components/ui/button*', 'components/ui/input*', 'components/ui/label*',
      'components/ui/badge*', 'components/ui/separator*', 'components/ui/textarea*',
      'components/ui/select*', 'components/ui/checkbox*', 'components/theme*',
      'src/components/ui/button*', 'src/components/ui/input*'],
     'feat: componentes UI base e formulários'),

    ('componentes-nav',
     ['components/ui/navigation*', 'components/ui/menu*', 'components/ui/tabs*',
      'components/ui/breadcrumb*', 'components/ui/pagination*', 'components/ui/sidebar*'],
     'feat: componentes de navegação'),

    ('componentes-overlay',
     ['components/ui/dialog*', 'components/ui/drawer*', 'components/ui/sheet*',
      'components/ui/popover*', 'components/ui/hover*', 'components/ui/alert-dialog*',
      'components/ui/tooltip*', 'components/ui/dropdown*', 'components/ui/command*',
      'components/ui/context*'],
     'feat: componentes de overlay e modais'),

    ('componentes-dados',
     ['components/ui/table*', 'components/ui/card*', 'components/ui/chart*',
      'components/ui/calendar*', 'components/ui/carousel*', 'components/ui/accordion*',
      'components/ui/collapsible*', 'components/ui/avatar*', 'components/ui/aspect*'],
     'feat: componentes de dados e visualização'),

    ('componentes-util',
     ['components/ui/*', 'src/components/ui/*'],
     'feat: componentes utilitários'),

    ('pagina-principal',
     ['app/page*', 'src/app/page*', 'index.html', 'index.tsx', 'index.jsx'],
     'feat: página principal e landing page'),

    ('paginas',
     ['app/**/page*', 'pages/*', 'src/pages/*', 'views/*'],
     'feat: páginas da aplicação'),

    ('backend',
     ['app.py', 'server.py', 'main.py', 'api.py', 'wsgi.py',
      'cli-commit/app.py', 'backend/*', 'api/*', 'routes/*'],
     'feat: backend e API'),

    ('cli',
     ['cli.py', 'forge.py', 'cli-commit/cli.py', 'bin/*', 'scripts/*'],
     'feat: interface de linha de comando (CLI)'),

    ('templates',
     ['templates/*', '*.html', 'cli-commit/templates/*'],
     'feat: templates e interface web'),

    ('testes',
     ['test_*', '*_test.*', 'tests/*', '__tests__/*', '*.spec.*', '*.test.*'],
     'test: testes automatizados'),

    ('readme',
     ['README*', '*.md', 'CHANGELOG*', 'CONTRIBUTING*', 'LICENSE*'],
     'docs: documentação do projeto'),
]


def _match(filepath, pattern):
    """Casamento de padrão glob respeitando separadores de diretório."""
    fp  = filepath.replace('\\', '/')
    pat = pattern.replace('\\', '/')

    if fnmatch.fnmatch(fp, pat):
        return True

    if '**' in pat:
        cleaned = pat.replace('**/', '').replace('**', '*')
        if fnmatch.fnmatch(fp, cleaned):
            return True

    # Casamento por nome simples apenas quando o padrão não tem '/'
    if '/' not in pat:
        name = PurePosixPath(fp).name
        if fnmatch.fnmatch(name, pat):
            return True

    return False


def group_files(repo_path, custom_groups=None):
    """
    Agrupa os arquivos rastreados do repositório em commits semânticos.
    custom_groups sobrescreve FILE_GROUPS se fornecido.
    """
    try:
        repo = git.Repo(repo_path)
        all_files = repo.git.ls_files().splitlines()
    except Exception as e:
        raise RuntimeError(f'Erro ao listar arquivos: {e}')

    all_files = [f for f in all_files if (Path(repo_path) / f).is_file()]

    groups_def = custom_groups or FILE_GROUPS
    assigned   = set()
    groups     = []

    for key, patterns, message in groups_def:
        matched = []
        for f in all_files:
            if f in assigned:
                continue
            for p in patterns:
                if _match(f, p):
                    matched.append(f)
                    assigned.add(f)
                    break
        if matched:
            groups.append({'files': matched, 'message': message, 'group': key})

    remaining = [f for f in all_files if f not in assigned]
    if remaining:
        groups.append({
            'files': remaining,
            'message': 'chore: demais arquivos do projeto',
            'group': 'outros',
        })

    return groups


def distribute_dates(groups, start_dt, end_dt, random_times=False):
    """Distribui datas uniformemente entre start_dt e end_dt."""
    total      = len(groups)
    total_days = max(1, (end_dt - start_dt).days)
    step       = max(1, total_days // total)

    for i, g in enumerate(groups):
        offset = min(i * step, total_days)
        dt = start_dt + timedelta(days=offset)

        if random_times:
            dt = dt.replace(
                hour=random.randint(8, 22),
                minute=random.randint(0, 59),
                second=random.randint(0, 59),
            )
        else:
            dt = dt.replace(hour=9 + (i % 8), minute=random.randint(0, 59), second=0)

        g['date'] = dt

    return groups


def build_date_list(start_dt, end_dt, commits_per_day=1, skip_weekends=False, random_times=False):
    """Gera lista de datetimes para o modo arquivo."""
    dates = []
    cur   = start_dt

    while cur <= end_dt:
        if skip_weekends and cur.weekday() >= 5:
            cur += timedelta(days=1)
            continue

        for _ in range(commits_per_day):
            if random_times:
                dt = cur.replace(
                    hour=random.randint(7, 23),
                    minute=random.randint(0, 59),
                    second=random.randint(0, 59),
                )
            else:
                dt = cur.replace(hour=12, minute=0, second=0)
            dates.append(dt)

        cur += timedelta(days=1)

    return dates


# ── Operações Git ─────────────────────────────────────────────────────

def clone_repo(repo_url, dest, github_token=None):
    """Clona o repositório. Injeta token se fornecido."""
    clone_url = repo_url
    if github_token and repo_url.startswith('https://'):
        parsed   = urlparse(repo_url)
        clone_url = repo_url.replace(parsed.netloc, f'{github_token}@{parsed.netloc}')

    git.Repo.clone_from(clone_url, dest)
    repo = git.Repo(dest)

    # Configura remote com token para o push posterior
    if github_token and repo_url.startswith('https://'):
        repo.git.remote('set-url', 'origin', clone_url)

    return repo


def configure_user(repo, username=None, email=None):
    """
    Configura o autor do commit no repositório local.
    IMPORTANTE: o e-mail deve ser um e-mail verificado da conta GitHub
    para que os commits apareçam no gráfico de contribuições.
    """
    if username or email:
        with repo.config_writer() as cfg:
            if username:
                cfg.set_value('user', 'name', username)
            if email:
                cfg.set_value('user', 'email', email)


def do_push(repo, branch, github_token=None, repo_url=None):
    """Tenta push com fallback para URL autenticada."""
    try:
        repo.git.push('--force', '--set-upstream', 'origin', branch)
        return True
    except git.GitCommandError:
        pass

    if github_token and repo_url and repo_url.startswith('https://'):
        parsed   = urlparse(repo_url)
        auth_url = repo_url.replace(parsed.netloc, f'{github_token}@{parsed.netloc}')
        repo.git.remote('set-url', 'origin', auth_url)
        try:
            repo.git.push('--force', '--set-upstream', 'origin', branch)
            return True
        except git.GitCommandError as e:
            raise RuntimeError(f'Push falhou: {e}')

    raise RuntimeError('Push falhou: nenhum método de autenticação disponível.')


def validate_github_token(token):
    """Valida token via API do GitHub. Retorna dados do usuário ou None."""
    if not HAS_REQUESTS:
        warn('requests não instalado — não é possível validar o token via API.')
        return None
    try:
        r = _requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'token {token}'},
            timeout=10,
        )
        if r.status_code == 200:
            return r.json()
        return None
    except Exception:
        return None


def get_github_user_email(token):
    """
    Busca o e-mail principal verificado da conta GitHub via API.
    Necessário para que commits apareçam no gráfico de contribuições.
    Retorna (nome, email) ou (None, None).
    """
    if not HAS_REQUESTS:
        return None, None
    headers = {'Authorization': f'token {token}'}
    try:
        # Nome e login
        user_data = validate_github_token(token)
        name  = (user_data or {}).get('name') or (user_data or {}).get('login')

        # E-mail primário verificado
        r = _requests.get(
            'https://api.github.com/user/emails',
            headers=headers,
            timeout=10,
        )
        if r.status_code == 200:
            emails = r.json()
            # Preferir: primary + verified
            for entry in emails:
                if entry.get('primary') and entry.get('verified'):
                    return name, entry['email']
            # Fallback: qualquer verificado
            for entry in emails:
                if entry.get('verified'):
                    return name, entry['email']
        return name, None
    except Exception:
        return None, None


# ── Núcleo: Modo Projeto ──────────────────────────────────────────────

def run_projeto(repo_path, repo_url, start_dt, end_dt, branch_name,
                github_token=None, username=None, email=None,
                push=True, random_times=False,
                on_progress=None, on_commit=None):
    """
    Commita arquivos reais agrupados com datas retroativas.
    on_progress(i, total)  — callback de progresso
    on_commit(msg, files)  — callback por commit
    """
    repo = git.Repo(repo_path)

    # Auto-detectar nome e e-mail do GitHub para garantir que commits
    # apareçam no gráfico de contribuições e na atividade do usuário
    if github_token and (not username or not email):
        auto_name, auto_email = get_github_user_email(github_token)
        if not username and auto_name:
            username = auto_name
        if not email and auto_email:
            email = auto_email
            info(f'E-mail do GitHub detectado automaticamente: {email}')
        elif not email:
            warn('Não foi possível detectar o e-mail do GitHub via API.')
            warn('Os commits podem não aparecer no gráfico de contribuições.')
            warn('Use --email com o e-mail verificado da sua conta GitHub.')

    configure_user(repo, username, email)

    groups = group_files(repo_path)
    if not groups:
        raise RuntimeError('Nenhum arquivo encontrado no repositório.')

    groups = distribute_dates(groups, start_dt, end_dt, random_times)
    total  = len(groups)

    # Branch órfão
    try:
        repo.git.checkout('--orphan', branch_name)
        repo.git.rm('-rf', '--cached', '.')
    except git.GitCommandError:
        branch_name += f'-{int(time.time()) % 10000}'
        repo.git.checkout('-b', branch_name)

    commits_made = 0

    for i, g in enumerate(groups):
        fmt = g['date'].strftime('%Y-%m-%d %H:%M:%S')
        staged = 0
        for f in g['files']:
            fp = os.path.join(repo_path, f)
            if os.path.exists(fp):
                try:
                    repo.git.add(f)
                    staged += 1
                except Exception:
                    pass

        if staged == 0:
            continue

        try:
            diff = repo.git.diff('--cached', '--name-only')
            if not diff.strip():
                continue
        except Exception:
            pass

        env = os.environ.copy()
        env['GIT_AUTHOR_DATE']    = fmt
        env['GIT_COMMITTER_DATE'] = fmt

        try:
            repo.git.commit(m=g['message'], env=env)
            commits_made += 1
            if on_commit:
                on_commit(g['message'], g['files'], fmt)
        except git.GitCommandError:
            continue

        if on_progress:
            on_progress(i + 1, total)

    if push and commits_made > 0:
        do_push(repo, branch_name, github_token, repo_url)

    return commits_made, branch_name


# ── Núcleo: Modo Arquivo ──────────────────────────────────────────────

def run_arquivo(repo_path, repo_url, start_dt, end_dt, branch_name,
                message_template='Commit retroativo: {date}',
                filename='data.txt', commits_per_day=1,
                skip_weekends=False, github_token=None,
                username=None, email=None, push=True,
                random_times=False, on_progress=None, on_commit=None):
    """Commita adicionando linhas a um arquivo de log."""
    repo = git.Repo(repo_path)

    # Auto-detectar nome e e-mail do GitHub para garantir contribuições visíveis
    if github_token and (not username or not email):
        auto_name, auto_email = get_github_user_email(github_token)
        if not username and auto_name:
            username = auto_name
        if not email and auto_email:
            email = auto_email
            info(f'E-mail do GitHub detectado automaticamente: {email}')
        elif not email:
            warn('Não foi possível detectar o e-mail GitHub — use --email.')

    configure_user(repo, username, email)

    dates = build_date_list(start_dt, end_dt, commits_per_day, skip_weekends, random_times)
    total = len(dates)

    if total > MAX_COMMITS:
        raise ValueError(f'Total de commits ({total}) excede o limite ({MAX_COMMITS}).')

    commits_made = 0
    for i, dt in enumerate(dates):
        fmt = dt.strftime('%Y-%m-%d %H:%M:%S')
        msg = message_template.replace('{date}', fmt)

        fp = os.path.join(repo_path, filename)
        with open(fp, 'a', encoding='utf-8') as f:
            f.write(f'{fmt} <- commit #{i + 1}\n')

        repo.git.add(filename)

        env = os.environ.copy()
        env['GIT_AUTHOR_DATE']    = fmt
        env['GIT_COMMITTER_DATE'] = fmt

        repo.git.commit(m=msg, env=env)
        commits_made += 1

        if on_commit:
            on_commit(msg, [filename], fmt)
        if on_progress:
            on_progress(i + 1, total)

    if push and commits_made > 0:
        do_push(repo, branch_name, github_token, repo_url)

    return commits_made


# ── Resolver intervalo de datas ───────────────────────────────────────

def resolve_dates(year=None, start_date=None, end_date=None, num_days=None):
    if year:
        return datetime(year, 1, 1, 9, 0, 0), datetime(year, 12, 31, 18, 0, 0)
    if start_date and end_date:
        sd = datetime.strptime(start_date, '%Y-%m-%d') if isinstance(start_date, str) else start_date
        ed = datetime.strptime(end_date,   '%Y-%m-%d') if isinstance(end_date,   str) else end_date
        return sd, ed
    days = int(num_days or 30)
    ed   = datetime.now()
    sd   = ed - timedelta(days=days - 1)
    return sd, ed


# ── CLI ───────────────────────────────────────────────────────────────

@click.group(invoke_without_command=True, context_settings=dict(help_option_names=['-h', '--help']))
@click.version_option(version=VERSION, prog_name='forge')
@click.pass_context
def cli(ctx):
    """
    CommitForge — Commits retroativos no Git.

    \b
    Exemplos:
      python forge.py commit --repo URL --year 2019 --modo projeto
      python forge.py commit --interativo
      python forge.py grupos --repo URL
      python forge.py preview --year 2020
      python forge.py validar-token --token ghp_xxx
      python forge.py historico
      python forge.py servidor

    \b
    Documentação completa: https://github.com/estevam5s/commitforge
    """
    if ctx.invoked_subcommand is None:
        banner()
        click.echo(ctx.get_help())


@cli.command()
@click.option('--repo',              '-r', default=None,  help='URL do repositório Git')
@click.option('--year',              '-y', type=int,       default=None)
@click.option('--start-date',  'start_date', default=None)
@click.option('--end-date',    'end_date',   default=None)
@click.option('--dias',              '-d', type=int,       default=None)
@click.option('--modo',              '-M', default='projeto', type=click.Choice(['projeto', 'arquivo']))
@click.option('--branch',                  default=None,  help='Nome do branch alvo')
@click.option('--commits-por-dia',   'cpd', type=int,     default=1)
@click.option('--mensagem',          '-m', default='Commit retroativo: {date}')
@click.option('--arquivo',           '-f', 'filename',    default='data.txt')
@click.option('--token',             '-t', default=None,  help='Token GitHub/GitLab')
@click.option('--usuario',                 default=None)
@click.option('--email',                   default=None)
@click.option('--aleatorio',               is_flag=True,  default=False)
@click.option('--pular-fins-de-semana', 'skip_wk', is_flag=True, default=False)
@click.option('--sem-push',          'no_push',    is_flag=True, default=False)
@click.option('--interativo',              is_flag=True,  default=False,
              help='Modo interativo — pergunta as opções uma a uma')
@click.option('--sem-banner',        'no_banner',  is_flag=True, default=False, hidden=True)
def commit(repo, year, start_date, end_date, dias, modo, branch,
           cpd, mensagem, filename, token, usuario, email,
           aleatorio, skip_wk, no_push, interativo, no_banner):
    """
    Criar commits retroativos em um repositório Git.

    \b
    Exemplos:
      python forge.py commit --repo URL --year 2019
      python forge.py commit --repo URL --start-date 2020-01-01 --end-date 2020-12-31
      python forge.py commit --repo URL --dias 90 --aleatorio
      python forge.py commit --interativo
    """
    if not no_banner:
        banner()

    # ── Modo interativo ───────────────────────────────────────────────
    if interativo:
        if not HAS_RICH:
            out('Modo interativo requer rich: pip install rich')
            sys.exit(1)

        repo    = Prompt.ask('[cyan]URL do repositório[/cyan]', default=repo or '')
        modo    = Prompt.ask('[cyan]Modo[/cyan]', choices=['projeto', 'arquivo'], default='projeto')
        token   = Prompt.ask('[cyan]Token GitHub[/cyan]', default=token or os.getenv('GITHUB_TOKEN', ''), password=True) or None

        modo_data = Prompt.ask('[cyan]Modo de data[/cyan]', choices=['year', 'range', 'days'], default='year')
        if modo_data == 'year':
            year = int(Prompt.ask('[cyan]Ano[/cyan]', default='2020'))
        elif modo_data == 'range':
            start_date = Prompt.ask('[cyan]Data de início (YYYY-MM-DD)[/cyan]')
            end_date   = Prompt.ask('[cyan]Data de fim (YYYY-MM-DD)[/cyan]')
        else:
            dias = int(Prompt.ask('[cyan]Número de dias[/cyan]', default='30'))

        aleatorio = Confirm.ask('[cyan]Usar horários aleatórios?[/cyan]', default=True)
        skip_wk   = Confirm.ask('[cyan]Pular fins de semana?[/cyan]', default=False)
        no_push   = not Confirm.ask('[cyan]Enviar ao repositório remoto?[/cyan]', default=True)

    # ── Validações ────────────────────────────────────────────────────
    if not repo:
        error('URL do repositório é obrigatória. Use --repo URL ou --interativo')
        sys.exit(1)

    if not (repo.startswith('https://') or repo.startswith('git@')):
        error('URL inválida. Use o formato https://github.com/user/repo.git')
        sys.exit(1)

    token = token or os.getenv('GITHUB_TOKEN')

    start_dt, end_dt = resolve_dates(year, start_date, end_date, dias)

    branch = branch or f'historico-{start_dt.year}'

    mode_label = 'Projeto (arquivos reais)' if modo == 'projeto' else 'Arquivo (log único)'
    out(f'\n[bold]Configuração:[/bold]')
    out(f'  Repositório : [cyan]{repo}[/cyan]')
    out(f'  Modo        : [green]{mode_label}[/green]')
    out(f'  Período     : [yellow]{start_dt.strftime("%Y-%m-%d")} → {end_dt.strftime("%Y-%m-%d")}[/yellow]')
    out(f'  Branch      : [white]{branch}[/white]')
    out(f'  Token       : [dim]{"configurado" if token else "não configurado"}[/dim]')
    out(f'  Push        : [dim]{"não" if no_push else "sim"}[/dim]\n')

    # ── Clone em diretório temporário ─────────────────────────────────
    tmp_dir = tempfile.mkdtemp(prefix='forge_')

    def cleanup():
        shutil.rmtree(tmp_dir, ignore_errors=True)

    try:
        out(f'[dim]Clonando {repo}...[/dim]')
        repo_obj = clone_repo(repo, tmp_dir, token)
        success('Repositório clonado')

        commits_made = 0

        if HAS_RICH:
            with Progress(
                SpinnerColumn(),
                TextColumn('[bold white]{task.description}'),
                BarColumn(complete_style='green'),
                TaskProgressColumn(),
                TimeElapsedColumn(),
                console=console,
            ) as progress:
                task = progress.add_task('Criando commits...', total=100)
                lock = threading.Lock()

                def on_progress(i, total):
                    pct = int(i / total * 100)
                    progress.update(task, completed=pct,
                                    description=f'Commit {i}/{total}')

                def on_commit(msg, files, date_fmt):
                    nonlocal commits_made
                    with lock:
                        commits_made += 1

                if modo == 'projeto':
                    made, actual_branch = run_projeto(
                        tmp_dir, repo, start_dt, end_dt, branch,
                        token, usuario, email, not no_push, aleatorio,
                        on_progress, on_commit,
                    )
                    commits_made = made
                else:
                    commits_made = run_arquivo(
                        tmp_dir, repo, start_dt, end_dt, branch,
                        mensagem, filename, cpd, skip_wk,
                        token, usuario, email, not no_push, aleatorio,
                        on_progress, on_commit,
                    )

                progress.update(task, completed=100, description='Concluído!')
        else:
            out('Criando commits...')

            def on_commit(msg, files, date_fmt):
                nonlocal commits_made
                commits_made += 1
                out(f'  [{date_fmt}] {msg}')

            if modo == 'projeto':
                commits_made, _ = run_projeto(
                    tmp_dir, repo, start_dt, end_dt, branch,
                    token, usuario, email, not no_push, aleatorio,
                    on_commit=on_commit,
                )
            else:
                commits_made = run_arquivo(
                    tmp_dir, repo, start_dt, end_dt, branch,
                    mensagem, filename, cpd, skip_wk,
                    token, usuario, email, not no_push, aleatorio,
                    on_commit=on_commit,
                )

        # ── Resultado ─────────────────────────────────────────────────
        out('\n')
        if HAS_RICH:
            t = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
            t.add_column(style='dim')
            t.add_column(style='white')
            t.add_row('Status:', '[bold green]✓ Concluído[/bold green]')
            t.add_row('Commits:', f'[bold]{commits_made}[/bold]')
            t.add_row('Branch:', branch)
            t.add_row('Push:', 'não' if no_push else 'sim')
            console.print(Panel(t, title='[bold]Resultado[/bold]', border_style='green'))

            # Dica sobre o gráfico de contribuições
            console.print()
            console.print(Panel(
                '[bold white]Para os commits aparecerem no gráfico de contribuições:[/bold white]\n\n'
                '  [dim]1.[/dim] O branch criado ([bold green]{branch}[/bold green]) precisa existir no repositório remoto\n'
                '  [dim]2.[/dim] O [bold]e-mail do autor[/bold] deve ser um e-mail [bold green]verificado[/bold green] na sua conta GitHub\n'
                '     [dim]→ Acesse: github.com/settings/emails[/dim]\n'
                '  [dim]3.[/dim] Para ver os commits em [bold]anos anteriores[/bold], acesse seu perfil GitHub\n'
                '     e selecione o ano desejado no gráfico de atividade\n\n'
                '[dim]O CommitForge detecta automaticamente seu e-mail via API quando --token é fornecido.[/dim]'.format(
                    branch=branch
                ),
                title='[bold yellow]⚡ Gráfico de Contribuições[/bold yellow]',
                border_style='yellow',
                padding=(0, 2),
            ))
        else:
            success(f'{commits_made} commits criados no branch {branch}')
            out('[dim]Para ver no gráfico: o e-mail do autor deve ser verificado na conta GitHub.[/dim]')

        # Salvar no histórico
        _save_history({
            'ts':      datetime.now().isoformat(),
            'repo':    repo,
            'branch':  branch,
            'modo':    modo,
            'commits': commits_made,
            'start':   start_dt.strftime('%Y-%m-%d'),
            'end':     end_dt.strftime('%Y-%m-%d'),
        })

    except Exception as e:
        error(str(e))
        cleanup()
        sys.exit(1)

    finally:
        cleanup()


# ── Comando: grupos ───────────────────────────────────────────────────

@cli.command()
@click.option('--repo', '-r', required=True, help='URL do repositório')
@click.option('--token', '-t', default=None)
def grupos(repo, token):
    """
    Listar como os arquivos do repositório serão agrupados em commits.

    \b
    Exemplo:
      python forge.py grupos --repo https://github.com/user/repo.git
    """
    token = token or os.getenv('GITHUB_TOKEN')
    tmp   = tempfile.mkdtemp(prefix='forge_grupos_')

    try:
        out(f'[dim]Clonando {repo} para análise...[/dim]')
        clone_repo(repo, tmp, token)
        g_list = group_files(tmp)

        if HAS_RICH:
            t = Table(title=f'Grupos de Commits — {repo}', box=box.ROUNDED, border_style='white')
            t.add_column('Grupo',    style='cyan',  no_wrap=True)
            t.add_column('Arquivos', justify='right', style='bold')
            t.add_column('Mensagem do commit', style='dim')
            for g in g_list:
                t.add_column
                t.add_row(g['group'], str(len(g['files'])), g['message'])
            console.print(t)
        else:
            for g in g_list:
                print(f"  [{g['group']}] {len(g['files'])} arquivo(s) → {g['message']}")

        out(f'\n[dim]Total: {len(g_list)} commit(s) serão criados no modo projeto.[/dim]')

    except Exception as e:
        error(str(e))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ── Comando: preview ──────────────────────────────────────────────────

@cli.command()
@click.option('--year',         '-y', type=int, default=None)
@click.option('--start-date',   'start_date', default=None)
@click.option('--end-date',     'end_date',   default=None)
@click.option('--dias',         '-d', type=int, default=30)
@click.option('--commits-por-dia', 'cpd', type=int, default=1)
@click.option('--pular-fins-de-semana', 'skip_wk', is_flag=True, default=False)
def preview(year, start_date, end_date, dias, cpd, skip_wk):
    """
    Prévia de quantos commits seriam criados, sem executar nada.

    \b
    Exemplos:
      python forge.py preview --year 2020
      python forge.py preview --dias 90 --commits-por-dia 2
      python forge.py preview --start-date 2019-01-01 --end-date 2019-12-31
    """
    start_dt, end_dt = resolve_dates(year, start_date, end_date, dias)
    dates = build_date_list(start_dt, end_dt, cpd, skip_wk)
    total = len(dates)

    out(f'\n[bold]Prévia CommitForge[/bold]')
    out(f'  Período        : [yellow]{start_dt.strftime("%Y-%m-%d")} → {end_dt.strftime("%Y-%m-%d")}[/yellow]')
    out(f'  Commits/dia    : {cpd}')
    out(f'  Fins de semana : {"Pulados" if skip_wk else "Incluídos"}')
    out(f'  [bold]Total de commits: {total}[/bold]')

    if total > MAX_COMMITS:
        warn(f'Total ({total}) excede o limite máximo ({MAX_COMMITS})!')

    if dates:
        out(f'\n  Primeiros:')
        for d in dates[:4]:
            out(f'    [dim]{d.strftime("%Y-%m-%d %H:%M:%S")}[/dim]')
        if len(dates) > 4:
            out(f'    [dim]...[/dim]')
            out(f'    [dim]{dates[-1].strftime("%Y-%m-%d %H:%M:%S")}[/dim]')


# ── Comando: validar-token ────────────────────────────────────────────

@cli.command('validar-token')
@click.option('--token', '-t', required=True)
def validar_token(token):
    """Validar um token de acesso pessoal do GitHub."""
    out('[dim]→ Validando token...[/dim]')
    user = validate_github_token(token)
    if user:
        success(f'Token válido!')
        out(f'  Usuário : [bold]{user.get("login")}[/bold]')
        if user.get('name'):
            out(f'  Nome    : {user.get("name")}')
    else:
        error('Token inválido ou expirado.')
        out('[dim]  Gere um novo em: github.com/settings/tokens[/dim]')


# ── Comando: historico ────────────────────────────────────────────────

@cli.command()
def historico():
    """Listar todos os processos executados anteriormente."""
    entries = _load_history()
    if not entries:
        out('[dim]Nenhum processo encontrado.[/dim]')
        return

    if HAS_RICH:
        t = Table(title='Histórico CommitForge', box=box.ROUNDED, border_style='white')
        t.add_column('Data',    style='dim', no_wrap=True)
        t.add_column('Repo',    max_width=40)
        t.add_column('Branch',  style='cyan')
        t.add_column('Modo',    style='white')
        t.add_column('Commits', justify='right', style='bold')
        t.add_column('Período', style='dim')
        for e in entries:
            t.add_row(
                str(e.get('ts', ''))[:16],
                ('...' + e['repo'][-35:]) if len(e.get('repo', '')) > 38 else e.get('repo', '-'),
                e.get('branch', '-'),
                e.get('modo', '-'),
                str(e.get('commits', '-')),
                f"{e.get('start','')} → {e.get('end','')}",
            )
        console.print(t)
    else:
        for e in entries:
            print(f"  {e.get('ts','')} | {e.get('repo','-')} | {e.get('commits','-')} commits | {e.get('modo','-')}")


# ── Comando: info ─────────────────────────────────────────────────────

@cli.command()
def info():
    """Mostrar informações do sistema e configuração."""
    import platform

    banner()

    if HAS_RICH:
        t = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
        t.add_column(style='dim')
        t.add_column(style='white')

        t.add_row('Versão CommitForge:', f'[bold green]v{VERSION}[/bold green]')
        t.add_row('Python:', platform.python_version())
        t.add_row('Sistema:', platform.system() + ' ' + platform.release())
        t.add_row('Rich:', '[green]instalado[/green]' if HAS_RICH else '[red]não instalado[/red]')
        t.add_row('GitPython:', '[green]instalado[/green]')
        t.add_row('Requests:', '[green]instalado[/green]' if HAS_REQUESTS else '[yellow]não instalado[/yellow]')

        token = os.getenv('GITHUB_TOKEN', '')
        t.add_row('GITHUB_TOKEN:', f'[green]configurado ({len(token)} chars)[/green]' if token else '[dim]não configurado[/dim]')

        history = _load_history()
        t.add_row('Jobs no histórico:', str(len(history)))
        t.add_row('Máximo de commits:', str(MAX_COMMITS))
        t.add_row('Arquivo de histórico:', HISTORY_FILE)

        console.print(Panel(t, title='[bold]CommitForge — Informações do Sistema[/bold]', border_style='white'))

        # Mostrar grupos disponíveis
        out('\n[bold]Grupos semânticos disponíveis:[/bold]')
        g_table = Table(box=box.SIMPLE, border_style='dim')
        g_table.add_column('Grupo', style='cyan', no_wrap=True)
        g_table.add_column('Padrões', style='dim', max_width=50)
        g_table.add_column('Mensagem', style='white')
        for key, patterns, message in FILE_GROUPS:
            g_table.add_row(key, ', '.join(patterns[:3]) + ('...' if len(patterns) > 3 else ''), message)
        console.print(g_table)
    else:
        print(f'CommitForge v{VERSION}')
        print(f'Python {platform.python_version()}')
        print(f'Sistema: {platform.system()}')
        print(f'Grupos: {len(FILE_GROUPS)}')


# ── Comando: ajuda ────────────────────────────────────────────────────

@cli.command()
def ajuda():
    """Mostrar ajuda completa e colorida de todos os comandos."""
    if not HAS_RICH:
        print("Instale rich para ver o help colorido: pip install rich")
        return

    banner()

    # ── Descrição ────────────────────────────────────────────────────
    console.print()
    console.print(Panel(
        '[white]CommitForge cria [bold green]commits retroativos[/bold green] no Git com datas do passado.\n'
        'Suporta [bold cyan]GitHub[/bold cyan], [bold yellow]GitLab[/bold yellow], [bold magenta]Bitbucket[/bold magenta] e qualquer serviço Git via HTTPS ou SSH.\n\n'
        '[dim]Dois modos disponíveis:[/dim]\n'
        '  [bold green]projeto[/bold green]  — commita arquivos reais em 17 grupos semânticos (recomendado)\n'
        '  [bold yellow]arquivo[/bold yellow]  — cria entradas em um arquivo de log com N commits/dia',
        title='[bold white]● O que é o CommitForge?[/bold white]',
        border_style='green',
        padding=(0, 2),
    ))

    # ── Comandos disponíveis ──────────────────────────────────────────
    console.print()
    cmds = Table(
        title='[bold white]Comandos Disponíveis[/bold white]',
        box=box.ROUNDED, border_style='cyan', show_header=True,
        header_style='bold cyan',
    )
    cmds.add_column('Comando',     style='bold green',  no_wrap=True)
    cmds.add_column('Descrição',   style='white')
    cmds.add_column('Exemplo rápido', style='dim', max_width=55)

    cmds.add_row('commit',        'Criar commits retroativos em um repositório',
                 'python forge.py commit --repo URL --year 2019')
    cmds.add_row('grupos',        'Listar como os arquivos serão agrupados',
                 'python forge.py grupos --repo URL')
    cmds.add_row('preview',       'Prévia de commits sem executar nada',
                 'python forge.py preview --year 2020')
    cmds.add_row('validar-token', 'Verificar se o token do GitHub é válido',
                 'python forge.py validar-token --token ghp_xxx')
    cmds.add_row('historico',     'Ver todos os jobs executados anteriormente',
                 'python forge.py historico')
    cmds.add_row('info',          'Informações do sistema e grupos semânticos',
                 'python forge.py info')
    cmds.add_row('ajuda',         'Esta tela de ajuda completa',
                 'python forge.py ajuda')
    cmds.add_row('servidor',      'Iniciar interface web na porta especificada',
                 'python forge.py servidor --porta 5000')
    cmds.add_row('lote',          'Processar múltiplos repositórios via arquivo JSON',
                 'python forge.py lote --arquivo repos.json')
    cmds.add_row('desinstalar',   'Remover o CommitForge completamente do sistema',
                 'python forge.py desinstalar -y')
    console.print(cmds)

    # ── Flags do commit ───────────────────────────────────────────────
    console.print()
    flags = Table(
        title='[bold white]Flags do Comando [bold green]commit[/bold green][/bold white]',
        box=box.ROUNDED, border_style='yellow', show_header=True,
        header_style='bold yellow',
    )
    flags.add_column('Flag',              style='bold yellow', no_wrap=True)
    flags.add_column('Tipo',              style='cyan',        no_wrap=True)
    flags.add_column('Padrão',            style='dim',         no_wrap=True)
    flags.add_column('Descrição',         style='white')

    rows = [
        ('--repo, -r',             'string',   '—',                 'URL HTTPS ou SSH do repositório'),
        ('--year, -y',             'int',      '—',                 'Ano completo (ex: 2019)'),
        ('--start-date',           'date',     '—',                 'Data início YYYY-MM-DD'),
        ('--end-date',             'date',     '—',                 'Data fim YYYY-MM-DD'),
        ('--dias, -d',             'int',      '30',                'Últimos N dias a partir de hoje'),
        ('--modo, -M',             'choice',   'projeto',           '[green]projeto[/green] (arquivos reais) ou [yellow]arquivo[/yellow] (log)'),
        ('--branch',               'string',   'historico-{year}',  'Nome do branch a criar (órfão)'),
        ('--token, -t',            'string',   '$GITHUB_TOKEN',     'Token de acesso pessoal GitHub/GitLab'),
        ('--usuario',              'string',   '—',                 'Nome do autor dos commits'),
        ('--email',                'string',   '—',                 'E-mail do autor dos commits'),
        ('--commits-por-dia',      'int',      '1',                 'Commits por dia (somente modo arquivo)'),
        ('--mensagem, -m',         'string',   'Commit: {date}',    'Template da mensagem (suporta {date})'),
        ('--arquivo, -f',          'string',   'data.txt',          'Arquivo de log (modo arquivo)'),
        ('--aleatorio',            'flag',     'false',             'Horários aleatórios realistas ao longo do dia'),
        ('--pular-fins-de-semana', 'flag',     'false',             'Pular sábado e domingo'),
        ('--sem-push',             'flag',     'false',             'Criar commits localmente sem push'),
        ('--interativo',           'flag',     'false',             'Modo interativo — faz perguntas passo a passo'),
    ]
    for flag, tipo, padrao, desc in rows:
        flags.add_row(flag, tipo, padrao, desc)
    console.print(flags)

    # ── Exemplos ──────────────────────────────────────────────────────
    console.print()
    exemplos = Table(
        title='[bold white]Exemplos Práticos[/bold white]',
        box=box.ROUNDED, border_style='magenta', show_header=True,
        header_style='bold magenta',
    )
    exemplos.add_column('Caso de uso',  style='bold white', max_width=28)
    exemplos.add_column('Comando',      style='green')

    exemplos.add_row(
        'Projeto de 2019 (modo projeto)',
        'python forge.py commit --repo URL --year 2019 --modo projeto --token ghp_xxx',
    )
    exemplos.add_row(
        'Gráfico de contribuições 2022',
        'python forge.py commit --repo URL --year 2022 --modo arquivo --commits-por-dia 2 --pular-fins-de-semana',
    )
    exemplos.add_row(
        'Intervalo de datas específico',
        'python forge.py commit --repo URL --start-date 2020-06-01 --end-date 2020-12-31',
    )
    exemplos.add_row(
        'Modo interativo (mais fácil)',
        'python forge.py commit --interativo',
    )
    exemplos.add_row(
        'Prévia antes de executar',
        'python forge.py preview --year 2021 --commits-por-dia 3',
    )
    exemplos.add_row(
        'Ver grupos do repositório',
        'python forge.py grupos --repo URL',
    )
    console.print(exemplos)

    # ── Configuração rápida ───────────────────────────────────────────
    console.print()
    console.print(Panel(
        '[dim]1.[/dim] [white]Gere um token em[/white] [cyan]github.com/settings/tokens/new[/cyan] [dim](escopos: repo, workflow)[/dim]\n'
        '[dim]2.[/dim] [white]Exporte o token:[/white] [green]export GITHUB_TOKEN=ghp_seu_token[/green]\n'
        '[dim]3.[/dim] [white]Ou use a flag:[/white]   [green]python forge.py commit --token ghp_seu_token ...[/green]\n'
        '[dim]4.[/dim] [white]Valide o token:[/white]  [green]python forge.py validar-token --token ghp_xxx[/green]',
        title='[bold white]⚙  Configuração Rápida[/bold white]',
        border_style='dim',
        padding=(0, 2),
    ))

    console.print(
        '\n[dim]Documentação completa:[/dim] [cyan]https://github.com/estevam5s/commitforge[/cyan]\n'
        '[dim]Criado por[/dim] [bold white]Estevam Souza[/bold white] [dim]— github.com/estevam5s[/dim]\n'
    )


# ── Comando: cancelar ─────────────────────────────────────────────────

@cli.command()
@click.option('--job', '-j', required=True, help='ID do job (use historico para listar)')
def cancelar(job):
    """Cancelar um processo em andamento (modo servidor)."""
    warn('O cancelamento direto só está disponível no modo servidor Flask.')
    out(f'[dim]Para o modo servidor, use: python cli.py cancelar --job {job}[/dim]')


# ── Comando: servidor ─────────────────────────────────────────────────

@cli.command()
@click.option('--porta',   '-p', type=int,    default=5000,    help='Porta HTTP (padrão: 5000)')
@click.option('--host',    '-H', default='0.0.0.0',            help='Host de escuta (padrão: 0.0.0.0)')
@click.option('--debug',   '-D', is_flag=True, default=False,  help='Ativar modo debug do Flask')
@click.option('--abrir',   '-o', is_flag=True, default=False,  help='Abrir o navegador automaticamente')
@click.option('--sem-avt',       is_flag=True, default=False,  help='Ocultar mensagem da AVT ao iniciar')
def servidor(porta, host, debug, abrir, sem_avt):
    """Iniciar o servidor Flask com interface web e linha do tempo AVT.

    \b
    Exemplos:
      commitforge servidor
      commitforge servidor --porta 8080
      commitforge servidor --porta 3000 --abrir
      commitforge servidor --porta 5001 --debug --host 127.0.0.1
      commitforge servidor --sem-avt
    """
    import subprocess
    import socket

    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.py')
    if not os.path.exists(app_path):
        error(f'app.py não encontrado em {os.path.dirname(app_path)}')
        out('[dim]Certifique-se de que o CommitForge foi instalado corretamente.[/dim]')
        sys.exit(1)

    # ── Verificar se a porta já está em uso ──────────────────────────
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as _s:
        if _s.connect_ex(('localhost', porta)) == 0:
            warn(f'Porta {porta} já está em uso.')
            for candidata in range(porta + 1, porta + 20):
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as _s2:
                    if _s2.connect_ex(('localhost', candidata)) != 0:
                        porta = candidata
                        warn(f'Usando porta alternativa: {porta}')
                        break
            else:
                error('Nenhuma porta livre encontrada no intervalo. Use --porta para especificar outra.')
                sys.exit(1)

    # ── Banner AVT ───────────────────────────────────────────────────
    if not sem_avt and HAS_RICH:
        console.print()
        console.print('[bold yellow]╔══════════════════════════════════════════════════════╗[/bold yellow]')
        console.print('[bold yellow]║[/bold yellow]      [bold white]AVT — AUTORIDADE DE VARIÂNCIA TEMPORAL[/bold white]       [bold yellow]║[/bold yellow]')
        console.print('[bold yellow]╠══════════════════════════════════════════════════════╣[/bold yellow]')
        console.print('[bold yellow]║[/bold yellow]  [dim]A AVT está de olho. Cada commit retroativo que você[/dim]  [bold yellow]║[/bold yellow]')
        console.print('[bold yellow]║[/bold yellow]  [dim]cria [/dim][bold green]altera a Linha do Tempo Sagrada[/bold green][dim].[/dim]              [bold yellow]║[/bold yellow]')
        console.print('[bold yellow]║[/bold yellow]  [bold red]Eventos Nexus (commits no futuro) serão monitorados.[/bold red] [bold yellow]║[/bold yellow]')
        console.print('[bold yellow]║[/bold yellow]                                                        [bold yellow]║[/bold yellow]')
        console.print('[bold yellow]║[/bold yellow]  [italic dim]— Mobius M. Mobius, Analista TVA Nível 4[/italic dim]            [bold yellow]║[/bold yellow]')
        console.print('[bold yellow]╚══════════════════════════════════════════════════════╝[/bold yellow]')
        console.print()

    # ── Tabela de URLs ───────────────────────────────────────────────
    local_url    = f'http://localhost:{porta}'
    timeline_url = f'http://localhost:{porta}/timeline'
    health_url   = f'http://localhost:{porta}/api/health'

    if HAS_RICH:
        from rich.table import Table as _T
        from rich import box as _box
        tbl = _T(box=_box.ROUNDED, border_style='green', show_header=False, padding=(0, 2))
        tbl.add_column('chave', style='dim', min_width=22)
        tbl.add_column('valor')
        tbl.add_row('Interface principal',  f'[bold cyan]{local_url}[/bold cyan]')
        tbl.add_row('◈ Linha do tempo AVT', f'[bold yellow]{timeline_url}[/bold yellow]')
        tbl.add_row('API health check',     f'[dim]{health_url}[/dim]')
        tbl.add_row('Porta',               f'[green]{porta}[/green]')
        tbl.add_row('Host',                host)
        tbl.add_row('Debug',               '[yellow]sim[/yellow]' if debug else '[dim]não[/dim]')
        console.print(tbl)
        console.print()
        console.print('[dim]Pressione [bold]Ctrl+C[/bold] para encerrar o servidor.[/dim]')
        console.print()
    else:
        print(f'\n  CommitForge — Servidor Flask')
        print(f'  Interface : {local_url}')
        print(f'  AVT       : {timeline_url}')
        print(f'  Porta     : {porta}')
        print(f'  Ctrl+C para encerrar\n')

    # ── Abrir navegador ──────────────────────────────────────────────
    if abrir:
        import threading as _th
        def _open_browser():
            import time as _t
            _t.sleep(2)
            import webbrowser
            webbrowser.open(local_url)
        _th.Thread(target=_open_browser, daemon=True).start()

    # ── Iniciar Flask ────────────────────────────────────────────────
    env = os.environ.copy()
    env['PORT']  = str(porta)
    env['HOST']  = host
    env['DEBUG'] = 'true' if debug else 'false'
    try:
        subprocess.run(
            [sys.executable, app_path],
            check=True, env=env,
            cwd=os.path.dirname(app_path),
        )
    except KeyboardInterrupt:
        if HAS_RICH:
            console.print()
            console.print('[dim]Servidor encerrado. Até a próxima, variante.[/dim]')
        else:
            print('\nServidor encerrado.')
    except subprocess.CalledProcessError as exc:
        error(f'Servidor encerrado com erro (código {exc.returncode})')
        sys.exit(exc.returncode)


# ── Comando: desinstalar ────────────────────────────────────────────

@cli.command()
@click.option('--confirmar', '-y', is_flag=True, help='Confirmar desinstalação sem perguntar')
def desinstalar(confirmar):
    """Remover o CommitForge completamente do sistema."""
    if not HAS_RICH:
        print("Instale rich para ver a saída colorida: pip install rich")

    banner()

    console.print()
    console.print(Panel(
        '[bold red]⚠  ATENÇÃO[/bold red]\n\n'
        'Este comando irá remover:\n'
        '  [dim]• ~/.commitforge/[/dim]          (binários e venv)\n'
        '  [dim]• ~/.local/bin/commitforge[/dim]  (wrapper curl)\n'
        '  [dim]• ~/.local/bin/forge[/dim]        (alias)\n'
        '  [dim]• Entradas do PATH no .bashrc / .zshrc[/dim]\n\n'
        '[yellow]Seus repositórios git NÃO serão alterados.[/yellow]',
        title='[bold red]Desinstalar CommitForge[/bold red]',
        border_style='red',
        padding=(0, 2),
    ))
    console.print()

    if not confirmar:
        resposta = click.prompt(
            '[bold yellow]Tem certeza que deseja desinstalar? [s/N][/bold yellow]',
            default='N',
        )
        if resposta.strip().lower() not in ('s', 'sim', 'y', 'yes'):
            warn('Desinstalação cancelada.')
            return

    import shutil, re

    removidos = []
    erros = []

    # 1. Diretório principal
    commitforge_dir = os.path.expanduser('~/.commitforge')
    if os.path.isdir(commitforge_dir):
        try:
            shutil.rmtree(commitforge_dir)
            removidos.append('~/.commitforge/')
        except Exception as e:
            erros.append(f'~/.commitforge/: {e}')

    # 2. Binários wrapper
    for bin_name in ('commitforge', 'forge'):
        bin_path = os.path.expanduser(f'~/.local/bin/{bin_name}')
        if os.path.isfile(bin_path):
            try:
                os.remove(bin_path)
                removidos.append(f'~/.local/bin/{bin_name}')
            except Exception as e:
                erros.append(f'~/.local/bin/{bin_name}: {e}')

    # 3. Limpar PATH do .bashrc e .zshrc
    path_pattern = re.compile(
        r'\n?# CommitForge PATH.*?\n.*?commitforge.*?\n?', re.DOTALL
    )
    for rc_file in ('~/.bashrc', '~/.zshrc', '~/.profile'):
        rc_path = os.path.expanduser(rc_file)
        if os.path.isfile(rc_path):
            try:
                with open(rc_path, 'r') as f:
                    content = f.read()
                new_content = path_pattern.sub('', content)
                # também remove linha simples de export PATH com commitforge
                new_content = re.sub(
                    r'.*commitforge.*\n?', '', new_content
                )
                if new_content != content:
                    with open(rc_path, 'w') as f:
                        f.write(new_content)
                    removidos.append(f'{rc_file} (PATH limpo)')
            except Exception as e:
                erros.append(f'{rc_file}: {e}')

    # 4. Relatório
    console.print()
    if removidos:
        t = Table(box=box.SIMPLE, border_style='green', show_header=False)
        t.add_column('', style='bold green')
        t.add_column('')
        for item in removidos:
            t.add_row('[green]✓[/green]', item)
        console.print(t)

    if erros:
        console.print()
        t = Table(box=box.SIMPLE, border_style='red', show_header=False)
        t.add_column('', style='bold red')
        t.add_column('')
        for item in erros:
            t.add_row('[red]✗[/red]', item)
        console.print(t)

    console.print()
    if erros:
        warn(f'{len(erros)} item(ns) não puderam ser removidos. Veja acima.')
    else:
        success('CommitForge desinstalado com sucesso.')
        out('[dim]Para remover via pip: [bold]pip uninstall commitforge[/bold][/dim]')
        out('[dim]Para remover imagem Docker: [bold]docker rmi ghcr.io/estevam5s/commitforge:latest[/bold][/dim]')


if __name__ == '__main__':
    cli()
