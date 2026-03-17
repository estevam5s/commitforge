#!/usr/bin/env python3
"""
CommitForge CLI v2.0
Ferramenta para criar commits retroativos no Git.

Uso:
    commitforge commit --repo URL --year 2020 [OPÇÕES]
    commitforge commit --repo URL --start-date 2019-01-01 --end-date 2019-12-31
    commitforge status [--job JOB_ID]
    commitforge historico
    commitforge cancelar --job JOB_ID
    commitforge validar-token --token TOKEN
    commitforge preview --year 2020
    commitforge servidor
"""

import sys
import os
import time
import json
import subprocess
from datetime import datetime, timedelta

import click
import requests

try:
    from rich.console import Console
    from rich.progress import (
        Progress, SpinnerColumn, TextColumn,
        BarColumn, TimeElapsedColumn, TaskProgressColumn
    )
    from rich.table import Table
    from rich.panel import Panel
    from rich.text import Text
    from rich import box
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("Aviso: instale 'rich' para melhor experiência visual: pip install rich")

DEFAULT_SERVER_URL = "http://localhost:5000"
VERSION = "2.0.0"

console = Console() if RICH_AVAILABLE else None


def out(msg, style=None):
    """Imprime mensagem com ou sem rich."""
    if RICH_AVAILABLE and console:
        console.print(msg, style=style)
    else:
        # Remove tags rich para saída simples
        import re
        clean = re.sub(r'\[/?[^\]]+\]', '', str(msg))
        print(clean)


def get_server_url():
    """Retorna a URL do servidor CommitForge."""
    return os.getenv('COMMITFORGE_SERVER', DEFAULT_SERVER_URL)


def check_server(server_url):
    """Verifica se o servidor está rodando."""
    try:
        r = requests.get(f"{server_url}/api/config", timeout=3)
        return r.status_code == 200
    except Exception:
        return False


def api_post(endpoint, payload, timeout=30):
    """Realiza POST para a API CommitForge."""
    server = get_server_url()
    url = f"{server}{endpoint}"
    r = requests.post(url, json=payload, timeout=timeout)
    r.raise_for_status()
    return r.json()


def api_get(endpoint, timeout=10):
    """Realiza GET para a API CommitForge."""
    server = get_server_url()
    url = f"{server}{endpoint}"
    r = requests.get(url, timeout=timeout)
    r.raise_for_status()
    return r.json()


def print_banner():
    """Imprime o banner do CommitForge."""
    if RICH_AVAILABLE:
        banner = """[bold white]
  ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗████████╗    ███████╗ ██████╗ ██████╗  ██████╗ ███████╗
 ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║╚══██╔══╝    ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
 ██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║       █████╗  ██║   ██║██████╔╝██║  ███╗█████╗
 ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║       ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝
 ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║   ██║       ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝   ╚═╝       ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝[/bold white]"""
        console.print(banner)
        console.print(f"[dim]  Commits Retroativos no Git — v{VERSION}[/dim]\n")
    else:
        print("=" * 60)
        print(f"  CommitForge v{VERSION} — Commits Retroativos no Git")
        print("=" * 60 + "\n")


def _monitor_job(server, job_id, show_progress=True):
    """Monitora o progresso de um job em tempo real."""
    if not RICH_AVAILABLE or not show_progress:
        out(f"[dim]Acompanhando job {job_id}... (Ctrl+C para sair)[/dim]")
        last_status = None
        while True:
            try:
                data = api_get(f"/api/job-status/{job_id}")
                job = data.get('job', {})
                status = job.get('status', 'unknown')
                progress = job.get('progress', 0)
                if status != last_status:
                    out(f"  Status: {status} — {progress}%")
                    last_status = status
                if status in ('completed', 'failed', 'cancelled'):
                    break
                time.sleep(1)
            except KeyboardInterrupt:
                out("\n[yellow]→ Processo rodando em background.[/yellow]")
                break
        return

    status_labels = {
        'cloning': "Clonando repositório...",
        'running': "Criando commits retroativos...",
        'pushing': "Enviando commits para o servidor remoto...",
        'completed': "[green]Concluído![/green]",
        'failed': "[red]Falhou![/red]",
        'cancelled': "[yellow]Cancelado![/yellow]",
    }

    with Progress(
        SpinnerColumn(),
        TextColumn("[bold white]{task.description}"),
        BarColumn(complete_style="green", finished_style="bright_green"),
        TaskProgressColumn(),
        TimeElapsedColumn(),
        console=console,
        transient=False,
    ) as progress:
        task = progress.add_task("Aguardando início...", total=100)
        last_status = None

        while True:
            try:
                data = api_get(f"/api/job-status/{job_id}")
                job = data.get('job', {})
                status = job.get('status', 'unknown')
                pct = job.get('progress', 0)

                if status != last_status:
                    desc = status_labels.get(status, f"Status: {status}")
                    progress.update(task, description=desc)
                    last_status = status

                progress.update(task, completed=pct)

                if status in ('completed', 'failed', 'cancelled'):
                    progress.update(task, completed=100 if status == 'completed' else pct)
                    break

                time.sleep(1)
            except KeyboardInterrupt:
                console.print("\n[yellow]→ Processo continua em background. Use 'commitforge status' para acompanhar.[/yellow]")
                return
            except Exception:
                time.sleep(2)

    # Resultado final
    try:
        data = api_get(f"/api/job-status/{job_id}")
        job = data.get('job', {})
        status = job.get('status', 'unknown')

        console.print()
        if status == 'completed':
            elapsed = job.get('end_time', time.time()) - job.get('start_time', time.time())
            commits_made = job.get('commits_made', job.get('num_days', 0))
            year_info = f" (ano {job['year']})" if job.get('year') else ""

            t = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
            t.add_column(style="dim white")
            t.add_column(style="white")
            t.add_row("Status:", "[bold green]✓ Concluído[/bold green]")
            t.add_row("Commits criados:", f"[bold]{commits_made}[/bold]{year_info}")
            t.add_row("Tempo total:", f"{elapsed:.1f}s")
            t.add_row("Repositório:", job.get('repo_url', '-'))
            t.add_row("Branch:", job.get('branch', 'main'))

            console.print(Panel(t, title="[bold]Resultado[/bold]", border_style="green"))
        elif status == 'failed':
            console.print(f"[bold red]✗ Processo falhou:[/bold red] {job.get('error', 'Erro desconhecido')}")
        elif status == 'cancelled':
            console.print("[yellow]→ Processo cancelado pelo usuário.[/yellow]")
    except Exception:
        pass


@click.group()
@click.version_option(version=VERSION, prog_name='commitforge')
def cli():
    """
    CommitForge — Crie commits retroativos no Git com facilidade.

    \b
    Exemplos:
      # Criar commits para o ano 2020 inteiro
      commitforge commit --repo https://github.com/user/repo.git --year 2020

    \b
      # Criar commits entre datas específicas
      commitforge commit --repo URL --start-date 2019-01-01 --end-date 2019-12-31

    \b
      # Múltiplos commits por dia, horários aleatórios
      commitforge commit --repo URL --year 2020 --commits-por-dia 3 --aleatorio

    \b
      # Verificar status
      commitforge status --job job_123456
    """
    pass


@cli.command()
@click.option('--repo', '-r', required=True, help='URL do repositório Git (HTTPS ou SSH)')
@click.option('--year', '-y', type=int, default=None, help='Ano para criar commits (ex: 2020)')
@click.option('--start-date', 'start_date', default=None, help='Data de início — formato YYYY-MM-DD')
@click.option('--end-date', 'end_date', default=None, help='Data de fim — formato YYYY-MM-DD')
@click.option('--dias', '-d', type=int, default=None, help='Número de dias a partir de hoje')
@click.option('--commits-por-dia', 'commits_per_day', type=int, default=1,
              help='Commits por dia (1–10, padrão: 1)')
@click.option('--mensagem', '-m', 'message', default='Commit retroativo: {date}',
              help='Template da mensagem. Use {date} como placeholder')
@click.option('--arquivo', '-f', 'filename', default='data.txt',
              help='Arquivo a ser modificado nos commits (padrão: data.txt)')
@click.option('--token', '-t', default=None,
              help='Token de acesso pessoal do GitHub/GitLab')
@click.option('--usuario', 'custom_username', default=None, help='Nome de autor Git (opcional)')
@click.option('--email', 'custom_email', default=None, help='Email de autor Git (opcional)')
@click.option('--sem-push', 'no_push', is_flag=True, default=False,
              help='Não enviar commits ao repositório remoto')
@click.option('--aleatorio', 'random_times', is_flag=True, default=False,
              help='Usar horários aleatórios nos commits (mais natural)')
@click.option('--pular-fins-de-semana', 'skip_weekends', is_flag=True, default=False,
              help='Criar commits apenas em dias úteis (segunda a sexta)')
@click.option('--modo', '-M', 'commit_mode', default='arquivo',
              type=click.Choice(['arquivo', 'projeto'], case_sensitive=False),
              help='Modo: "arquivo" (log único) ou "projeto" (arquivos reais do repo)')
@click.option('--branch', 'branch_name', default=None,
              help='Nome do branch alvo (padrão: historico-YYYY)')
@click.option('--aguardar/--nao-aguardar', 'wait', default=True,
              help='Aguardar conclusão (padrão: sim)')
@click.option('--sem-banner', 'no_banner', is_flag=True, default=False, hidden=True)
def commit(repo, year, start_date, end_date, dias, commits_per_day, message,
           filename, token, custom_username, custom_email, no_push,
           random_times, skip_weekends, commit_mode, branch_name, wait, no_banner):
    """Criar commits retroativos em um repositório Git."""
    if not no_banner:
        print_banner()

    server = get_server_url()
    if not check_server(server):
        out(f"[bold red]✗ Servidor CommitForge não está rodando.[/bold red]")
        out(f"[dim]  Inicie com: commitforge servidor[/dim]")
        out(f"[dim]  Ou diretamente: cd cli-commit && python app.py[/dim]")
        sys.exit(1)

    # Modo de commit
    mode_label = "Projeto (arquivos reais)" if commit_mode == 'projeto' else "Arquivo (log único)"
    out(f"[green]→[/green] Modo de commit: [bold]{mode_label}[/bold]")

    # Validações e informações sobre o modo selecionado
    if year:
        out(f"[green]→[/green] Modo: [bold]Ano completo {year}[/bold] (01/jan → 31/dez)")
    elif start_date and end_date:
        out(f"[green]→[/green] Modo: [bold]Intervalo[/bold] {start_date} → {end_date}")
    elif dias:
        out(f"[green]→[/green] Modo: [bold]Últimos {dias} dias[/bold]")
    else:
        out("[green]→[/green] Modo: [bold]Últimos 30 dias[/bold] (padrão)")

    if commits_per_day > 1:
        out(f"[green]→[/green] Commits por dia: [bold]{commits_per_day}[/bold]")
    if skip_weekends:
        out("[green]→[/green] Pulando fins de semana")
    if random_times:
        out("[green]→[/green] Usando horários aleatórios")

    # Montar payload
    payload = {
        'repo_url': repo,
        'commit_message': message,
        'filename': filename,
        'push': not no_push,
        'random_times': random_times,
        'skip_weekends': skip_weekends,
        'commits_per_day': max(1, min(10, commits_per_day)),
        'use_api': True,
        'commit_mode': commit_mode,
    }
    if branch_name:
        payload['branch_name'] = branch_name

    if year:
        payload['year'] = year
    elif start_date and end_date:
        payload['start_date'] = start_date
        payload['end_date'] = end_date
    elif dias:
        payload['num_days'] = dias
    else:
        payload['num_days'] = 30

    if token:
        payload['github_token'] = token
    if custom_username:
        payload['custom_username'] = custom_username
    if custom_email:
        payload['custom_email'] = custom_email

    # Prévia antes de executar
    try:
        preview_data = api_post('/api/preview', {
            k: payload[k] for k in
            ['year', 'start_date', 'end_date', 'num_days', 'commits_per_day', 'skip_weekends', 'random_times']
            if k in payload
        })
        preview = preview_data.get('preview', {})
        total = preview.get('total_commits', 0)
        out(f"[dim]  Commits estimados: [bold]{total}[/bold] ({preview.get('start')} → {preview.get('end')})[/dim]")

        if preview.get('exceeds_limit'):
            out(f"[bold red]✗ Total de commits ({total}) excede o limite máximo![/bold red]")
            sys.exit(1)
    except Exception:
        pass  # Prévia é opcional

    # Iniciar processo
    try:
        data = api_post('/api/start-job', payload)

        if data.get('status') != 'success':
            out(f"[bold red]✗ Erro:[/bold red] {data.get('message', 'Erro desconhecido')}")
            sys.exit(1)

        job_id = data['job_id']
        out(f"[green]✓[/green] Processo iniciado — ID: [bold]{job_id}[/bold]")

        if wait:
            _monitor_job(server, job_id)
        else:
            out(f"[dim]→ Use 'commitforge status --job {job_id}' para acompanhar[/dim]")

    except requests.exceptions.ConnectionError:
        out("[bold red]✗ Erro:[/bold red] Não foi possível conectar ao servidor CommitForge.")
        out("[dim]→ Inicie com: commitforge servidor[/dim]")
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        try:
            msg = e.response.json().get('message', str(e))
        except Exception:
            msg = str(e)
        out(f"[bold red]✗ Erro HTTP:[/bold red] {msg}")
        sys.exit(1)
    except Exception as e:
        out(f"[bold red]✗ Erro:[/bold red] {str(e)}")
        sys.exit(1)


@cli.command()
@click.option('--job', '-j', default=None, help='ID do job para verificar')
def status(job):
    """Verificar o status de um processo."""
    server = get_server_url()

    if job:
        try:
            data = api_get(f"/api/job-status/{job}")
            if data.get('status') == 'error':
                out(f"[red]✗ Erro:[/red] {data.get('message')}")
                return

            job_info = data.get('job', {})

            if RICH_AVAILABLE:
                status_colors = {
                    'running': 'yellow', 'completed': 'green', 'failed': 'red',
                    'cancelled': 'dim', 'cloning': 'cyan', 'pushing': 'blue',
                    'cleaned': 'dim',
                }
                sv = job_info.get('status', 'unknown')
                sc = status_colors.get(sv, 'white')

                t = Table(title=f"Job: {job}", border_style="white", box=box.ROUNDED)
                t.add_column("Campo", style="dim")
                t.add_column("Valor", style="white")
                t.add_row("Status", f"[{sc}]{sv}[/{sc}]")
                t.add_row("Repositório", job_info.get('repo_url', '-'))

                if job_info.get('year'):
                    t.add_row("Ano", str(job_info['year']))
                elif job_info.get('start_date') and job_info.get('end_date'):
                    t.add_row("Intervalo", f"{job_info['start_date']} → {job_info['end_date']}")

                t.add_row("Commits feitos", str(job_info.get('commits_made', '-')))
                t.add_row("Total estimado", str(job_info.get('estimated_commits', job_info.get('num_days', '-'))))
                t.add_row("Progresso", f"{job_info.get('progress', 0)}%")
                t.add_row("Branch", job_info.get('branch', '-'))

                if job_info.get('error'):
                    t.add_row("Erro", f"[red]{job_info['error']}[/red]")

                console.print(t)
            else:
                print(json.dumps(job_info, indent=2, default=str))

        except requests.exceptions.ConnectionError:
            out("[red]✗ Servidor CommitForge não está rodando.[/red]")
    else:
        _list_jobs()


@cli.command()
def historico():
    """Listar o histórico de todos os processos executados."""
    _list_jobs()


def _list_jobs():
    """Lista todos os jobs."""
    try:
        data = api_get("/api/jobs")
        jobs = data.get('jobs', [])

        if not jobs:
            out("[dim]Nenhum processo encontrado.[/dim]")
            return

        # Ordenar por start_time, mais recente primeiro
        jobs.sort(key=lambda x: x.get('start_time', 0), reverse=True)

        if RICH_AVAILABLE:
            status_colors = {
                'running': 'yellow', 'completed': 'green', 'failed': 'red',
                'cancelled': 'dim', 'cloning': 'cyan', 'pushing': 'blue',
                'cleaned': 'dim',
            }

            t = Table(
                title="Histórico de Processos CommitForge",
                border_style="white",
                box=box.ROUNDED,
            )
            t.add_column("ID", style="dim", no_wrap=True, max_width=20)
            t.add_column("Repositório", max_width=40)
            t.add_column("Período", max_width=25)
            t.add_column("Commits", justify="right")
            t.add_column("Progresso", justify="right")
            t.add_column("Status", no_wrap=True)

            for j in jobs:
                sv = j.get('status', 'unknown')
                sc = status_colors.get(sv, 'white')
                repo = j.get('repo_url', '-')
                if len(repo) > 38:
                    repo = '...' + repo[-35:]

                # Período
                if j.get('year'):
                    periodo = f"Ano {j['year']}"
                elif j.get('start_date') and j.get('end_date'):
                    periodo = f"{j['start_date']} → {j['end_date']}"
                else:
                    periodo = f"Últimos {j.get('num_days', '?')} dias"

                commits = str(j.get('commits_made', j.get('num_days', '-')))

                t.add_row(
                    j.get('id', '-'),
                    repo,
                    periodo,
                    commits,
                    f"{j.get('progress', 0)}%",
                    f"[{sc}]{sv}[/{sc}]",
                )

            console.print(t)
        else:
            for j in jobs:
                print(f"  {j.get('id')} | {j.get('status')} | {j.get('progress', 0)}% | {j.get('repo_url', '-')}")

    except requests.exceptions.ConnectionError:
        out("[red]✗ Servidor CommitForge não está rodando.[/red]")


@cli.command()
@click.option('--job', '-j', required=True, help='ID do job para cancelar')
def cancelar(job):
    """Cancelar um processo em andamento."""
    try:
        data = api_post(f"/api/cancel-job/{job}", {})
        if data.get('status') == 'success':
            out(f"[green]✓[/green] Processo [bold]{job}[/bold] cancelado com sucesso.")
        else:
            out(f"[red]✗ Erro:[/red] {data.get('message')}")
    except requests.exceptions.ConnectionError:
        out("[red]✗ Servidor CommitForge não está rodando.[/red]")


@cli.command('validar-token')
@click.option('--token', '-t', required=True, help='Token do GitHub para validar')
def validar_token(token):
    """Validar um token de acesso pessoal do GitHub."""
    out("[dim]→ Validando token...[/dim]")
    try:
        data = api_post('/api/validate-token', {'token': token})
        if data.get('valid'):
            out(f"[green]✓ Token válido![/green]")
            out(f"  Usuário:  [bold]{data.get('user', '-')}[/bold]")
            if data.get('name'):
                out(f"  Nome:     {data.get('name')}")
            scopes = [s for s in data.get('scopes', []) if s]
            if scopes:
                out(f"  Escopos:  {', '.join(scopes)}")
        else:
            out("[red]✗ Token inválido ou expirado.[/red]")
            out("[dim]→ Gere um novo em: github.com/settings/tokens[/dim]")
    except requests.exceptions.ConnectionError:
        out("[red]✗ Servidor CommitForge não está rodando.[/red]")


@cli.command()
@click.option('--year', '-y', type=int, default=None, help='Ano para prévia')
@click.option('--start-date', 'start_date', default=None, help='Data de início YYYY-MM-DD')
@click.option('--end-date', 'end_date', default=None, help='Data de fim YYYY-MM-DD')
@click.option('--dias', '-d', type=int, default=30, help='Número de dias')
@click.option('--commits-por-dia', 'commits_per_day', type=int, default=1)
@click.option('--pular-fins-de-semana', 'skip_weekends', is_flag=True, default=False)
def preview(year, start_date, end_date, dias, commits_per_day, skip_weekends):
    """Prévia das datas que seriam criadas (sem criar commits)."""
    payload = {
        'commits_per_day': commits_per_day,
        'skip_weekends': skip_weekends,
    }
    if year:
        payload['year'] = year
    elif start_date and end_date:
        payload['start_date'] = start_date
        payload['end_date'] = end_date
    else:
        payload['num_days'] = dias

    try:
        data = api_post('/api/preview', payload)
        if data.get('status') != 'success':
            out(f"[red]✗ Erro:[/red] {data.get('message')}")
            return

        p = data.get('preview', {})
        out(f"\n[bold]Prévia CommitForge[/bold]")
        out(f"  Período:       [bold]{p.get('start')}[/bold] → [bold]{p.get('end')}[/bold]")
        out(f"  Commits/dia:   {p.get('commits_per_day', 1)}")
        out(f"  Fins semana:   {'Pulados' if p.get('skip_weekends') else 'Incluídos'}")
        out(f"  [bold]Total commits: {p.get('total_commits')}[/bold]")

        if p.get('exceeds_limit'):
            out("[bold red]  ⚠ Excede o limite máximo![/bold red]")

        sample = p.get('sample_first', [])
        if sample:
            out(f"\n  Primeiros commits:")
            for d in sample[:5]:
                out(f"    [dim]{d}[/dim]")

        last = p.get('sample_last', [])
        if last:
            out(f"  Últimos commits:")
            for d in last:
                out(f"    [dim]{d}[/dim]")

    except requests.exceptions.ConnectionError:
        out("[red]✗ Servidor CommitForge não está rodando.[/red]")


@cli.command()
@click.option('--porta', '-p', type=int, default=5000, help='Porta do servidor (padrão: 5000)')
def servidor(porta):
    """Iniciar o servidor CommitForge (necessário para os outros comandos)."""
    print_banner()
    out(f"[bold]→ Iniciando servidor na porta {porta}...[/bold]")
    out(f"[dim]  Interface web: http://localhost:{porta}[/dim]")
    out(f"[dim]  API REST:      http://localhost:{porta}/api/[/dim]")
    out("[dim]  Pressione Ctrl+C para parar\n[/dim]")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    app_path = os.path.join(script_dir, 'app.py')

    if not os.path.exists(app_path):
        out(f"[red]✗ Arquivo app.py não encontrado em {script_dir}[/red]")
        out("[dim]→ Execute este comando dentro do diretório cli-commit/[/dim]")
        sys.exit(1)

    env = os.environ.copy()
    env['PORT'] = str(porta)

    try:
        subprocess.run([sys.executable, app_path], check=True, env=env, cwd=script_dir)
    except KeyboardInterrupt:
        out("\n[dim]→ Servidor encerrado.[/dim]")
    except subprocess.CalledProcessError as e:
        out(f"[red]✗ Erro ao iniciar servidor: {e}[/red]")
        sys.exit(1)


@cli.command()
def info():
    """Mostrar informações sobre a instalação e configuração."""
    print_banner()
    server = get_server_url()
    rodando = check_server(server)

    if RICH_AVAILABLE:
        t = Table(show_header=False, box=box.SIMPLE, padding=(0, 2))
        t.add_column(style="dim")
        t.add_column()
        t.add_row("Versão:", f"[bold]{VERSION}[/bold]")
        t.add_row("Servidor:", f"{'[green]● Rodando[/green]' if rodando else '[red]● Parado[/red]'}")
        t.add_row("URL servidor:", server)
        t.add_row("Token padrão:", "[green]✓ Configurado[/green]" if os.getenv('GITHUB_TOKEN') else "[dim]Não configurado[/dim]")
        t.add_row("Python:", sys.version.split()[0])
        t.add_row("Diretório:", os.path.dirname(os.path.abspath(__file__)))
        console.print(Panel(t, title="[bold]CommitForge — Informações[/bold]", border_style="white"))
    else:
        print(f"Versão: {VERSION}")
        print(f"Servidor: {'Rodando' if rodando else 'Parado'} — {server}")


def main():
    cli()


if __name__ == '__main__':
    main()
