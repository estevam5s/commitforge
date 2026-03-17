# Instalação do CommitForge

## Método recomendado — curl (macOS / Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install.sh | bash
```

Após instalar, recarregue o shell:

```bash
source ~/.zshrc    # zsh (padrão macOS)
source ~/.bashrc   # bash (Linux)
```

Verificar:

```bash
commitforge --version
# forge, version 1.0.0
```

---

## Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install-windows.ps1 | iex
```

Reinicie o PowerShell e verifique:

```powershell
commitforge --version
```

---

## Arch Linux

```bash
curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install-arch.sh | bash
```

---

## Debian / Ubuntu / Linux Mint

```bash
curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install-debian.sh | bash
```

---

## Docker

```bash
docker pull ghcr.io/estevam5s/commitforge:latest

docker run --rm \
  -e GITHUB_TOKEN=ghp_seu_token \
  ghcr.io/estevam5s/commitforge:latest \
  commitforge commit --repo URL --year 2020
```

---

## Resolução de problemas

### `command not found: commitforge`

O `~/.local/bin` não está no PATH. Solução:

```bash
export PATH="$HOME/.local/bin:$PATH"

# Para tornar permanente:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Python não encontrado

```bash
# macOS
brew install python@3.12

# Ubuntu/Debian
sudo apt install python3 python3-pip python3-venv

# Arch
sudo pacman -S python python-pip
```

### Reinstalar do zero

```bash
rm -rf ~/.commitforge
rm -f ~/.local/bin/commitforge ~/.local/bin/forge
# Depois execute o curl novamente
```
