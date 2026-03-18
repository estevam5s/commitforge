from flask import Flask, render_template, request, jsonify, Response
import os
import time
import uuid
import json
import platform
import subprocess
import logging
import re
import random
import requests
from datetime import datetime, timedelta
from pathlib import Path
import git
import threading
import shutil
from urllib.parse import urlparse
import dotenv

dotenv.load_dotenv()

VERSION = '3.0.0'

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'commitforge_secret_key')
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'repos')
app.config['MAX_COMMITS'] = int(os.getenv('MAX_COMMITS', '5000'))
app.config['DEFAULT_GITHUB_TOKEN'] = os.getenv('GITHUB_TOKEN', '')
app.config['GITHUB_API_URL'] = 'https://api.github.com'
app.config['JOBS_PERSIST_FILE'] = os.getenv('JOBS_PERSIST_FILE', 'jobs_history.json')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('commitforge.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('commitforge')
logger.info(f"CommitForge v{VERSION} iniciando...")

# ─── CORS helper ─────────────────────────────────────────────────────────────

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = os.getenv('CORS_ORIGIN', '*')
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        return Response(status=204)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

active_jobs = {}
job_logs: dict[str, list[str]] = {}  # job_id → list of log lines
_stats_start_time = time.time()
_stats_total_commits = 0


def _add_job_log(job_id: str, msg: str):
    """Appends a log line to a job's log buffer (max 200 lines)."""
    if job_id not in job_logs:
        job_logs[job_id] = []
    job_logs[job_id].append(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")
    if len(job_logs[job_id]) > 200:
        job_logs[job_id] = job_logs[job_id][-200:]


def _persist_completed_job(job: dict):
    """Saves finished jobs to a JSON history file."""
    path = app.config['JOBS_PERSIST_FILE']
    try:
        history = []
        if os.path.exists(path):
            with open(path) as f:
                history = json.load(f)
        entry = {k: v for k, v in job.items() if k not in ('repo_dir',)}
        # ensure serialisable
        history.insert(0, entry)
        history = history[:100]
        with open(path, 'w') as f:
            json.dump(history, f, indent=2, default=str)
    except Exception as e:
        logger.warning(f"Erro ao persistir job: {e}")

# ─── Utilitários Git ────────────────────────────────────────────────────────

def validate_repo_url(repo_url):
    """Valida a URL do repositório e extrai metadados."""
    if not repo_url or not isinstance(repo_url, str):
        return False, None
    if not (repo_url.startswith('https://') or repo_url.startswith('git@')):
        return False, None

    repo_info = {}
    if 'github.com' in repo_url:
        repo_info['platform'] = 'github'
        if repo_url.startswith('https://'):
            m = re.match(r'https://github\.com/([^/]+)/([^/.]+)(\.git)?', repo_url)
        else:
            m = re.match(r'git@github\.com:([^/]+)/([^/.]+)(\.git)?', repo_url)
        if m:
            repo_info['owner'] = m.group(1)
            repo_info['repo'] = m.group(2)
            return True, repo_info
    elif 'gitlab.com' in repo_url:
        repo_info['platform'] = 'gitlab'
        return True, repo_info
    elif 'bitbucket.org' in repo_url:
        repo_info['platform'] = 'bitbucket'
        return True, repo_info
    elif repo_url.startswith('https://') or repo_url.startswith('git@'):
        repo_info['platform'] = 'other'
        return True, repo_info
    return False, None


def get_auth_url_with_token(repo_url, token):
    """Injeta o token na URL HTTPS."""
    if repo_url.startswith('https://'):
        parsed = urlparse(repo_url)
        if '@' not in parsed.netloc:
            return repo_url.replace(parsed.netloc, f'{token}@{parsed.netloc}')
    return repo_url


def github_api_request(endpoint, method='GET', token=None, data=None):
    """Realiza chamadas à API REST do GitHub."""
    token = token or app.config['DEFAULT_GITHUB_TOKEN']
    if not token:
        return None

    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
    }
    url = f"{app.config['GITHUB_API_URL']}{endpoint}"
    try:
        fn = {'GET': requests.get, 'POST': requests.post,
              'PUT': requests.put, 'PATCH': requests.patch,
              'DELETE': requests.delete}[method]
        kw = {'headers': headers, 'timeout': 15}
        if data and method != 'GET':
            kw['json'] = data
        r = fn(url, **kw)
        if r.status_code == 204:
            return {}
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logger.error(f"Erro API GitHub: {e}")
        return None


def push_to_remote(repo, repo_info, github_token, branch):
    """Tenta push com fallback API GitHub."""
    try:
        repo.git.push('--force')
        logger.info("Push realizado com sucesso")
        return
    except git.GitCommandError as e:
        logger.warning(f"Push normal falhou: {e}")

    if repo_info and repo_info.get('platform') == 'github' and github_token:
        sha = repo.head.commit.hexsha
        ep = f"/repos/{repo_info['owner']}/{repo_info['repo']}/git/refs/heads/{branch}"
        res = github_api_request(ep, method='PATCH', token=github_token, data={'sha': sha, 'force': True})
        if res is not None:
            logger.info("Push via API GitHub realizado")
            return

        # Última tentativa: URL com token embutido
        remote_url = repo.remotes.origin.url
        auth_url = get_auth_url_with_token(remote_url, github_token)
        repo.git.remote('set-url', 'origin', auth_url)
        repo.git.push('--force')
        logger.info("Push com token na URL realizado")


# ─── Agrupamento Inteligente de Arquivos ────────────────────────────────────

# Mapeamento: padrão de caminho → (prioridade, mensagem de commit, prefixo semântico)
FILE_GROUPS = [
    ("configuração",        ["package.json", "tsconfig.json", "next.config*", "postcss.config*",
                              "components.json", "tailwind.config*", ".gitignore",
                              ".eslintrc*", ".prettierrc*", "*.lock", "Dockerfile",
                              "docker-compose*", "*.env*", "requirements.txt"],
     "chore: configuração e dependências do projeto"),
    ("assets",              ["public/*", "static/*", "assets/*"],
     "feat: recursos e assets estáticos"),
    ("estilos",             ["*.css", "*.scss", "*.sass", "app/globals*", "styles/*"],
     "feat: estilos globais e design system"),
    ("layout",              ["app/layout*", "app/loading*", "app/error*", "app/not-found*"],
     "feat: layout base e estrutura da aplicação"),
    ("utilitarios",         ["lib/*", "utils/*", "helpers/*", "hooks/*"],
     "feat: utilitários, hooks e funções auxiliares"),
    ("componentes-base",    ["components/ui/button*", "components/ui/input*",
                              "components/ui/label*", "components/ui/badge*",
                              "components/ui/separator*", "components/ui/textarea*",
                              "components/ui/select*", "components/ui/checkbox*",
                              "components/theme*"],
     "feat: componentes UI base e formulários"),
    ("componentes-nav",     ["components/ui/navigation*", "components/ui/menu*",
                              "components/ui/tabs*", "components/ui/breadcrumb*",
                              "components/ui/pagination*", "components/ui/sidebar*"],
     "feat: componentes de navegação"),
    ("componentes-overlay", ["components/ui/dialog*", "components/ui/drawer*",
                              "components/ui/sheet*", "components/ui/popover*",
                              "components/ui/hover*", "components/ui/alert-dialog*",
                              "components/ui/tooltip*", "components/ui/dropdown*",
                              "components/ui/command*", "components/ui/context*"],
     "feat: componentes de overlay e modais"),
    ("componentes-dados",   ["components/ui/table*", "components/ui/card*",
                              "components/ui/chart*", "components/ui/calendar*",
                              "components/ui/carousel*", "components/ui/accordion*",
                              "components/ui/collapsible*", "components/ui/avatar*",
                              "components/ui/aspect*"],
     "feat: componentes de dados e visualização"),
    ("componentes-util",    ["components/ui/*"],
     "feat: componentes utilitários"),
    ("pagina-principal",    ["app/page*"],
     "feat: página principal e landing page"),
    ("paginas",             ["app/**/page*", "pages/*"],
     "feat: páginas da aplicação"),
    ("backend-flask",       ["cli-commit/app.py", "cli-commit/*.py",
                              "app.py", "*.py"],
     "feat: backend Flask e API REST"),
    ("cli",                 ["cli-commit/cli.py", "cli.py", "cli-commit/cli*"],
     "feat: interface de linha de comando (CLI)"),
    ("templates",           ["cli-commit/templates/*", "templates/*", "*.html"],
     "feat: templates e interface web"),
    ("readme",              ["README*", "*.md", "docs/*"],
     "docs: documentação do projeto"),
]


def _match_pattern(filepath, pattern):
    """Verifica se filepath casa com o padrão glob."""
    from pathlib import PurePosixPath
    import fnmatch
    fp = filepath.replace('\\', '/')
    pat = pattern.replace('\\', '/')

    # Casamento direto de caminho completo
    if fnmatch.fnmatch(fp, pat):
        return True

    # Glob recursivo: remove ** e tenta novamente
    if '**' in pat:
        cleaned = pat.replace('**/', '').replace('**', '*')
        if fnmatch.fnmatch(fp, cleaned):
            return True

    # Casamento por nome de arquivo — apenas quando o padrão não tem separador de diretório
    # (evita que "public/*" case com tudo porque pat_name vira "*")
    if '/' not in pat:
        name = PurePosixPath(fp).name
        if fnmatch.fnmatch(name, pat):
            return True

    return False


def group_project_files(repo_path):
    """
    Agrupa os arquivos do repositório em commits lógicos.

    Retorna lista de dicts:
      [{'files': [...], 'message': '...'}, ...]
    """
    repo = git.Repo(repo_path)

    # Obter todos os arquivos rastreados (excluindo submodules)
    try:
        all_files = repo.git.ls_files().splitlines()
    except Exception:
        all_files = []

    # Filtrar arquivos que existem de fato
    all_files = [f for f in all_files if (Path(repo_path) / f).exists()]

    assigned = set()
    groups = []

    for group_key, patterns, message in FILE_GROUPS:
        matched = []
        for f in all_files:
            if f in assigned:
                continue
            for pattern in patterns:
                if _match_pattern(f, pattern):
                    matched.append(f)
                    assigned.add(f)
                    break
        if matched:
            groups.append({'files': matched, 'message': message, 'group': group_key})

    # Arquivos que sobraram sem grupo
    remaining = [f for f in all_files if f not in assigned]
    if remaining:
        groups.append({'files': remaining, 'message': 'chore: demais arquivos do projeto', 'group': 'outros'})

    logger.info(f"Arquivos agrupados em {len(groups)} commits:")
    for g in groups:
        logger.info(f"  [{g['group']}] {len(g['files'])} arquivo(s) → {g['message']}")

    return groups


def distribute_dates(groups, start_date, end_date, random_times=False):
    """
    Distribui datas uniformemente entre start_date e end_date para cada grupo.
    Retorna os grupos com uma chave 'date' adicionada.
    """
    total = len(groups)
    if total == 0:
        return groups

    total_days = (end_date - start_date).days
    step = max(1, total_days // total)

    for i, group in enumerate(groups):
        offset_days = min(i * step, total_days)
        commit_dt = start_date + timedelta(days=offset_days)

        if random_times:
            commit_dt = commit_dt.replace(
                hour=random.randint(8, 22),
                minute=random.randint(0, 59),
                second=random.randint(0, 59),
            )
        else:
            # Hora de trabalho realista baseada no índice do grupo
            hour = 9 + (i % 8)
            commit_dt = commit_dt.replace(hour=hour, minute=random.randint(0, 59), second=0)

        group['date'] = commit_dt

    return groups


# ─── Modo: Arquivo único (original) ─────────────────────────────────────────

def build_date_list(start_date, end_date, commits_per_day=1,
                    skip_weekends=False, random_times=False):
    """Gera lista de datetimes para o modo arquivo."""
    dates = []
    current = start_date
    while current <= end_date:
        if skip_weekends and current.weekday() >= 5:
            current += timedelta(days=1)
            continue
        for _ in range(commits_per_day):
            if random_times:
                dt = current.replace(
                    hour=random.randint(7, 23),
                    minute=random.randint(0, 59),
                    second=random.randint(0, 59),
                )
            else:
                dt = current.replace(hour=12, minute=0, second=0)
            dates.append(dt)
        current += timedelta(days=1)
    return dates


def make_commits_arquivo(repo_path, message_template, filename, job_id,
                         custom_username=None, custom_email=None, push=True,
                         use_api=False, github_token=None, repo_info=None,
                         random_times=False, commits_per_day=1,
                         start_date=None, end_date=None,
                         skip_weekends=False, num_days=None, year=None):
    """Modo arquivo: cria commits modificando um arquivo de log."""

    # Determinar intervalo
    if year:
        start_date = datetime(year, 1, 1, 12, 0, 0)
        end_date = datetime(year, 12, 31, 23, 59, 59)
    elif start_date and end_date:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
    elif num_days:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=num_days - 1)
    else:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=29)

    commits_per_day = max(1, min(10, int(commits_per_day)))
    commit_dates = build_date_list(start_date, end_date, commits_per_day, skip_weekends, random_times)

    total = len(commit_dates)
    if total == 0:
        active_jobs[job_id].update({'status': 'completed', 'progress': 100})
        return
    if total > app.config['MAX_COMMITS']:
        raise ValueError(f"Total de commits ({total}) excede o limite ({app.config['MAX_COMMITS']})")

    repo = git.Repo(repo_path)
    _configure_git_user(repo, custom_username, custom_email)

    active_jobs[job_id].update({'status': 'running', 'progress': 0,
                                 'start_time': time.time(), 'total_commits': total})
    current_branch = repo.active_branch.name
    active_jobs[job_id]['branch'] = current_branch

    commits_made = 0
    for commit_dt in commit_dates:
        if active_jobs[job_id]['status'] == 'cancelled':
            break

        formatted = commit_dt.strftime('%Y-%m-%d %H:%M:%S')
        msg = message_template.replace('{date}', formatted)

        file_path = os.path.join(repo_path, filename)
        with open(file_path, 'a') as f:
            f.write(f'{formatted} <- commit #{commits_made + 1}\n')

        repo.git.add(filename)
        env = os.environ.copy()
        env['GIT_AUTHOR_DATE'] = formatted
        env['GIT_COMMITTER_DATE'] = formatted
        repo.git.commit(m=msg, env=env)

        commits_made += 1
        active_jobs[job_id].update({
            'progress': int(commits_made / total * 100),
            'commits_made': commits_made,
        })
        time.sleep(0.02)

    _finish_job(repo, repo_path, repo_info, github_token, push, use_api,
                current_branch, job_id, commits_made)


# ─── Modo: Projeto (arquivos reais) ─────────────────────────────────────────

def make_commits_projeto(repo_path, job_id, start_date=None, end_date=None,
                         year=None, num_days=None, custom_username=None,
                         custom_email=None, push=True, use_api=False,
                         github_token=None, repo_info=None,
                         random_times=False, branch_name=None):
    """
    Modo projeto: commita os ARQUIVOS REAIS do repositório agrupados
    em commits semânticos com datas retroativas.

    Fluxo:
      1. Detecta e agrupa todos os arquivos do repo
      2. Distribui datas entre start e end
      3. Cria um branch órfão (sem histórico anterior)
      4. Commita cada grupo com a data retroativa correspondente
    """

    # Determinar intervalo de datas
    if year:
        start_date = datetime(year, 1, 1, 9, 0, 0)
        end_date = datetime(year, 12, 31, 18, 0, 0)
        logger.info(f"Modo projeto — ano {year}: {start_date.date()} → {end_date.date()}")
    elif start_date and end_date:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
        logger.info(f"Modo projeto — intervalo: {start_date.date()} → {end_date.date()}")
    elif num_days:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=num_days - 1)
    else:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=364)

    repo = git.Repo(repo_path)
    _configure_git_user(repo, custom_username, custom_email)

    # Agrupar arquivos
    active_jobs[job_id]['status'] = 'agrupando'
    groups = group_project_files(repo_path)

    if not groups:
        raise ValueError("Nenhum arquivo encontrado no repositório para commitar.")

    # Distribuir datas
    groups = distribute_dates(groups, start_date, end_date, random_times)

    total = len(groups)
    active_jobs[job_id].update({
        'status': 'running',
        'progress': 0,
        'start_time': time.time(),
        'total_commits': total,
        'commits_made': 0,
    })

    # Criar branch órfão (histórico limpo com datas retroativas)
    target_branch = branch_name or f"historico-{year or start_date.year}"
    logger.info(f"Criando branch órfão: {target_branch}")

    try:
        # Criar branch órfão a partir do estado atual do repo
        repo.git.checkout('--orphan', target_branch)
        # Remover tudo do staging (mantém arquivos no working dir)
        repo.git.rm('-rf', '--cached', '.')
        logger.info("Branch órfão criado e staging limpo")
    except git.GitCommandError as e:
        logger.warning(f"Branch órfão falhou, usando branch normal: {e}")
        target_branch = target_branch + '-' + str(int(time.time()))[-4:]
        repo.git.checkout('-b', target_branch)

    active_jobs[job_id]['branch'] = target_branch

    # Commitar cada grupo
    commits_made = 0
    for i, group in enumerate(groups):
        if active_jobs[job_id]['status'] == 'cancelled':
            break

        commit_dt = group['date']
        formatted = commit_dt.strftime('%Y-%m-%d %H:%M:%S')
        message = group['message']
        files = group['files']

        logger.info(f"Commit {i+1}/{total}: [{formatted}] {message}")
        logger.debug(f"  Arquivos: {files}")

        # Adicionar arquivos ao staging
        staged_count = 0
        for f in files:
            full_path = os.path.join(repo_path, f)
            if os.path.exists(full_path):
                try:
                    repo.git.add(f)
                    staged_count += 1
                except Exception as e:
                    logger.warning(f"Não foi possível adicionar {f}: {e}")

        if staged_count == 0:
            logger.warning(f"Grupo '{message}' sem arquivos staged, pulando")
            continue

        # Verificar se há algo no staging
        try:
            diff = repo.git.diff('--cached', '--name-only')
            if not diff.strip():
                logger.warning(f"Staging vazio para '{message}', pulando")
                continue
        except Exception:
            pass

        # Criar commit com data retroativa
        env = os.environ.copy()
        env['GIT_AUTHOR_DATE'] = formatted
        env['GIT_COMMITTER_DATE'] = formatted

        try:
            repo.git.commit(m=message, env=env)
            commits_made += 1
            logger.info(f"  ✓ Commit criado: {formatted}")
        except git.GitCommandError as e:
            logger.warning(f"  Commit falhou para '{message}': {e}")
            continue

        active_jobs[job_id].update({
            'progress': int((i + 1) / total * 100),
            'commits_made': commits_made,
        })
        time.sleep(0.1)

    # Push
    _finish_job(repo, repo_path, repo_info, github_token, push, use_api,
                target_branch, job_id, commits_made)


# ─── Helpers internos ────────────────────────────────────────────────────────

def _configure_git_user(repo, custom_username, custom_email):
    """Configura nome/email do autor se fornecido."""
    if custom_username and custom_email:
        with repo.config_writer() as cfg:
            cfg.set_value('user', 'name', custom_username)
            cfg.set_value('user', 'email', custom_email)
        logger.info(f"Git user: {custom_username} <{custom_email}>")


def _finish_job(repo, repo_path, repo_info, github_token, push,
                use_api, branch, job_id, commits_made):
    """Faz push e atualiza status final do job."""
    global _stats_total_commits
    if push and active_jobs[job_id]['status'] != 'cancelled':
        active_jobs[job_id]['status'] = 'pushing'
        _add_job_log(job_id, f"Push de {commits_made} commits para '{branch}'...")
        logger.info(f"Push de {commits_made} commits para '{branch}'")
        try:
            push_to_remote(repo, repo_info, github_token, branch)
            _add_job_log(job_id, "Push concluído com sucesso.")
        except Exception as e:
            logger.error(f"Push falhou: {e}")
            _add_job_log(job_id, f"Push falhou: {e}")
            active_jobs[job_id]['status'] = 'failed'
            active_jobs[job_id]['error'] = f"Push falhou: {e}"
            _persist_completed_job(active_jobs[job_id])
            return

    if active_jobs[job_id]['status'] != 'cancelled':
        active_jobs[job_id].update({
            'status': 'completed',
            'progress': 100,
            'end_time': time.time(),
            'commits_made': commits_made,
        })
        _stats_total_commits += commits_made
        _add_job_log(job_id, f"Job concluído: {commits_made} commits criados.")
        _persist_completed_job(active_jobs[job_id])
        # Notify Guardian
        try:
            import requests as _req
            _dashboard_url = os.getenv('DASHBOARD_URL', 'http://localhost:3000')
            _job = active_jobs[job_id]
            _req.post(f'{_dashboard_url}/api/guardian/event', json={
                'operator':      _job.get('github_user', 'anonymous'),
                'repo_name':     _job.get('repo_name'),
                'repo_url':      _job.get('repo_url'),
                'commit_year':   _job.get('year'),
                'commits_count': _job.get('commits_made', 0),
                'branch_name':   _job.get('branch'),
                'mode':          _job.get('commit_mode', 'unknown'),
                'source':        'flask',
                'session_id':    _job.get('id'),
            }, timeout=2)
        except Exception:
            pass
    logger.info(f"Job {job_id} concluído: {commits_made} commits")


# ─── Rotas Flask ─────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/start-job', methods=['POST'])
def start_job():
    """Inicia um processo de criação de commits retroativos."""
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'message': 'Dados inválidos'}), 400

    repo_url = data.get('repo_url')
    is_valid, repo_info = validate_repo_url(repo_url)
    if not is_valid:
        return jsonify({'status': 'error', 'message': 'URL do repositório inválida'}), 400

    commit_mode = data.get('commit_mode', 'arquivo')  # 'arquivo' ou 'projeto'
    year = data.get('year')
    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')
    num_days = data.get('num_days', 30)
    commits_per_day = max(1, min(10, int(data.get('commits_per_day', 1))))
    skip_weekends = data.get('skip_weekends', False)
    branch_name = data.get('branch_name', '')

    github_token = data.get('github_token') or app.config['DEFAULT_GITHUB_TOKEN']
    use_api = bool(data.get('use_api', True)) and repo_info and repo_info.get('platform') == 'github'

    if use_api and github_token:
        test = github_api_request('/user', token=github_token)
        if not test:
            use_api = False
            logger.warning("Token GitHub inválido, desativando uso da API")
        else:
            logger.info(f"Token válido — usuário: {test.get('login')}")

    job_id = f"job_{uuid.uuid4().hex[:12]}"
    repo_dir = os.path.join(app.config['UPLOAD_FOLDER'], job_id)

    active_jobs[job_id] = {
        'id': job_id,
        'repo_url': repo_url,
        'status': 'cloning',
        'progress': 0,
        'start_time': time.time(),
        'commits_made': 0,
        'repo_dir': repo_dir,
        'use_api': use_api,
        'platform': repo_info.get('platform') if repo_info else None,
        'commit_mode': commit_mode,
        'year': year,
        'start_date': start_date_str,
        'end_date': end_date_str,
        'num_days': int(num_days) if num_days else None,
        'branch_name': branch_name,
    }

    def setup_and_run():
        _add_job_log(job_id, f"Job {job_id} iniciado. Modo: {commit_mode}")
        try:
            clone_url = repo_url
            if use_api and github_token and repo_url.startswith('https://'):
                clone_url = get_auth_url_with_token(repo_url, github_token)

            _add_job_log(job_id, f"Clonando repositório: {repo_url}")
            logger.info(f"Clonando: {repo_url}")
            try:
                git.Repo.clone_from(clone_url, repo_dir)
                _add_job_log(job_id, "Repositório clonado com sucesso.")
            except Exception as e:
                msg = f'Erro ao clonar: {e}'
                active_jobs[job_id].update({'status': 'failed', 'error': msg})
                _add_job_log(job_id, msg)
                return

            # Configurar remote com token
            if use_api and github_token:
                try:
                    cloned = git.Repo(repo_dir)
                    url = cloned.remotes.origin.url
                    if url.startswith('https://') and '@' not in url:
                        cloned.git.remote('set-url', 'origin', get_auth_url_with_token(url, github_token))
                except Exception as e:
                    logger.warning(f"Erro configurando remote: {e}")

            common = dict(
                repo_path=repo_dir,
                job_id=job_id,
                year=year,
                start_date=start_date_str,
                end_date=end_date_str,
                num_days=int(num_days) if num_days else None,
                custom_username=data.get('custom_username'),
                custom_email=data.get('custom_email'),
                push=data.get('push', True),
                use_api=use_api,
                github_token=github_token,
                repo_info=repo_info,
                random_times=data.get('random_times', False),
            )

            if commit_mode == 'projeto':
                make_commits_projeto(
                    **common,
                    branch_name=branch_name or None,
                )
            else:
                make_commits_arquivo(
                    **common,
                    message_template=data.get('commit_message', 'Commit retroativo: {date}'),
                    filename=data.get('filename', 'data.txt'),
                    commits_per_day=commits_per_day,
                    skip_weekends=skip_weekends,
                )

        except Exception as e:
            active_jobs[job_id].update({'status': 'failed', 'error': str(e)})
            logger.error(f"Erro no job {job_id}: {e}", exc_info=True)

    threading.Thread(target=setup_and_run, daemon=True).start()

    return jsonify({
        'status': 'success',
        'message': 'Job iniciado',
        'job_id': job_id,
        'commit_mode': commit_mode,
        'use_api': use_api,
    }), 201


@app.route('/api/job-status/<job_id>')
def job_status(job_id):
    if job_id not in active_jobs:
        return jsonify({'status': 'error', 'message': 'Job não encontrado'}), 404
    job = {k: v for k, v in active_jobs[job_id].items() if k != 'repo_dir'}
    return jsonify({'status': 'success', 'job': job})


@app.route('/api/cancel-job/<job_id>', methods=['POST'])
def cancel_job(job_id):
    if job_id not in active_jobs:
        return jsonify({'status': 'error', 'message': 'Job não encontrado'}), 404
    active_jobs[job_id]['status'] = 'cancelled'
    return jsonify({'status': 'success', 'message': 'Job cancelado'})


@app.route('/api/jobs')
def list_jobs():
    jobs = [{k: v for k, v in j.items() if k != 'repo_dir'} for j in active_jobs.values()]
    return jsonify({'status': 'success', 'jobs': jobs})


@app.route('/api/clean-job/<job_id>', methods=['POST'])
def clean_job(job_id):
    if job_id not in active_jobs:
        return jsonify({'status': 'error', 'message': 'Job não encontrado'}), 404
    if active_jobs[job_id]['status'] not in ('completed', 'failed', 'cancelled'):
        return jsonify({'status': 'error', 'message': 'Job ainda está em execução'}), 400
    repo_dir = active_jobs[job_id].get('repo_dir')
    if repo_dir and os.path.exists(repo_dir):
        shutil.rmtree(repo_dir, ignore_errors=True)
    active_jobs[job_id]['status'] = 'cleaned'
    return jsonify({'status': 'success', 'message': 'Job limpo'})


@app.route('/api/config')
def get_config():
    return jsonify({
        'status': 'success',
        'config': {
            'version': VERSION,
            'max_commits': app.config['MAX_COMMITS'],
            'has_default_token': bool(app.config['DEFAULT_GITHUB_TOKEN']),
            'supported_platforms': ['github', 'gitlab', 'bitbucket', 'gitea', 'azure-devops', 'other'],
            'commit_modes': ['arquivo', 'projeto'],
            'file_groups_count': len(FILE_GROUPS),
            'python_version': platform.python_version(),
            'system': platform.system(),
        }
    })


@app.route('/api/health')
def health():
    """Verificação de saúde do servidor."""
    uptime = int(time.time() - _stats_start_time)
    active_count = sum(1 for j in active_jobs.values() if j.get('status') in ('cloning', 'running', 'pushing'))
    return jsonify({
        'status': 'ok',
        'version': VERSION,
        'uptime_seconds': uptime,
        'active_jobs': active_count,
        'total_jobs': len(active_jobs),
        'timestamp': datetime.now().isoformat(),
    })


@app.route('/api/stats')
def get_stats():
    """Estatísticas gerais do servidor."""
    statuses = {}
    for j in active_jobs.values():
        s = j.get('status', 'unknown')
        statuses[s] = statuses.get(s, 0) + 1

    total_commits_session = sum(
        j.get('commits_made', 0) for j in active_jobs.values()
        if j.get('status') == 'completed'
    )

    # load persisted history
    history_count = 0
    history_commits = 0
    persist_path = app.config['JOBS_PERSIST_FILE']
    if os.path.exists(persist_path):
        try:
            with open(persist_path) as f:
                hist = json.load(f)
            history_count = len(hist)
            history_commits = sum(h.get('commits_made', 0) for h in hist)
        except Exception:
            pass

    return jsonify({
        'status': 'success',
        'stats': {
            'uptime_seconds': int(time.time() - _stats_start_time),
            'jobs_this_session': len(active_jobs),
            'commits_this_session': total_commits_session,
            'jobs_total_persisted': history_count,
            'commits_total_persisted': history_commits,
            'jobs_by_status': statuses,
            'file_groups': len(FILE_GROUPS),
            'max_commits_per_job': app.config['MAX_COMMITS'],
        }
    })


@app.route('/api/groups')
def list_groups():
    """Lista todos os grupos semânticos de arquivos disponíveis."""
    groups = [
        {'key': key, 'patterns': patterns, 'message': message}
        for key, patterns, message in FILE_GROUPS
    ]
    return jsonify({
        'status': 'success',
        'total': len(groups),
        'groups': groups,
    })


@app.route('/api/logs/<job_id>')
def get_job_logs(job_id):
    """Retorna o log de execução de um job."""
    if job_id not in active_jobs:
        return jsonify({'status': 'error', 'message': 'Job não encontrado'}), 404
    logs = job_logs.get(job_id, [])
    return jsonify({
        'status': 'success',
        'job_id': job_id,
        'lines': logs,
        'count': len(logs),
    })


@app.route('/api/delete-job/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    """Remove um job da memória (apenas jobs finalizados)."""
    if job_id not in active_jobs:
        return jsonify({'status': 'error', 'message': 'Job não encontrado'}), 404
    job = active_jobs[job_id]
    if job.get('status') in ('cloning', 'running', 'pushing', 'agrupando'):
        return jsonify({'status': 'error', 'message': 'Não é possível remover job em execução'}), 400
    repo_dir = job.get('repo_dir')
    if repo_dir and os.path.exists(repo_dir):
        shutil.rmtree(repo_dir, ignore_errors=True)
    del active_jobs[job_id]
    job_logs.pop(job_id, None)
    return jsonify({'status': 'success', 'message': f'Job {job_id} removido'})


@app.route('/api/history')
def get_history():
    """Retorna o histórico de jobs persistidos em disco."""
    persist_path = app.config['JOBS_PERSIST_FILE']
    if not os.path.exists(persist_path):
        return jsonify({'status': 'success', 'jobs': [], 'total': 0})
    try:
        with open(persist_path) as f:
            history = json.load(f)
        limit = min(int(request.args.get('limit', 50)), 100)
        return jsonify({'status': 'success', 'jobs': history[:limit], 'total': len(history)})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/validate-token', methods=['POST'])
def validate_token():
    data = request.json
    if not data or 'token' not in data:
        return jsonify({'status': 'error', 'message': 'Token não fornecido'}), 400

    token = data['token']
    user = github_api_request('/user', token=token)
    if not user:
        return jsonify({'status': 'error', 'message': 'Token inválido', 'valid': False})

    scopes = []
    try:
        r = requests.get(f"{app.config['GITHUB_API_URL']}/rate_limit",
                         headers={'Authorization': f'token {token}'}, timeout=10)
        scopes = [s for s in r.headers.get('X-OAuth-Scopes', '').split(', ') if s]
    except Exception:
        pass

    return jsonify({'status': 'success', 'valid': True, 'user': user.get('login'),
                    'name': user.get('name'), 'scopes': scopes})


@app.route('/api/preview', methods=['POST'])
def preview_commits():
    """Retorna prévia dos grupos de commits sem criar nada."""
    data = request.json or {}
    commit_mode = data.get('commit_mode', 'arquivo')
    year = data.get('year')
    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')
    num_days = data.get('num_days', 30)
    commits_per_day = max(1, min(10, int(data.get('commits_per_day', 1))))
    skip_weekends = data.get('skip_weekends', False)

    try:
        if year:
            sd = datetime(year, 1, 1)
            ed = datetime(year, 12, 31)
        elif start_date_str and end_date_str:
            sd = datetime.strptime(start_date_str, '%Y-%m-%d')
            ed = datetime.strptime(end_date_str, '%Y-%m-%d')
        else:
            ed = datetime.now()
            sd = ed - timedelta(days=int(num_days) - 1)

        if commit_mode == 'projeto':
            # Conta os grupos reais a partir do FILE_GROUPS (sem clonar o repo)
            # Retorna a contagem exata de grupos não-vazios que seriam criados.
            # Como não temos o repo disponível aqui, usamos o número de grupos
            # definidos em FILE_GROUPS como limite superior realista.
            total_groups = len([g for g in FILE_GROUPS if g[1]])  # grupos com padrões
            return jsonify({'status': 'success', 'preview': {
                'mode': 'projeto',
                'start': sd.strftime('%Y-%m-%d'),
                'end': ed.strftime('%Y-%m-%d'),
                'estimated_commits': total_groups,
                'total_commits': total_groups,
                'description': (
                    f'Até {total_groups} commits com arquivos reais agrupados semanticamente. '
                    'O número exato depende dos arquivos presentes no repositório.'
                ),
                'groups_preview': [
                    {'group': key, 'message': msg}
                    for key, patterns, msg in FILE_GROUPS
                ],
            }})
        else:
            dates = build_date_list(sd, ed, commits_per_day, skip_weekends)
            total = len(dates)
            return jsonify({'status': 'success', 'preview': {
                'mode': 'arquivo',
                'start': sd.strftime('%Y-%m-%d'),
                'end': ed.strftime('%Y-%m-%d'),
                'total_commits': total,
                'commits_per_day': commits_per_day,
                'skip_weekends': skip_weekends,
                'sample_first': [d.strftime('%Y-%m-%d %H:%M:%S') for d in dates[:5]],
                'sample_last': [d.strftime('%Y-%m-%d %H:%M:%S') for d in dates[-3:]],
                'exceeds_limit': total > app.config['MAX_COMMITS'],
            }})
    except ValueError as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


# ─── AVT — Autoridade de Variância Temporal ──────────────────────────────────

_AVT_ALERTS = [
    {'level': 'info',    'title': 'Vigilância Ativa',       'msg': 'A AVT está monitorando sua linha do tempo. Todas as ações são registradas.',                         'agent': 'Mobius M. Mobius', 'icon': '🕵️'},
    {'level': 'warning', 'title': 'Variante Detectada',     'msg': 'Sua atividade foi flagrada como suspeita. Permaneça onde está. Por favor.',                           'agent': 'Hunter B-15',      'icon': '⚠️'},
    {'level': 'info',    'title': 'Linha Sagrada OK',       'msg': 'Você ainda está em conformidade com a Linha do Tempo Sagrada. Isso pode mudar.',                      'agent': 'Ravonna Renslayer','icon': '🌿'},
    {'level': 'info',    'title': 'He Who Remains',         'msg': 'Todos os caminhos levam a ele. Inclusive seus commits das 3 da manhã.',                               'agent': 'He Who Remains',   'icon': '👁️'},
    {'level': 'warning', 'title': 'Aviso de Fragmentação', 'msg': 'Commits retroativos em excesso podem fragmentar a realidade. Ou o GitHub. Ambos.',                    'agent': 'Mobius M. Mobius', 'icon': '💥'},
    {'level': 'info',    'title': 'Dossier Atualizado',    'msg': 'Adicionamos mais entradas ao seu arquivo na AVT. Temos um arquivo enorme agora.',                     'agent': 'Hunter X-05',      'icon': '📁'},
    {'level': 'warning', 'title': 'Ramificação Detectada', 'msg': 'Cada branch que você cria é uma linha do tempo que podemos podar quando quisermos.',                  'agent': 'Ravonna Renslayer','icon': '🌿'},
    {'level': 'info',    'title': 'TemPad Autorizado',     'msg': 'Seus commits viajaram no tempo com sucesso. Por favor, não repita isso.',                              'agent': 'Mobius M. Mobius', 'icon': '⏱️'},
    {'level': 'danger',  'title': 'ALERTA CRÍTICO',        'msg': 'Você está reescrevendo o passado! Os Minutemen foram despachados para sua localização.',               'agent': 'Minutemen',        'icon': '🚨'},
    {'level': 'info',    'title': 'Curiosidade TVA',       'msg': 'Sabia que 87% das variantes são capturadas na primeira semana? Você faz parte dos 13%.',               'agent': 'Hunter B-15',      'icon': '📊'},
    {'level': 'warning', 'title': 'Padrão Suspeito',       'msg': 'Commits em anos que você mal lembra? A AVT chama isso de... comportamento suspeito.',                  'agent': 'Mobius M. Mobius', 'icon': '🔍'},
    {'level': 'info',    'title': 'Protocolo Temporal',    'msg': 'Você não tem livre-arbítrio. Está seguindo o que sempre esteve escrito. Relaxe.',                     'agent': 'He Who Remains',   'icon': '📜'},
    {'level': 'danger',  'title': 'EVENTO NEXUS',          'msg': 'Uma ramificação temporal significativa foi detectada. Equipe de poda despachada.',                    'agent': 'Minutemen',        'icon': '☢️'},
    {'level': 'info',    'title': 'Reflexão da AVT',       'msg': 'Cada commit ecoa pelo Multiverso. CommitForge apoia uso responsável e honesto.',                      'agent': 'Ravonna Renslayer','icon': '🌌'},
    {'level': 'warning', 'title': 'Sobrecarga Temporal',   'msg': '365 commits de uma vez? Loki fez pior, mas ainda assim. Use com moderação.',                          'agent': 'Hunter X-05',      'icon': '⚡'},
    {'level': 'info',    'title': 'Registro Temporal',     'msg': 'CommitForge foi criado para documentar trabalho real. A AVT aprecia a honestidade.',                  'agent': 'Mobius M. Mobius', 'icon': '✅'},
    {'level': 'warning', 'title': 'Memória Expurgada',     'msg': 'Lembra quando você não usava git? A AVT lembra. Temos tudo registrado.',                              'agent': 'Hunter B-15',      'icon': '🧠'},
    {'level': 'info',    'title': 'TemPad Detectado',      'msg': 'Um novo TemPad foi ativado nesta sessão. Monitorando trajetória temporal.',                            'agent': 'Hunter X-05',      'icon': '📡'},
    {'level': 'danger',  'title': 'Poda Iminente',         'msg': 'Sua branch criou uma divergência significativa. A AVT reserva o direito de podar.',                   'agent': 'Minutemen',        'icon': '✂️'},
    {'level': 'info',    'title': 'Loki Aprova',           'msg': 'Até o Deus da Trapaça reconhece: documentar trabalho real é uma nobre missão.',                       'agent': 'He Who Remains',   'icon': '🐍'},
]


def _job_to_avt_entry(job: dict) -> dict:
    """Normaliza um job para o formato da linha do tempo AVT."""
    year = job.get('year')
    start = job.get('start_date') or job.get('start_time')
    if not year and start:
        try:
            if isinstance(start, str) and len(start) >= 4:
                year = int(start[:4])
            elif isinstance(start, (int, float)):
                year = datetime.fromtimestamp(float(start)).year
        except Exception:
            pass
    return {
        'id':         job.get('id', ''),
        'repo':       job.get('repo_url', 'Repositório Desconhecido'),
        'year':       year or datetime.now().year,
        'start_date': str(job.get('start_date', '')),
        'end_date':   str(job.get('end_date', '')),
        'commits':    job.get('commits_made', 0),
        'status':     job.get('status', 'unknown'),
        'branch':     job.get('branch') or 'main',
        'mode':       job.get('commit_mode', 'arquivo'),
        'created_at': job.get('start_time', ''),
        'platform':   job.get('platform', 'github'),
    }


@app.route('/timeline')
def avt_timeline():
    """Página AVT — Linha do Tempo Temporal."""
    return render_template('timeline.html')


@app.route('/api/timeline')
def get_avt_timeline():
    """Dados consolidados para a visualização AVT."""
    jobs = [_job_to_avt_entry(j) for j in active_jobs.values()]
    seen_ids = {j['id'] for j in jobs}

    persist_path = app.config['JOBS_PERSIST_FILE']
    if os.path.exists(persist_path):
        try:
            with open(persist_path) as f:
                history = json.load(f)
            for h in history[:100]:
                if h.get('id') not in seen_ids:
                    jobs.append(_job_to_avt_entry(h))
                    seen_ids.add(h.get('id'))
        except Exception:
            pass

    current_year = datetime.now().year
    nexus_events = [j for j in jobs if j['year'] > current_year]
    branches     = [j for j in jobs if j['branch'] not in ('main', 'master', '')]
    total_commits = sum(j['commits'] for j in jobs)
    surveillance  = min(5, 1 + len(jobs) // 3 + total_commits // 100)

    return jsonify({
        'status':            'success',
        'jobs':              jobs,
        'nexus_events':      nexus_events,
        'branches':          branches,
        'surveillance_level': surveillance,
        'total_commits':     total_commits,
        'total_jobs':        len(jobs),
        'current_year':      current_year,
    })


@app.route('/api/avt/alert')
def get_avt_alert():
    """Retorna um alerta aleatório da AVT."""
    total_commits = sum(j.get('commits_made', 0) for j in active_jobs.values())
    current_year  = datetime.now().year
    alerts = list(_AVT_ALERTS)

    if any(j.get('year', 0) and j.get('year', 0) > current_year for j in active_jobs.values()):
        alerts.append({
            'level': 'danger', 'icon': '🔮',
            'title': 'NEXUS FUTURO DETECTADO',
            'msg':   'Commits no FUTURO?! He Who Remains está visivelmente perturbado com sua linha do tempo.',
            'agent': 'He Who Remains',
        })
    if total_commits > 500:
        alerts.append({
            'level': 'danger', 'icon': '💥',
            'title': 'Sobrecarga Absoluta',
            'msg':   f'{total_commits} commits manipulados. Você está literalmente quebrando a física temporal.',
            'agent': 'Mobius M. Mobius',
        })

    chosen = dict(random.choice(alerts))
    chosen['timestamp'] = datetime.now().isoformat()
    chosen['alert_id']  = uuid.uuid4().hex[:8]
    return jsonify({'status': 'success', 'alert': chosen})


# ─── Guardian — Guardião da Linha do Tempo ───────────────────────────────────

@app.route('/api/guardian/register', methods=['POST'])
def guardian_register():
    """Registra um evento de commit no banco de dados do Guardian."""
    data = request.get_json(force=True, silent=True) or {}

    # Forward to Next.js dashboard if URL configured
    dashboard_url = os.getenv('DASHBOARD_URL', 'http://localhost:3000')
    try:
        import requests as _req
        _req.post(
            f'{dashboard_url}/api/guardian/event',
            json={**data, 'source': 'flask'},
            timeout=3
        )
    except Exception:
        pass  # Fire and forget — never fail the main flow

    return jsonify({'status': 'success', 'message': 'Evento registrado'})


@app.route('/api/guardian/status')
def guardian_status():
    """Status simplificado do Guardian baseado nos jobs ativos e histórico."""
    current_year = datetime.now().year
    all_jobs = list(active_jobs.values())

    # Load history
    persist_path = app.config['JOBS_PERSIST_FILE']
    if os.path.exists(persist_path):
        try:
            with open(persist_path) as f:
                all_jobs = all_jobs + json.load(f)[:50]
        except Exception:
            pass

    nexus_count   = sum(1 for j in all_jobs if j.get('year', 0) > current_year)
    branch_count  = sum(1 for j in all_jobs if j.get('branch', '') not in ('main', 'master', ''))
    total_commits = sum(j.get('commits_made', 0) for j in all_jobs)

    health = max(0, min(100, 100 - nexus_count * 15 - branch_count * 5))
    threat = 'critical' if nexus_count > 3 else 'red' if nexus_count > 0 else 'yellow' if branch_count > 3 else 'green'

    return jsonify({
        'status':          'success',
        'timeline_health': health,
        'threat_level':    threat,
        'nexus_count':     nexus_count,
        'branch_count':    branch_count,
        'total_jobs':      len(all_jobs),
        'total_commits':   total_commits,
        'active_jobs':     len(active_jobs),
    })


@app.errorhandler(404)
def not_found(_):
    return jsonify({'status': 'error', 'message': 'Endpoint não encontrado'}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({'status': 'error', 'message': 'Erro interno do servidor'}), 500


if __name__ == '__main__':
    port  = int(os.getenv('PORT', 5000))
    host  = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('DEBUG', 'true').lower() == 'true'
    logger.info(f"CommitForge v{VERSION} — http://{host}:{port}")
    logger.info(f"Endpoints: /api/health | /api/stats | /api/groups | /api/history | /timeline")
    app.run(debug=debug, host=host, port=port)
