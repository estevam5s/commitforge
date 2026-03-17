#!/usr/bin/env bash
# CommitForge Installer — Arch Linux / Manjaro
# Usage: curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install-arch.sh | bash

set -e

REPO="https://github.com/estevam5s/commitforge"
RAW="https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit"
INSTALL_DIR="$HOME/.commitforge"
BIN_DIR="$HOME/.local/bin"
TRACK_URL="https://commitforge.vercel.app/api/install-track"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()    { echo -e "${CYAN}→${NC} $1"; }
success(){ echo -e "${GREEN}✓${NC} $1"; }
warn()   { echo -e "${YELLOW}⚠${NC} $1"; }
error()  { echo -e "${RED}✗${NC} $1"; exit 1; }

echo -e "${BOLD}"
echo "  ╔══════════════════════════════════╗"
echo "  ║  CommitForge Installer — Arch    ║"
echo "  ╚══════════════════════════════════╝"
echo -e "${NC}"

# Detect if pacman is available
command -v pacman &>/dev/null || error "pacman não encontrado. Este script é para Arch Linux / Manjaro."

# Install dependencies
log "Verificando dependências via pacman..."
MISSING=()
for pkg in python git curl; do
  command -v "$pkg" &>/dev/null || MISSING+=("$pkg")
done

if [ ${#MISSING[@]} -gt 0 ]; then
  log "Instalando: ${MISSING[*]}"
  sudo pacman -Sy --noconfirm "${MISSING[@]}" || error "Falha ao instalar dependências"
fi

# Check Python version
PYTHON=""
for cmd in python3 python; do
  if command -v "$cmd" &>/dev/null; then
    ver=$("$cmd" -c "import sys; print(sys.version_info >= (3,8))" 2>/dev/null)
    [ "$ver" = "True" ] && PYTHON="$cmd" && break
  fi
done
[ -z "$PYTHON" ] && error "Python 3.8+ não encontrado."
success "Python encontrado: $($PYTHON --version)"
success "git encontrado: $(git --version)"

# Install python-pip if needed
if ! "$PYTHON" -m pip --version &>/dev/null 2>&1; then
  log "Instalando python-pip..."
  sudo pacman -Sy --noconfirm python-pip || error "Falha ao instalar pip"
fi

# Setup
log "Criando diretório $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR" "$BIN_DIR"

log "Criando ambiente virtual..."
"$PYTHON" -m venv "$INSTALL_DIR/venv"
source "$INSTALL_DIR/venv/bin/activate"

log "Instalando dependências Python..."
pip install --quiet --upgrade pip
pip install --quiet click gitpython rich requests python-dotenv

log "Baixando forge.py..."
curl -fsSL "$RAW/forge.py" -o "$INSTALL_DIR/forge.py"
curl -fsSL "$RAW/cli.py" -o "$INSTALL_DIR/cli.py" || true

log "Criando comando commitforge..."
cat > "$BIN_DIR/commitforge" << 'WRAPPER'
#!/usr/bin/env bash
INSTALL_DIR="$HOME/.commitforge"
source "$INSTALL_DIR/venv/bin/activate"
exec python "$INSTALL_DIR/forge.py" "$@"
WRAPPER
chmod +x "$BIN_DIR/commitforge"

cat > "$BIN_DIR/forge" << 'WRAPPER'
#!/usr/bin/env bash
INSTALL_DIR="$HOME/.commitforge"
source "$INSTALL_DIR/venv/bin/activate"
exec python "$INSTALL_DIR/forge.py" "$@"
WRAPPER
chmod +x "$BIN_DIR/forge"

# Add to PATH
PROFILE=""
for f in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.profile"; do
  [ -f "$f" ] && PROFILE="$f" && break
done

if [ -n "$PROFILE" ]; then
  if ! grep -q ".local/bin" "$PROFILE" 2>/dev/null; then
    echo '' >> "$PROFILE"
    echo '# CommitForge' >> "$PROFILE"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$PROFILE"
    log "PATH atualizado em $PROFILE"
  fi
fi

# Telemetry: track install
log "Registrando instalação..."
ARCH_CPU=$(uname -m 2>/dev/null || echo "unknown")
curl -sf -X POST "$TRACK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"method\":\"curl\",\"platform\":\"arch\",\"version\":\"3.0.0\",\"arch\":\"$ARCH_CPU\"}" \
  --max-time 5 || true

echo ""
success "CommitForge instalado com sucesso no Arch Linux!"
echo ""
echo -e "  ${BOLD}Próximos passos:${NC}"
echo -e "  1. Recarregue o shell: ${CYAN}source $PROFILE${NC}"
echo -e "  2. Verifique: ${CYAN}commitforge --version${NC}"
echo -e "  3. Primeiro uso: ${CYAN}commitforge commit --interativo${NC}"
echo ""
echo -e "  ${BOLD}Documentação:${NC} $REPO"
echo ""

# Optional: AUR helper availability
if command -v yay &>/dev/null; then
  echo -e "  ${YELLOW}Dica:${NC} Você tem o yay instalado. Em breve commitforge estará no AUR!"
fi
