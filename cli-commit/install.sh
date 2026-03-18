#!/usr/bin/env bash
# CommitForge Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/install.sh | bash

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
echo "  ║    CommitForge Installer v3.0    ║"
echo "  ╚══════════════════════════════════╝"
echo -e "${NC}"

# Check Python
log "Verificando Python 3.8+..."
PYTHON=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        ver=$("$cmd" -c "import sys; print(sys.version_info >= (3,8))" 2>/dev/null)
        if [ "$ver" = "True" ]; then
            PYTHON="$cmd"
            break
        fi
    fi
done
[ -z "$PYTHON" ] && error "Python 3.8+ não encontrado. Instale em python.org"
success "Python encontrado: $($PYTHON --version)"

# Check git
log "Verificando git..."
command -v git &>/dev/null || error "git não encontrado. Instale em git-scm.com"
success "git encontrado: $(git --version)"

# Create install dir
log "Criando diretório $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"

# Create venv
log "Criando ambiente virtual Python..."
"$PYTHON" -m venv "$INSTALL_DIR/venv"
source "$INSTALL_DIR/venv/bin/activate"

# Install dependencies
log "Instalando dependências..."
pip install --quiet --upgrade pip
pip install --quiet click gitpython rich requests python-dotenv flask

# Download files
log "Baixando forge.py..."
curl -fsSL "$RAW/forge.py" -o "$INSTALL_DIR/forge.py"

log "Baixando cli.py..."
curl -fsSL "$RAW/cli.py" -o "$INSTALL_DIR/cli.py" || true

# Download servidor Flask (app.py + templates + static)
log "Baixando servidor Flask (app.py, templates, static)..."
curl -fsSL "$RAW/app.py" -o "$INSTALL_DIR/app.py" || warn "app.py não pôde ser baixado (será baixado automaticamente no primeiro uso)"

# Download templates and static via zip
log "Extraindo templates e arquivos estáticos..."
TMP_ZIP=$(mktemp /tmp/commitforge_XXXXXX.zip)
if curl -fsSL "https://github.com/estevam5s/commitforge/archive/refs/heads/main.zip" -o "$TMP_ZIP" 2>/dev/null; then
    if command -v unzip &>/dev/null; then
        unzip -q -o "$TMP_ZIP" \
            "commitforge-main/cli-commit/templates/*" \
            "commitforge-main/cli-commit/static/*" \
            -d /tmp/commitforge_extract 2>/dev/null || true
        if [ -d /tmp/commitforge_extract/commitforge-main/cli-commit/templates ]; then
            cp -r /tmp/commitforge_extract/commitforge-main/cli-commit/templates "$INSTALL_DIR/"
            cp -r /tmp/commitforge_extract/commitforge-main/cli-commit/static   "$INSTALL_DIR/"
            success "templates/ e static/ instalados"
        fi
        rm -rf /tmp/commitforge_extract
    fi
    rm -f "$TMP_ZIP"
fi

# Create wrapper script
log "Criando comando commitforge..."
cat > "$BIN_DIR/commitforge" << 'WRAPPER'
#!/usr/bin/env bash
INSTALL_DIR="$HOME/.commitforge"
source "$INSTALL_DIR/venv/bin/activate"
exec python "$INSTALL_DIR/forge.py" "$@"
WRAPPER
chmod +x "$BIN_DIR/commitforge"

# Also create 'forge' alias
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
    if [ -f "$f" ]; then PROFILE="$f"; break; fi
done

if [ -n "$PROFILE" ]; then
    if ! grep -q ".local/bin" "$PROFILE" 2>/dev/null; then
        echo '' >> "$PROFILE"
        echo '# CommitForge' >> "$PROFILE"
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$PROFILE"
        log "PATH atualizado em $PROFILE"
    fi
fi

# Telemetry: track install (non-blocking, respects privacy)
log "Registrando instalação..."
ARCH_CPU=$(uname -m 2>/dev/null || echo "unknown")
OS_NAME="linux"
if [[ "$OSTYPE" == "darwin"* ]]; then OS_NAME="macos"; fi
curl -sf -X POST "$TRACK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"method\":\"curl\",\"platform\":\"$OS_NAME\",\"version\":\"3.0.0\",\"arch\":\"$ARCH_CPU\"}" \
  --max-time 5 || true

echo ""
success "CommitForge instalado com sucesso!"
echo ""
echo -e "  ${BOLD}Próximos passos:${NC}"
echo -e "  1. Recarregue o shell: ${CYAN}source $PROFILE${NC}"
echo -e "  2. Verifique: ${CYAN}commitforge --version${NC}"
echo -e "  3. Primeiro uso:"
echo -e "     ${CYAN}commitforge commit --interativo${NC}"
echo ""
echo -e "  ${BOLD}Documentação:${NC} $REPO"
echo ""
