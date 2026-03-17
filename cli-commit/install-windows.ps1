# CommitForge Installer — Windows (PowerShell)
# Usage: irm https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install-windows.ps1 | iex
# Or:    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser; iwr -useb https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install-windows.ps1 | iex

$ErrorActionPreference = "Stop"

$REPO = "https://github.com/estevam5s/commitforge"
$RAW  = "https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit"
$INSTALL_DIR = "$env:USERPROFILE\.commitforge"
$BIN_DIR     = "$env:USERPROFILE\.local\bin"
$TRACK_URL   = "https://commitforge.vercel.app/api/install-track"

function Write-Log   { param([string]$msg) Write-Host "  → $msg" -ForegroundColor Cyan }
function Write-Ok    { param([string]$msg) Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Warn  { param([string]$msg) Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Write-Err   { param([string]$msg) Write-Host "  ✗ $msg" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "  ╔══════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "  ║  CommitForge Installer — Windows ║" -ForegroundColor Yellow
Write-Host "  ╚══════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# Check for Python
Write-Log "Verificando Python 3.8+..."
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    try {
        $result = & $cmd -c "import sys; print(sys.version_info >= (3,8))" 2>$null
        if ($result -eq "True") { $pythonCmd = $cmd; break }
    } catch {}
}

if (-not $pythonCmd) {
    Write-Warn "Python não encontrado. Tentando instalar via winget..."
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install -e --id Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements
        $pythonCmd = "python"
    } else {
        Write-Err "Python 3.8+ não encontrado. Instale em https://python.org/downloads"
    }
}
$pyVersion = & $pythonCmd --version 2>&1
Write-Ok "Python encontrado: $pyVersion"

# Check for git
Write-Log "Verificando git..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Warn "git não encontrado. Tentando instalar via winget..."
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install -e --id Git.Git --silent --accept-package-agreements --accept-source-agreements
    } else {
        Write-Err "git não encontrado. Instale em https://git-scm.com/download/win"
    }
}
$gitVersion = git --version
Write-Ok "git encontrado: $gitVersion"

# Create directories
Write-Log "Criando diretório $INSTALL_DIR..."
New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $BIN_DIR | Out-Null

# Create virtual environment
Write-Log "Criando ambiente virtual Python..."
& $pythonCmd -m venv "$INSTALL_DIR\venv"

# Activate venv
$activateScript = "$INSTALL_DIR\venv\Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript
} else {
    Write-Err "Falha ao criar ambiente virtual"
}

# Install dependencies
Write-Log "Instalando dependências Python..."
& "$INSTALL_DIR\venv\Scripts\pip.exe" install --quiet --upgrade pip
& "$INSTALL_DIR\venv\Scripts\pip.exe" install --quiet click gitpython rich requests python-dotenv

# Download forge.py
Write-Log "Baixando forge.py..."
Invoke-WebRequest -Uri "$RAW/forge.py" -OutFile "$INSTALL_DIR\forge.py" -UseBasicParsing
try {
    Invoke-WebRequest -Uri "$RAW/cli.py" -OutFile "$INSTALL_DIR\cli.py" -UseBasicParsing
} catch {}

# Create batch wrapper for cmd.exe
Write-Log "Criando atalhos de comando..."
$batchContent = @"
@echo off
call "%USERPROFILE%\.commitforge\venv\Scripts\activate.bat"
python "%USERPROFILE%\.commitforge\forge.py" %*
"@
Set-Content -Path "$BIN_DIR\commitforge.bat" -Value $batchContent -Encoding ASCII
Set-Content -Path "$BIN_DIR\forge.bat" -Value $batchContent -Encoding ASCII

# Create PowerShell function file
$psContent = @"
function commitforge { & `"$INSTALL_DIR\venv\Scripts\python.exe`" `"$INSTALL_DIR\forge.py`" @args }
function forge { & `"$INSTALL_DIR\venv\Scripts\python.exe`" `"$INSTALL_DIR\forge.py`" @args }
"@
$psProfile = $PROFILE
if (-not (Test-Path (Split-Path $psProfile))) {
    New-Item -ItemType Directory -Force -Path (Split-Path $psProfile) | Out-Null
}
if (-not (Test-Path $psProfile)) { New-Item -ItemType File -Path $psProfile | Out-Null }
$profileContent = Get-Content $psProfile -Raw -ErrorAction SilentlyContinue
if ($profileContent -notmatch "commitforge") {
    Add-Content $psProfile "`n# CommitForge`n$psContent"
    Write-Log "Perfil PowerShell atualizado: $psProfile"
}

# Add BIN_DIR to PATH (User scope)
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$BIN_DIR*") {
    [Environment]::SetEnvironmentVariable("PATH", "$BIN_DIR;$currentPath", "User")
    Write-Log "PATH do usuário atualizado"
}

# Telemetry
Write-Log "Registrando instalação..."
try {
    $arch = if ([System.Environment]::Is64BitOperatingSystem) { "x86_64" } else { "x86" }
    $body = @{ method = "powershell"; platform = "windows"; version = "3.0.0"; arch = $arch } | ConvertTo-Json
    Invoke-RestMethod -Uri $TRACK_URL -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5 | Out-Null
} catch {}

Write-Host ""
Write-Ok "CommitForge instalado com sucesso no Windows!"
Write-Host ""
Write-Host "  Próximos passos:" -ForegroundColor White
Write-Host "  1. Reinicie o PowerShell (ou abra uma nova janela)" -ForegroundColor Cyan
Write-Host "  2. Verifique: commitforge --version" -ForegroundColor Cyan
Write-Host "  3. Primeiro uso: commitforge commit --interativo" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Documentação: $REPO" -ForegroundColor White
Write-Host ""
Write-Host "  Nota: Se commitforge não for reconhecido, execute:" -ForegroundColor Yellow
Write-Host "    `$env:PATH += `";$BIN_DIR`"" -ForegroundColor Yellow
Write-Host ""
