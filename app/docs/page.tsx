"use client"

import { useState } from "react"
import {
  Copy,
  Check,
  Menu,
  X,
  ChevronRight,
  Terminal,
  Zap,
  Settings,
  Book,
  Code,
  Rocket,
  Download,
  Package,
  Server,
  GitBranch,
  Clock,
  Shield,
  Globe,
  Trash2,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SidebarItem {
  title: string
  id: string
}

interface SidebarSection {
  title: string
  id: string
  icon: React.ElementType
  items: SidebarItem[]
}

// ---------------------------------------------------------------------------
// Sidebar definition
// ---------------------------------------------------------------------------
const sidebarSections: SidebarSection[] = [
  {
    title: "Início Rápido",
    id: "inicio-rapido",
    icon: Rocket,
    items: [
      { title: "Instalação", id: "inicio-instalacao" },
      { title: "Pré-requisitos", id: "inicio-prereqs" },
      { title: "Primeiro Commit", id: "inicio-primeiro-commit" },
    ],
  },
  {
    title: "Instalação",
    id: "instalacao",
    icon: Download,
    items: [
      { title: "Via curl", id: "instalacao-curl" },
      { title: "Via Docker", id: "instalacao-docker" },
      { title: "macOS / Homebrew", id: "instalacao-macos" },
      { title: "Linux (apt/rpm/AUR)", id: "instalacao-linux" },
      { title: "Via pip", id: "instalacao-pip" },
    ],
  },
  {
    title: "Desinstalação",
    id: "desinstalacao",
    icon: Trash2,
    items: [
      { title: "Visão geral", id: "desinstalar-overview" },
      { title: "Remover curl install", id: "desinstalar-curl" },
      { title: "Remover Docker", id: "desinstalar-docker" },
      { title: "Remover pip", id: "desinstalar-pip" },
      { title: "Remover Homebrew", id: "desinstalar-homebrew" },
    ],
  },
  {
    title: "Comandos CLI",
    id: "forge-standalone",
    icon: Terminal,
    items: [
      { title: "Comando commit", id: "forge-commit" },
      { title: "Comando grupos", id: "forge-grupos" },
      { title: "Comando preview", id: "forge-preview" },
      { title: "Validar token", id: "forge-validar-token" },
      { title: "Histórico", id: "forge-historico" },
      { title: "Comando lote", id: "forge-lote" },
      { title: "Desinstalar", id: "forge-desinstalar" },
      { title: "Servidor", id: "forge-servidor" },
      { title: "Atualizar CLI", id: "forge-atualizar" },
    ],
  },
  {
    title: "Modos de Commit",
    id: "modos-commit",
    icon: GitBranch,
    items: [
      { title: "Modo Projeto", id: "modo-projeto" },
      { title: "Modo Arquivo", id: "modo-arquivo" },
      { title: "Modos de Data", id: "modos-data" },
    ],
  },
  {
    title: "Configuração",
    id: "configuracao",
    icon: Settings,
    items: [
      { title: "Token do GitHub", id: "config-token" },
      { title: "Variáveis de Ambiente", id: "config-env-vars" },
      { title: ".env file", id: "config-env-file" },
    ],
  },
  {
    title: "API REST",
    id: "api-rest",
    icon: Server,
    items: [
      { title: "POST /api/start-job", id: "api-start-job" },
      { title: "GET /api/job-status/:id", id: "api-job-status" },
      { title: "POST /api/cancel-job/:id", id: "api-cancel-job" },
      { title: "GET /api/jobs", id: "api-jobs" },
      { title: "GET /api/preview", id: "api-preview" },
      { title: "POST /api/validate-token", id: "api-validate-token" },
    ],
  },
  {
    title: "Interface Web",
    id: "interface-web",
    icon: Globe,
    items: [
      { title: "Iniciar servidor", id: "web-iniciar" },
      { title: "Usando a interface", id: "web-usando" },
      { title: "Opções avançadas", id: "web-avancado" },
    ],
  },
  {
    title: "Docker",
    id: "docker",
    icon: Package,
    items: [
      { title: "Pull e execução", id: "docker-pull" },
      { title: "docker-compose", id: "docker-compose" },
      { title: "Variáveis de ambiente", id: "docker-env" },
    ],
  },
  {
    title: "Exemplos Práticos",
    id: "exemplos",
    icon: Code,
    items: [
      { title: "Site de portfólio", id: "exemplos-portfolio" },
      { title: "Repositório legado", id: "exemplos-legado" },
      { title: "Preenchimento de grade", id: "exemplos-grade" },
    ],
  },
  {
    title: "Solução de Problemas",
    id: "troubleshooting",
    icon: Shield,
    items: [
      { title: "Token inválido", id: "trouble-token" },
      { title: "Push rejeitado", id: "trouble-push" },
      { title: "Repositório vazio", id: "trouble-repo-vazio" },
      { title: "Rate limit", id: "trouble-rate-limit" },
      { title: "Commits não no gráfico", id: "trouble-grafico" },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helper: CodeBlock
// ---------------------------------------------------------------------------
function CodeBlock({
  code,
  id,
  lang = "bash",
  copiedStates,
  onCopy,
}: {
  code: string
  id: string
  lang?: string
  copiedStates: Record<string, boolean>
  onCopy: (text: string, key: string) => void
}) {
  const isCopied = copiedStates[id]
  return (
    <div className="relative my-4 rounded border border-gray-700 bg-black">
      {/* lang badge */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-1">
        <span className="text-xs text-gray-500 font-mono">{lang}</span>
        <button
          onClick={() => onCopy(code, id)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {isCopied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono text-green-400 leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helper: DocTable
// ---------------------------------------------------------------------------
function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm font-mono">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border border-gray-700 bg-gray-950 px-3 py-2 text-left text-gray-300 font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-gray-900" : "bg-black"}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border border-gray-700 px-3 py-2 text-gray-300 align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helper: SectionHeading
// ---------------------------------------------------------------------------
function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-4 text-2xl font-bold text-white font-mono border-b border-gray-700 pb-3">
      {children}
    </h1>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 text-lg font-semibold text-white font-mono">
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-6 text-base font-semibold text-gray-200 font-mono">
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-gray-400 leading-relaxed text-sm">{children}</p>
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="mb-4 ml-4 space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
          <ChevronRight size={14} className="mt-0.5 shrink-0 text-gray-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-900 text-green-300 border-green-700",
    blue: "bg-blue-900 text-blue-300 border-blue-700",
    yellow: "bg-yellow-900 text-yellow-300 border-yellow-700",
    red: "bg-red-900 text-red-300 border-red-700",
    gray: "bg-gray-800 text-gray-300 border-gray-600",
  }
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-xs font-mono ${colors[color] ?? colors.gray}`}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main content renderer
// ---------------------------------------------------------------------------
function renderContent(
  activeSection: string,
  copiedStates: Record<string, boolean>,
  onCopy: (text: string, key: string) => void,
) {
  // ── Início Rápido ──────────────────────────────────────────────────────────
  if (activeSection === "inicio-instalacao") {
    return (
      <div>
        <H1>Instalação — Visão Geral</H1>
        <P>
          O CommitForge pode ser instalado de diversas formas. Escolha o método
          que melhor se adapta ao seu ambiente.
        </P>
        <DocTable
          headers={["Método", "Comando", "Recomendado para"]}
          rows={[
            ["curl", "curl -fsSL .../install.sh | bash", "macOS / Linux rápido"],
            ["Homebrew", "brew install commitforge", "macOS"],
            ["apt / dnf / AUR", "sudo apt install commitforge", "Linux"],
            ["pip", "pip install commitforge", "Python universal"],
            ["Docker", "docker pull ghcr.io/estevam5s/commitforge:latest", "CI/CD"],
          ]}
        />
      </div>
    )
  }

  if (activeSection === "inicio-prereqs") {
    return (
      <div>
        <H1>Pré-requisitos</H1>
        <P>Antes de instalar o CommitForge, verifique os requisitos mínimos do sistema.</P>
        <H2>Software necessário</H2>
        <UL items={[
          "Python 3.8 ou superior",
          "git 2.30 ou superior",
          "pip (gerenciador de pacotes Python)",
          "Acesso à internet para clonar repositórios",
          "Token de acesso pessoal (PAT) do GitHub com escopo repo",
        ]} />
        <H2>Verificar versões</H2>
        <CodeBlock
          id="prereqs-check"
          lang="bash"
          code={`python --version   # Python 3.8.x ou superior
git --version      # git 2.30.x ou superior
pip --version      # pip 21.x ou superior`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Pacotes Python instalados automaticamente</H2>
        <DocTable
          headers={["Pacote", "Versão mínima", "Finalidade"]}
          rows={[
            ["click", "8.0", "Interface CLI"],
            ["gitpython", "3.1", "Operações Git locais"],
            ["rich", "12.0", "Output colorido no terminal"],
            ["requests", "2.28", "Chamadas à API do GitHub"],
            ["flask", "2.3", "Servidor web local"],
            ["python-dotenv", "1.0", "Carregar arquivo .env"],
          ]}
        />
      </div>
    )
  }

  if (activeSection === "inicio-primeiro-commit") {
    return (
      <div>
        <H1>Primeiro Commit</H1>
        <P>
          Execute seu primeiro commit retroativo em menos de 2 minutos seguindo
          este guia rápido.
        </P>
        <H2>Passo 1 — Instalar</H2>
        <CodeBlock
          id="primeiro-install"
          lang="bash"
          code="curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install.sh | bash"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Passo 2 — Ativar o comando no terminal</H2>
        <CodeBlock
          id="primeiro-source"
          lang="bash"
          code={`source ~/.zshrc    # zsh (padrão macOS)
# ou
source ~/.bashrc   # bash (Linux)

# Confirmar que funciona:
commitforge --version
# forge, version 1.0.0`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Passo 3 — Definir token do GitHub</H2>
        <CodeBlock
          id="primeiro-token"
          lang="bash"
          code={`export GITHUB_TOKEN=ghp_seu_token_aqui

# Ou salvar permanentemente:
echo 'export GITHUB_TOKEN=ghp_seu_token_aqui' >> ~/.zshrc`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Passo 4a — Modo interativo (recomendado para iniciantes)</H2>
        <CodeBlock
          id="primeiro-interativo"
          lang="bash"
          code="commitforge commit --interativo"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Passo 4b — Commit direto por linha de comando</H2>
        <CodeBlock
          id="primeiro-commit"
          lang="bash"
          code={`commitforge commit \\
  --repo https://github.com/seu-usuario/seu-repo.git \\
  --year 2020 \\
  --modo projeto \\
  --token ghp_seu_token_aqui`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Passo 5 — Verificar resultado</H2>
        <P>
          Acesse{" "}
          <span className="text-green-400 font-mono">
            github.com/seu-usuario/seu-repo/commits/historico-2020
          </span>{" "}
          para ver os commits criados. Eles aparecerão no gráfico de contribuições do ano correspondente.
        </P>
      </div>
    )
  }

  // ── Instalação ─────────────────────────────────────────────────────────────
  if (activeSection === "instalacao-curl") {
    return (
      <div>
        <H1>Instalação via curl</H1>
        <P>O método mais rápido para instalar o CommitForge no macOS ou Linux.</P>
        <H2>Script de instalação automática</H2>
        <CodeBlock
          id="curl-install"
          lang="bash"
          code="curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/install.sh | bash"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <P>O script de instalação irá:</P>
        <UL items={[
          "Verificar Python 3.8+ e git",
          "Criar ambiente virtual em ~/.commitforge/venv",
          "Instalar dependências (click, gitpython, rich, requests)",
          "Criar os wrappers ~/.local/bin/commitforge e ~/.local/bin/forge",
          "Adicionar ~/.local/bin ao PATH do seu shell",
        ]} />
        <H2>Após instalação — recarregar o shell</H2>
        <CodeBlock
          id="curl-reload"
          lang="bash"
          code={`# Execute UMA VEZ após instalar para ativar o comando:
source ~/.zshrc    # se usar zsh
source ~/.bashrc   # se usar bash`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Verificar instalação</H2>
        <CodeBlock
          id="curl-verify"
          lang="bash"
          code={`commitforge --version
# forge, version 1.0.0

# Alias curto também funciona:
forge --version`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Se aparecer "command not found"</H2>
        <CodeBlock
          id="curl-path-fix"
          lang="bash"
          code={`# Adicionar ao PATH manualmente (sessão atual):
export PATH="$HOME/.local/bin:$PATH"

# Testar novamente:
commitforge --version`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "instalacao-docker") {
    return (
      <div>
        <H1>Instalação via Docker</H1>
        <P>Sem dependências locais. Ideal para CI/CD.</P>
        <H2>Pull da imagem</H2>
        <CodeBlock
          id="docker-pull-img"
          lang="bash"
          code="docker pull ghcr.io/estevam5s/commitforge:latest"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Executar commit</H2>
        <CodeBlock
          id="docker-run"
          lang="bash"
          code={`docker run --rm \\
  -e GITHUB_TOKEN=ghp_seu_token \\
  ghcr.io/estevam5s/commitforge:latest \\
  commitforge commit \\
    --repo https://github.com/user/repo.git \\
    --year 2020 \\
    --modo projeto`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>docker-compose.yml</H2>
        <CodeBlock
          id="docker-compose-yml"
          lang="yaml"
          code={`version: '3.8'
services:
  commitforge:
    image: ghcr.io/estevam5s/commitforge:latest
    environment:
      - GITHUB_TOKEN=\${GITHUB_TOKEN}
    command: >
      commitforge commit
        --repo https://github.com/user/repo.git
        --year 2020`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "instalacao-macos") {
    return (
      <div>
        <H1>Instalação no macOS</H1>
        <H2>Via Homebrew (recomendado)</H2>
        <CodeBlock
          id="macos-brew"
          lang="bash"
          code={`brew tap estevam5s/commitforge\nbrew install commitforge`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Via curl (recomendado)</H2>
        <CodeBlock
          id="macos-curl"
          lang="bash"
          code={`curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install.sh | bash

# Recarregar shell
source ~/.zshrc  # ou source ~/.bashrc

# Verificar
commitforge --version`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Pré-requisitos</H2>
        <UL items={[
          "macOS 12+ (Monterey ou superior)",
          "Python 3.8+ (brew install python@3.12)",
          "git 2.30+",
        ]} />
      </div>
    )
  }

  if (activeSection === "instalacao-linux") {
    return (
      <div>
        <H1>Instalação no Linux</H1>
        <H2>Debian / Ubuntu</H2>
        <CodeBlock
          id="linux-apt"
          lang="bash"
          code={`curl -fsSL https://apt.commitforge.dev/gpg | sudo apt-key add -
echo "deb https://apt.commitforge.dev stable main" | \\
  sudo tee /etc/apt/sources.list.d/commitforge.list
sudo apt update && sudo apt install commitforge`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Fedora / RHEL</H2>
        <CodeBlock
          id="linux-dnf"
          lang="bash"
          code="sudo dnf install commitforge"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Arch Linux (AUR)</H2>
        <CodeBlock
          id="linux-aur"
          lang="bash"
          code={`yay -S commitforge\n# ou\nparu -S commitforge`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Via curl (universal Linux)</H2>
        <CodeBlock
          id="linux-pip"
          lang="bash"
          code={`curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install.sh | bash
source ~/.bashrc
commitforge --version`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "instalacao-pip") {
    return (
      <div>
        <H1>Instalação via curl (método recomendado)</H1>
        <P>
          O CommitForge é instalado via <code className="text-green-400">curl</code> e
          fica disponível globalmente como o comando <code className="text-green-400">commitforge</code> ou{" "}
          <code className="text-green-400">forge</code> no terminal.
        </P>
        <H2>macOS / Linux</H2>
        <CodeBlock
          id="pip-global"
          lang="bash"
          code={`curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install.sh | bash

# Recarregar o shell (necessário uma vez)
source ~/.zshrc    # zsh
# ou
source ~/.bashrc   # bash

# Verificar instalação
commitforge --version
# forge, version 1.0.0`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Windows (PowerShell)</H2>
        <CodeBlock
          id="pip-windows"
          lang="powershell"
          code={`irm https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install-windows.ps1 | iex

# Reinicie o PowerShell e verifique:
commitforge --version`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Docker (sem dependências locais)</H2>
        <CodeBlock
          id="pip-docker"
          lang="bash"
          code={`docker run --rm \\
  -e GITHUB_TOKEN=ghp_seu_token \\
  ghcr.io/estevam5s/commitforge:latest \\
  commitforge commit --repo URL --year 2020`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Após instalação — PATH não reconhecido?</H2>
        <P>Se o terminal exibir <code className="text-red-400">command not found: commitforge</code>, execute:</P>
        <CodeBlock
          id="pip-path-fix"
          lang="bash"
          code={`# Adicionar ao PATH manualmente (temporário)
export PATH="$HOME/.local/bin:$PATH"

# Para tornar permanente, adicione ao seu shell:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc  # ou ~/.bashrc
source ~/.zshrc`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  // ── Desinstalação ──────────────────────────────────────────────────────────
  if (activeSection === "desinstalacao" || activeSection === "desinstalar-overview") {
    return (
      <div>
        <H1>Desinstalação</H1>
        <P>
          Escolha o método de remoção correspondente ao método de instalação utilizado.
          Seus repositórios Git e histórico de commits <strong className="text-white">não serão afetados</strong>.
        </P>
        <DocTable
          headers={["Método de instalação", "Comando de remoção"]}
          rows={[
            ["curl install.sh", "rm -rf ~/.commitforge && rm -f ~/.local/bin/commitforge ~/.local/bin/forge"],
            ["Docker", "docker rmi ghcr.io/estevam5s/commitforge:latest"],
            ["pip", "pip uninstall commitforge"],
            ["Homebrew", "brew uninstall commitforge"],
            ["commitforge desinstalar", "commitforge desinstalar -y"],
          ]}
        />
        <H2>Via CLI (recomendado)</H2>
        <P>O CommitForge possui um comando nativo de desinstalação com remoção completa:</P>
        <CodeBlock
          id="uninstall-cli"
          lang="bash"
          code="commitforge desinstalar -y"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "desinstalar-curl") {
    return (
      <div>
        <H1>Remover instalação via curl</H1>
        <P>Remove todos os arquivos instalados pelo script <code className="text-green-400">install.sh</code>.</P>
        <H2>Remoção manual completa</H2>
        <CodeBlock
          id="uninstall-curl"
          lang="bash"
          code={`# 1. Remover diretório principal
rm -rf ~/.commitforge

# 2. Remover binários wrapper
rm -f ~/.local/bin/commitforge
rm -f ~/.local/bin/forge

# 3. Limpar PATH do shell (remova a linha abaixo do .bashrc ou .zshrc)
# export PATH="$HOME/.local/bin:$PATH"   ← remover esta linha

# 4. Recarregar o shell
source ~/.bashrc  # ou source ~/.zshrc`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Remoção via CLI (mais fácil)</H2>
        <CodeBlock
          id="uninstall-curl-cli"
          lang="bash"
          code="commitforge desinstalar -y"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "desinstalar-docker") {
    return (
      <div>
        <H1>Remover imagem Docker</H1>
        <P>Remove a imagem do CommitForge do Docker local.</P>
        <H2>Remover imagem</H2>
        <CodeBlock
          id="uninstall-docker"
          lang="bash"
          code={`docker rmi ghcr.io/estevam5s/commitforge:latest

# Verificar se foi removida
docker images | grep commitforge`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Remover containers parados e imagens não utilizadas</H2>
        <CodeBlock
          id="uninstall-docker-prune"
          lang="bash"
          code={`docker container prune -f
docker image prune -f`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "desinstalar-pip") {
    return (
      <div>
        <H1>Remover instalação via pip</H1>
        <CodeBlock
          id="uninstall-pip"
          lang="bash"
          code={`pip uninstall commitforge -y

# Limpar cache do pip
pip cache purge

# Verificar remoção
pip show commitforge  # deve retornar erro`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Remover ambiente virtual (se criado)</H2>
        <CodeBlock
          id="uninstall-pip-venv"
          lang="bash"
          code="rm -rf venv/"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "desinstalar-homebrew") {
    return (
      <div>
        <H1>Remover via Homebrew</H1>
        <CodeBlock
          id="uninstall-brew"
          lang="bash"
          code={`brew uninstall commitforge

# Limpar arquivos residuais
brew cleanup

# Verificar remoção
brew list | grep commitforge  # deve estar vazio`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  // ── Comandos CLI ─────────────────────────────────────────────────────────
  if (activeSection === "forge-commit") {
    return (
      <div>
        <H1>Comando: commit</H1>
        <P>Cria commits retroativos em um repositório Git.</P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="cmd-syntax"
          lang="bash"
          code={`commitforge commit [OPÇÕES]
# ou usando o alias curto:
forge commit [OPÇÕES]`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="cmd-examples"
          lang="bash"
          code={`# Modo interativo — recomendado para o primeiro uso
commitforge commit --interativo

# Ano completo, modo projeto (agrupa por tipo de arquivo)
commitforge commit \\
  --repo https://github.com/user/repo.git \\
  --year 2019 \\
  --modo projeto \\
  --token ghp_xxx

# Intervalo de datas, modo arquivo (um commit por arquivo por dia)
commitforge commit \\
  --repo https://github.com/user/repo.git \\
  --start-date 2020-01-01 \\
  --end-date 2020-12-31 \\
  --modo arquivo \\
  --commits-por-dia 2

# Últimos 90 dias, sem enviar ao GitHub
commitforge commit \\
  --repo URL \\
  --dias 90 \\
  --sem-push

# Com horários aleatórios e sem fins de semana
commitforge commit \\
  --repo URL \\
  --year 2021 \\
  --aleatorio \\
  --pular-fins-de-semana`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções</H2>
        <DocTable
          headers={["Flag", "Tipo", "Padrão", "Descrição"]}
          rows={[
            ["--repo, -r", "string", "—", "URL HTTPS ou SSH do repositório"],
            ["--year, -y", "int", "—", "Ano completo (2010–2025)"],
            ["--start-date", "YYYY-MM-DD", "—", "Data de início do período"],
            ["--end-date", "YYYY-MM-DD", "—", "Data de fim do período"],
            ["--dias, -d", "int", "30", "Últimos N dias a partir de hoje"],
            ["--modo, -M", "projeto|arquivo", "projeto", "Modo de criação de commits"],
            ["--branch", "string", "historico-{year}", "Nome do branch a criar"],
            ["--token, -t", "string", "$GITHUB_TOKEN", "Token de acesso pessoal"],
            ["--usuario", "string", "—", "Nome do autor dos commits"],
            ["--email", "string", "—", "E-mail do autor dos commits"],
            ["--commits-por-dia", "int", "1", "Commits por dia (modo arquivo)"],
            ["--mensagem, -m", "string", "Commit retroativo: {date}", "Template de mensagem"],
            ["--arquivo, -f", "string", "data.txt", "Arquivo de log (modo arquivo)"],
            ["--aleatorio", "flag", "false", "Horários aleatórios realistas"],
            ["--pular-fins-de-semana", "flag", "false", "Pular sábado e domingo"],
            ["--sem-push", "flag", "false", "Não enviar ao repositório remoto"],
            ["--interativo", "flag", "false", "Modo interativo com prompts"],
          ]}
        />
      </div>
    )
  }

  if (activeSection === "forge-grupos") {
    return (
      <div>
        <H1>Comando: grupos</H1>
        <P>
          Exibe uma prévia dos grupos semânticos que seriam criados no modo
          projeto, sem realizar nenhuma operação no repositório.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="grupos-syntax"
          lang="bash"
          code="commitforge grupos --repo URL [--token TOKEN]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Exemplo de saída</H2>
        <CodeBlock
          id="grupos-output"
          lang="bash"
          code={`  [configuração]      3 arquivos → chore: configuração e dependências
  [estilos]           2 arquivos → feat: estilos globais e design system
  [assets]            5 arquivos → feat: recursos e assets estáticos
  [página-principal]  1 arquivo  → feat: página principal e landing page
  [outros]            2 arquivos → chore: demais arquivos
  Total: 5 commits serão criados no modo projeto.`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "forge-preview") {
    return (
      <div>
        <H1>Comando: preview</H1>
        <P>
          Gera uma prévia de todos os commits que seriam criados com as opções
          fornecidas, sem realizar nenhuma escrita no Git.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="preview-syntax"
          lang="bash"
          code="commitforge preview [OPÇÕES]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Exemplo</H2>
        <CodeBlock
          id="preview-example"
          lang="bash"
          code={`commitforge preview \\
  --year 2021 \\
  --modo projeto \\
  --pular-fins-de-semana`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "forge-validar-token") {
    return (
      <div>
        <H1>Comando: validar-token</H1>
        <P>
          Verifica se um token do GitHub é válido e exibe informações básicas da
          conta associada.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="vtoken-syntax"
          lang="bash"
          code="commitforge validar-token --token ghp_xxx"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Saída esperada</H2>
        <CodeBlock
          id="vtoken-output"
          lang="bash"
          code={`  Token válido!
  Login:  seu-usuario
  Nome:   Seu Nome Completo
  Plano:  free`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "forge-historico") {
    return (
      <div>
        <H1>Comando: histórico</H1>
        <P>Lista os jobs executados anteriormente com seus status e detalhes.</P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="hist-syntax"
          lang="bash"
          code="commitforge historico [--limite N]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Exemplo de saída</H2>
        <CodeBlock
          id="hist-output"
          lang="bash"
          code={`  ID       DATA                 REPO                     STATUS    COMMITS
  abc123   2026-03-10 14:22:01  user/portfolio           sucesso   4
  def456   2026-03-09 09:10:55  user/legacy-app          sucesso   17
  ghi789   2026-03-08 21:05:00  user/blog                erro      0`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "forge-lote") {
    return (
      <div>
        <H1>Comando: lote</H1>
        <P>
          Processa múltiplos repositórios de uma vez a partir de um arquivo JSON.
          Ideal para preencher o histórico de vários projetos de forma automatizada.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="lote-syntax"
          lang="bash"
          code="commitforge lote --arquivo repos.json [--token TOKEN] [--sem-push] [--continuar-em-erro]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Formato do arquivo JSON</H2>
        <CodeBlock
          id="lote-json"
          lang="json"
          code={`{
  "token": "ghp_seu_token_global",
  "repositorios": [
    {
      "repo": "https://github.com/user/projeto-a.git",
      "year": 2020,
      "modo": "projeto"
    },
    {
      "repo": "https://github.com/user/projeto-b.git",
      "start_date": "2021-01-01",
      "end_date": "2021-12-31",
      "modo": "arquivo",
      "commits_por_dia": 3
    },
    {
      "repo": "https://github.com/user/projeto-c.git",
      "year": 2022,
      "branch": "historico-2022",
      "modo": "projeto",
      "skip_weekends": true
    }
  ]
}`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="lote-examples"
          lang="bash"
          code={`# Processar arquivo
commitforge lote --arquivo repos.json

# Com token inline
commitforge lote -f repos.json --token ghp_xxx

# Sem push (só cria commits locais)
commitforge lote -f repos.json --sem-push

# Continuar mesmo se um repositório falhar
commitforge lote -f repos.json --continuar-em-erro

# Ver exemplo de JSON
commitforge lote --exemplo`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Campos disponíveis por repositório</H2>
        <DocTable
          headers={["Campo", "Tipo", "Descrição"]}
          rows={[
            ["repo", "string (obrigatório)", "URL do repositório Git"],
            ["year", "int", "Ano para preencher (ex: 2020)"],
            ["start_date", "string", "Data inicial YYYY-MM-DD"],
            ["end_date", "string", "Data final YYYY-MM-DD"],
            ["modo", "string", "projeto ou arquivo (padrão: projeto)"],
            ["commits_por_dia", "int", "Commits por dia (padrão: 1)"],
            ["branch", "string", "Nome do branch (padrão: historico-YYYY)"],
            ["skip_weekends", "bool", "Pular fins de semana"],
            ["token", "string", "Token individual (sobrescreve o global)"],
          ]}
        />
      </div>
    )
  }

  if (activeSection === "forge-desinstalar") {
    return (
      <div>
        <H1>Comando: desinstalar</H1>
        <P>
          Remove o CommitForge completamente do sistema, incluindo diretórios,
          binários wrapper e entradas do PATH.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="desinstalar-syntax"
          lang="bash"
          code="commitforge desinstalar [--confirmar]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="desinstalar-examples"
          lang="bash"
          code={`# Com confirmação interativa
commitforge desinstalar

# Sem confirmação (automático)
commitforge desinstalar -y
commitforge desinstalar --confirmar`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>O que é removido</H2>
        <UL items={[
          "~/.commitforge/ — diretório principal com venv",
          "~/.local/bin/commitforge — binário wrapper",
          "~/.local/bin/forge — alias",
          "Entradas do PATH no .bashrc, .zshrc e .profile",
        ]} />
        <P>
          Seus repositórios Git e histórico de commits <strong className="text-white">não são afetados</strong>.
        </P>
      </div>
    )
  }

  if (activeSection === "forge-servidor") {
    return (
      <div>
        <H1>Comando: servidor</H1>
        <P>
          Inicia o servidor Flask com a interface web, a API REST e a Linha do
          Tempo AVT. Detecta automaticamente conflito de porta e sobe na próxima
          disponível.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="srv-syntax"
          lang="bash"
          code="commitforge servidor [--porta PORTA] [--host HOST] [--debug] [--abrir] [--sem-avt]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Flags</H2>
        <DocTable
          headers={["Flag", "Atalho", "Padrão", "Descrição"]}
          rows={[
            ["--porta",   "-p", "5000",    "Porta TCP (auto-incrementa se ocupada)"],
            ["--host",    "-H", "0.0.0.0", "Interface de escuta (0.0.0.0 = toda a rede)"],
            ["--debug",   "-D", "false",   "Ativar modo debug do Flask com live-reload"],
            ["--abrir",   "-o", "false",   "Abrir o navegador automaticamente após iniciar"],
            ["--sem-avt", "—",  "false",   "Ocultar banner da AVT ao iniciar"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="srv-examples"
          lang="bash"
          code={`# Porta padrão 5000
commitforge servidor

# Porta customizada com abertura automática do browser
commitforge servidor --porta 3333 --abrir

# Modo debug (live-reload ao salvar arquivos)
commitforge servidor --porta 8080 --debug

# Acessível na rede local, sem banner da AVT
commitforge servidor --host 0.0.0.0 --porta 5001 --sem-avt`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Rotas disponíveis</H2>
        <DocTable
          headers={["Rota", "Método", "Descrição"]}
          rows={[
            ["/",              "GET", "Interface principal (formulário de commit)"],
            ["/timeline",      "GET", "Linha do Tempo AVT — commits como Sacred Timeline"],
            ["/api/jobs",      "GET", "Listar jobs de commits em execução/histórico"],
            ["/api/preview",   "POST","Prévia dos grupos de commits antes de executar"],
            ["/api/health",    "GET", "Status do servidor (JSON)"],
            ["/api/timeline",  "GET", "Dados da linha do tempo (JSON)"],
            ["/api/avt/alert", "GET", "Alerta aleatório da AVT (JSON)"],
          ]}
        />
        <P>
          Após iniciar, acesse{" "}
          <span className="text-green-400 font-mono">http://localhost:5000</span>{" "}
          (ou a porta configurada) no navegador. A Linha do Tempo AVT está em{" "}
          <span className="text-green-400 font-mono">/timeline</span>.
        </P>
        <div className="mt-3 rounded border border-yellow-800 bg-yellow-950/50 p-4 text-sm text-yellow-300">
          <strong>macOS:</strong> a porta 5000 pode estar ocupada pelo AirPlay Receiver.
          Use <code className="font-mono text-yellow-200">--porta 5001</code> ou deixe o
          CommitForge detectar automaticamente a próxima porta livre.
        </div>
      </div>
    )
  }

  if (activeSection === "forge-atualizar") {
    return (
      <div>
        <H1>Comando: atualizar</H1>
        <P>
          Atualiza o CommitForge instalado localmente para a versão mais recente
          sem precisar desinstalar e reinstalar. Faz download do código-fonte
          diretamente do GitHub e substitui os arquivos locais com backup automático.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="upd-syntax"
          lang="bash"
          code="commitforge atualizar [--branch BRANCH] [--pre] [--dry-run]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Flags</H2>
        <DocTable
          headers={["Flag", "Padrão", "Descrição"]}
          rows={[
            ["--branch BRANCH", "main",  "Branch do GitHub de onde baixar (ex: dev, v4)"],
            ["--pre",           "false", "Incluir versões pré-release / release candidates"],
            ["--dry-run",       "false", "Simular a atualização sem alterar nenhum arquivo"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="upd-examples"
          lang="bash"
          code={`# Atualizar para a versão estável mais recente
commitforge atualizar

# Ver se há atualização disponível (sem alterar arquivos)
commitforge atualizar --dry-run

# Baixar da branch de desenvolvimento
commitforge atualizar --branch dev

# Incluir versões pré-release
commitforge atualizar --pre`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>O que acontece durante a atualização</H2>
        <UL items={[
          "Baixa forge.py do GitHub (branch configurada)",
          "Compara a versão remota com a instalada localmente",
          "Se a versão remota for mais nova, cria backup em ~/.commitforge/forge.py.bak.{versão}",
          "Substitui forge.py e requirements.txt com os arquivos mais recentes",
          "Também sincroniza app.py, templates/ e static/ (servidor Flask)",
          "Se a versão já for atual, avisa e não faz nada",
        ]} />
        <H2>Localização dos arquivos</H2>
        <CodeBlock
          id="upd-paths"
          lang="bash"
          code={`~/.commitforge/forge.py          # CLI principal (atualizado)
~/.commitforge/app.py           # Servidor Flask (atualizado)
~/.commitforge/templates/       # Templates HTML (atualizados)
~/.commitforge/static/          # Arquivos estáticos (atualizados)
~/.commitforge/forge.py.bak.X.Y.Z  # Backup da versão anterior`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <div className="mt-4 rounded border border-blue-800 bg-blue-950/50 p-4 text-sm text-blue-300">
          <strong>Dica:</strong> Use <code className="text-blue-200 font-mono">--dry-run</code> antes de atualizar para ver o que vai mudar sem risco.
        </div>
        <div className="mt-3 rounded border border-yellow-800 bg-yellow-950/50 p-4 text-sm text-yellow-300">
          <strong>Requer:</strong> conexão com a internet e acesso ao GitHub (raw.githubusercontent.com).
        </div>
      </div>
    )
  }

  // ── Modos de Commit ────────────────────────────────────────────────────────
  if (activeSection === "modo-projeto") {
    return (
      <div>
        <H1>Modo Projeto</H1>
        <P>
          O modo projeto commita os arquivos reais do repositório agrupados
          semanticamente.
        </P>
        <H2>Como funciona</H2>
        <UL items={[
          "Clona o repositório em diretório temporário",
          "Lista todos os arquivos rastreados (git ls-files)",
          "Agrupa em 17 categorias semânticas",
          "Cria um commit por grupo com data retroativa",
          "Usa branch órfão para histórico limpo",
          "Push com --force para o remoto",
        ]} />
        <H2>Grupos semânticos (17)</H2>
        <DocTable
          headers={["Grupo", "Padrões", "Mensagem de commit"]}
          rows={[
            ["configuração", "package.json, tsconfig.json, .gitignore...", "chore: configuração e dependências"],
            ["assets", "public/*, static/*, assets/*", "feat: recursos e assets estáticos"],
            ["estilos", "*.css, *.scss, styles/*", "feat: estilos globais e design system"],
            ["layout", "app/layout*, layouts/*", "feat: layout base e estrutura"],
            ["utilitários", "lib/*, utils/*, hooks/*", "feat: utilitários, hooks e funções"],
            ["componentes-base", "components/ui/button*, input*...", "feat: componentes UI base"],
            ["componentes-nav", "navigation*, menu*, tabs*...", "feat: componentes de navegação"],
            ["componentes-overlay", "dialog*, drawer*, tooltip*...", "feat: componentes de overlay"],
            ["componentes-dados", "table*, card*, chart*...", "feat: componentes de dados"],
            ["página-principal", "app/page*, index.html", "feat: página principal"],
            ["páginas", "app/**/page*, pages/*", "feat: páginas da aplicação"],
            ["backend", "app.py, server.py, api/*", "feat: backend e API"],
            ["CLI", "bin/commitforge, bin/forge", "feat: interface CLI"],
            ["templates", "templates/*, *.html", "feat: templates e interface web"],
            ["testes", "test_*, tests/*, *.spec.*", "test: testes automatizados"],
            ["readme", "README*, *.md", "docs: documentação"],
            ["outros", "(restantes)", "chore: demais arquivos"],
          ]}
        />
        <H2>Exemplo de uso</H2>
        <CodeBlock
          id="modo-proj-example"
          lang="bash"
          code={`commitforge commit \\
  --repo https://github.com/user/meu-projeto.git \\
  --year 2019 \\
  --modo projeto \\
  --token ghp_xxx`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Prévia dos grupos</H2>
        <CodeBlock
          id="modo-proj-preview"
          lang="bash"
          code={`commitforge grupos \\
  --repo https://github.com/user/meu-projeto.git`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "modo-arquivo") {
    return (
      <div>
        <H1>Modo Arquivo</H1>
        <P>
          No modo arquivo, o CommitForge cria um arquivo de log (<span className="text-green-400 font-mono">data.txt</span>) e
          registra um commit por dia no intervalo especificado.
        </P>
        <H2>Características</H2>
        <UL items={[
          "Cria ou atualiza um arquivo data.txt com a data do commit",
          "Permite múltiplos commits por dia via --commits-por-dia",
          "Não requer arquivos pré-existentes no repositório",
          "Ideal para preencher a grade de contribuições",
        ]} />
        <H2>Exemplo</H2>
        <CodeBlock
          id="modo-arq-example"
          lang="bash"
          code={`commitforge commit \\
  --repo https://github.com/user/repo.git \\
  --start-date 2021-01-01 \\
  --end-date 2021-12-31 \\
  --modo arquivo \\
  --commits-por-dia 3 \\
  --aleatorio`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "modos-data") {
    return (
      <div>
        <H1>Modos de Data</H1>
        <P>O CommitForge oferece três formas de definir o período temporal dos commits.</P>
        <H2>Por ano</H2>
        <P>Cria commits distribuídos ao longo do ano inteiro.</P>
        <CodeBlock
          id="data-ano"
          lang="bash"
          code={`commitforge commit --repo URL --year 2020`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Por intervalo de datas</H2>
        <P>Define um período exato com data de início e fim.</P>
        <CodeBlock
          id="data-intervalo"
          lang="bash"
          code={`commitforge commit \\
  --repo URL \\
  --start-date 2021-03-15 \\
  --end-date 2021-09-30`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Últimos N dias</H2>
        <P>Calcula automaticamente o período a partir de hoje retroagindo N dias.</P>
        <CodeBlock
          id="data-dias"
          lang="bash"
          code={`commitforge commit --repo URL --dias 60`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  // ── Configuração ───────────────────────────────────────────────────────────
  if (activeSection === "config-token") {
    return (
      <div>
        <H1>Token do GitHub</H1>
        <P>
          O CommitForge precisa de um token de acesso pessoal (PAT) para
          autenticar as operações Git e chamadas à API do GitHub.
        </P>
        <H2>Criar um token</H2>
        <UL items={[
          "Acesse github.com/settings/tokens/new",
          "Defina um nome descritivo (ex: commitforge)",
          "Marque o escopo: repo (acesso total a repositórios privados)",
          "Marque também: workflow (se for alterar Actions)",
          "Clique em Generate token e copie o valor gerado",
        ]} />
        <H2>Validar o token</H2>
        <CodeBlock
          id="token-validate"
          lang="bash"
          code="commitforge validar-token --token ghp_seu_token"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <div className="mt-4 rounded border border-yellow-700 bg-yellow-950 p-3 text-sm text-yellow-300">
          <span className="font-semibold">Atenção:</span> nunca compartilhe ou
          comite seu token em repositórios públicos. Use variáveis de ambiente
          ou um arquivo .env.
        </div>
      </div>
    )
  }

  if (activeSection === "config-env-vars") {
    return (
      <div>
        <H1>Variáveis de Ambiente</H1>
        <P>O CommitForge reconhece as seguintes variáveis de ambiente.</P>
        <DocTable
          headers={["Variável", "Obrigatória", "Descrição"]}
          rows={[
            ["GITHUB_TOKEN", "Sim", "Token de acesso pessoal do GitHub"],
            ["COMMITFORGE_REPO", "Não", "URL padrão do repositório"],
            ["COMMITFORGE_MODE", "Não", "Modo padrão (projeto ou arquivo)"],
            ["COMMITFORGE_BRANCH", "Não", "Nome padrão do branch"],
            ["FLASK_PORT", "Não", "Porta do servidor web (padrão: 5000)"],
            ["FLASK_HOST", "Não", "Host do servidor web (padrão: 127.0.0.1)"],
          ]}
        />
        <H2>Definir no shell</H2>
        <CodeBlock
          id="env-shell"
          lang="bash"
          code={`export GITHUB_TOKEN=ghp_xxx
export COMMITFORGE_MODE=projeto`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "config-env-file") {
    return (
      <div>
        <H1>.env file</H1>
        <P>
          Crie um arquivo <span className="text-green-400 font-mono">.env</span> na
          raiz do projeto para definir variáveis de forma persistente.
        </P>
        <H2>Exemplo de .env</H2>
        <CodeBlock
          id="env-file"
          lang="dotenv"
          code={`GITHUB_TOKEN=ghp_seu_token_aqui
COMMITFORGE_REPO=https://github.com/user/repo.git
COMMITFORGE_MODE=projeto
FLASK_PORT=5000`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Adicionar ao .gitignore</H2>
        <CodeBlock
          id="env-gitignore"
          lang="bash"
          code={`echo ".env" >> .gitignore`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <div className="mt-4 rounded border border-red-700 bg-red-950 p-3 text-sm text-red-300">
          <span className="font-semibold">Importante:</span> nunca adicione o
          arquivo .env ao controle de versão. O token de acesso dá permissão
          total de escrita aos seus repositórios.
        </div>
      </div>
    )
  }

  // ── API REST ───────────────────────────────────────────────────────────────
  if (activeSection === "api-rest" || activeSection === "api-start-job") {
    return (
      <div>
        <H1>API REST</H1>
        <P>O servidor Flask expõe uma API REST completa.</P>
        <H2>Iniciar o servidor</H2>
        <CodeBlock
          id="api-start-server"
          lang="bash"
          code={`commitforge servidor --porta 5000\n# ou diretamente:\npython app.py`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>POST /api/start-job</H2>
        <P>Inicia um novo job de commits retroativos.</P>
        <H3>Request body</H3>
        <CodeBlock
          id="api-start-req"
          lang="json"
          code={`{
  "repo_url": "https://github.com/user/repo.git",
  "github_token": "ghp_xxx",
  "year": 2020,
  "commit_mode": "projeto",
  "branch_name": "historico-2020",
  "random_times": true,
  "skip_weekends": false
}`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H3>Response</H3>
        <CodeBlock
          id="api-start-res"
          lang="json"
          code={`{
  "job_id": "abc123",
  "status": "started",
  "message": "Job iniciado com sucesso"
}`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "api-job-status") {
    return (
      <div>
        <H1>GET /api/job-status/:id</H1>
        <P>Retorna o status atual de um job em andamento ou finalizado.</P>
        <H2>Response</H2>
        <CodeBlock
          id="api-status-res"
          lang="json"
          code={`{
  "job_id": "abc123",
  "status": "running",
  "progress": 65,
  "commits_made": 8,
  "total_commits": 13,
  "branch": "historico-2020",
  "elapsed": 12.4
}`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Valores de status</H2>
        <DocTable
          headers={["Status", "Descrição"]}
          rows={[
            ["pending", "Job na fila aguardando execução"],
            ["running", "Job em execução"],
            ["completed", "Concluído com sucesso"],
            ["error", "Falhou — veja o campo message"],
            ["cancelled", "Cancelado pelo usuário"],
          ]}
        />
      </div>
    )
  }

  if (activeSection === "api-cancel-job") {
    return (
      <div>
        <H1>POST /api/cancel-job/:id</H1>
        <P>Cancela um job em andamento. Não reverte commits já realizados.</P>
        <H2>Exemplo de chamada</H2>
        <CodeBlock
          id="cancel-curl"
          lang="bash"
          code={`curl -X POST http://localhost:5000/api/cancel-job/abc123`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Response</H2>
        <CodeBlock
          id="cancel-res"
          lang="json"
          code={`{ "status": "cancelled", "job_id": "abc123" }`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "api-jobs") {
    return (
      <div>
        <H1>GET /api/jobs</H1>
        <P>Lista todos os jobs — ativos e finalizados.</P>
        <H2>Response</H2>
        <CodeBlock
          id="jobs-res"
          lang="json"
          code={`[
  {
    "job_id": "abc123",
    "status": "completed",
    "repo_url": "https://github.com/user/repo.git",
    "started_at": "2026-03-10T14:22:01Z",
    "commits_made": 4
  }
]`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "api-preview") {
    return (
      <div>
        <H1>GET /api/preview</H1>
        <P>Gera uma prévia dos commits sem executar nenhuma operação Git.</P>
        <H2>Query params</H2>
        <DocTable
          headers={["Parâmetro", "Tipo", "Descrição"]}
          rows={[
            ["year", "int", "Ano completo"],
            ["start_date", "YYYY-MM-DD", "Data de início"],
            ["end_date", "YYYY-MM-DD", "Data de fim"],
            ["num_days", "int", "Últimos N dias"],
            ["commits_per_day", "int", "Commits por dia"],
            ["skip_weekends", "bool", "Pular fins de semana"],
          ]}
        />
        <H2>Exemplo</H2>
        <CodeBlock
          id="preview-curl"
          lang="bash"
          code={`curl "http://localhost:5000/api/preview?year=2021&skip_weekends=true"`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "api-validate-token") {
    return (
      <div>
        <H1>POST /api/validate-token</H1>
        <P>Valida um token do GitHub e retorna informações da conta.</P>
        <H2>Request</H2>
        <CodeBlock
          id="vt-req"
          lang="json"
          code={`{ "token": "ghp_xxx" }`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Response</H2>
        <CodeBlock
          id="vt-res"
          lang="json"
          code={`{ "valid": true, "login": "usuario", "name": "Nome Completo" }`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  // ── Interface Web ──────────────────────────────────────────────────────────
  if (activeSection === "web-iniciar") {
    return (
      <div>
        <H1>Iniciar o servidor web</H1>
        <P>
          O CommitForge inclui uma interface web completa para quem prefere não
          usar o terminal.
        </P>
        <H2>Iniciar</H2>
        <CodeBlock
          id="web-start"
          lang="bash"
          code={`commitforge servidor\n# Servidor rodando em http://127.0.0.1:5000`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Porta customizada</H2>
        <CodeBlock
          id="web-port"
          lang="bash"
          code="commitforge servidor --porta 8080"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "web-usando") {
    return (
      <div>
        <H1>Usando a interface web</H1>
        <P>A interface web oferece um formulário visual para configurar e executar jobs.</P>
        <H2>Fluxo básico</H2>
        <UL items={[
          "Abra http://localhost:5000 no navegador",
          "Cole a URL do repositório no campo correspondente",
          "Insira o token do GitHub",
          "Escolha o ano ou intervalo de datas",
          "Selecione o modo (projeto ou arquivo)",
          "Clique em Iniciar e acompanhe o progresso em tempo real",
        ]} />
      </div>
    )
  }

  if (activeSection === "web-avancado") {
    return (
      <div>
        <H1>Opções avançadas da interface</H1>
        <P>A interface web expõe todas as opções avançadas do CLI.</P>
        <H2>Opções disponíveis</H2>
        <DocTable
          headers={["Opção", "Descrição"]}
          rows={[
            ["Horários aleatórios", "Distribui commits em horários realistas do dia"],
            ["Pular fins de semana", "Não cria commits em sábados e domingos"],
            ["Commits por dia", "Quantidade de commits diários (modo arquivo)"],
            ["Nome do branch", "Customizar o branch de destino"],
            ["Sem push", "Criar commits localmente sem enviar ao GitHub"],
            ["Cancelar job", "Interromper execução a qualquer momento"],
          ]}
        />
      </div>
    )
  }

  // ── Docker ─────────────────────────────────────────────────────────────────
  if (activeSection === "docker-pull") {
    return (
      <div>
        <H1>Docker — Pull e execução</H1>
        <P>Use a imagem oficial do CommitForge sem instalar nenhuma dependência local.</P>
        <H2>Pull da imagem</H2>
        <CodeBlock
          id="dpull"
          lang="bash"
          code="docker pull ghcr.io/estevam5s/commitforge:latest"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Executar um commit</H2>
        <CodeBlock
          id="drun"
          lang="bash"
          code={`docker run --rm \\
  -e GITHUB_TOKEN=ghp_seu_token \\
  ghcr.io/estevam5s/commitforge:latest \\
  commitforge commit \\
    --repo https://github.com/user/repo.git \\
    --year 2020 \\
    --modo projeto`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Iniciar servidor web via Docker</H2>
        <CodeBlock
          id="drun-server"
          lang="bash"
          code={`docker run --rm -p 5000:5000 \\
  -e GITHUB_TOKEN=ghp_seu_token \\
  ghcr.io/estevam5s/commitforge:latest \\
  commitforge servidor --host 0.0.0.0`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "docker-compose") {
    return (
      <div>
        <H1>docker-compose</H1>
        <P>Use o docker-compose para execuções recorrentes e ambientes CI/CD.</P>
        <H2>docker-compose.yml</H2>
        <CodeBlock
          id="dcompose-file"
          lang="yaml"
          code={`version: '3.8'
services:
  commitforge:
    image: ghcr.io/estevam5s/commitforge:latest
    environment:
      - GITHUB_TOKEN=\${GITHUB_TOKEN}
    command: >
      commitforge commit
        --repo https://github.com/user/repo.git
        --year 2020`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Executar</H2>
        <CodeBlock
          id="dcompose-run"
          lang="bash"
          code="GITHUB_TOKEN=ghp_xxx docker-compose up"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "docker-env") {
    return (
      <div>
        <H1>Docker — Variáveis de ambiente</H1>
        <P>Passe variáveis de ambiente para o container via -e ou --env-file.</P>
        <H2>Via --env-file</H2>
        <CodeBlock
          id="docker-envfile"
          lang="bash"
          code={`docker run --rm --env-file .env \\
  ghcr.io/estevam5s/commitforge:latest \\
  commitforge commit --repo URL --year 2020`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Variáveis suportadas</H2>
        <DocTable
          headers={["Variável", "Descrição"]}
          rows={[
            ["GITHUB_TOKEN", "Token de acesso pessoal (obrigatório)"],
            ["COMMITFORGE_REPO", "URL padrão do repositório"],
            ["FLASK_PORT", "Porta do servidor (padrão: 5000)"],
            ["FLASK_HOST", "Host do servidor (padrão: 0.0.0.0 no Docker)"],
          ]}
        />
      </div>
    )
  }

  // ── Exemplos Práticos ──────────────────────────────────────────────────────
  if (activeSection === "exemplos-portfolio") {
    return (
      <div>
        <H1>Exemplo: Site de Portfólio</H1>
        <P>
          Commita um site de portfólio com datas de desenvolvimento realistas.
        </P>
        <H2>Cenário</H2>
        <P>
          Você criou um site de portfólio em 2019 mas não tinha o GitHub. Agora
          quer registrar o histórico.
        </P>
        <H2>Passo 1: Verificar os grupos</H2>
        <CodeBlock
          id="port-grupos"
          lang="bash"
          code={`commitforge grupos \\
  --repo https://github.com/user/portfolio.git`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <P>Saída esperada:</P>
        <CodeBlock
          id="port-grupos-out"
          lang="bash"
          code={`  [configuração]     3 arquivos → chore: configuração e dependências
  [estilos]          2 arquivos → feat: estilos globais e design system
  [assets]           5 arquivos → feat: recursos e assets estáticos
  [página-principal] 1 arquivo  → feat: página principal e landing page
  Total: 4 commits serão criados no modo projeto.`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Passo 2: Criar commits com datas de 2019</H2>
        <CodeBlock
          id="port-commit"
          lang="bash"
          code={`commitforge commit \\
  --repo https://github.com/user/portfolio.git \\
  --year 2019 \\
  --modo projeto \\
  --aleatorio \\
  --token ghp_seutoken`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Passo 3: Verificar no GitHub</H2>
        <P>
          Acesse{" "}
          <span className="font-mono text-green-400">
            github.com/user/portfolio/commits/historico-2019
          </span>
        </P>
      </div>
    )
  }

  if (activeSection === "exemplos-legado") {
    return (
      <div>
        <H1>Exemplo: Repositório Legado</H1>
        <P>
          Registre o histórico de um projeto antigo que foi desenvolvido sem
          controle de versão.
        </P>
        <H2>Cenário</H2>
        <P>
          Um sistema legado desenvolvido entre 2015 e 2018 que agora será
          migrado para o GitHub.
        </P>
        <H2>Estratégia recomendada</H2>
        <UL items={[
          "Use --modo projeto para preservar os arquivos reais",
          "Crie um branch por ano (historico-2015, historico-2016, ...)",
          "Use --pular-fins-de-semana para simular jornada de trabalho",
          "Use --aleatorio para horários realistas",
        ]} />
        <H2>Executar para cada ano</H2>
        <CodeBlock
          id="legado-loop"
          lang="bash"
          code={`for year in 2015 2016 2017 2018; do
  commitforge commit \\
    --repo https://github.com/user/legado.git \\
    --year $year \\
    --modo projeto \\
    --pular-fins-de-semana \\
    --aleatorio
done`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "exemplos-grade") {
    return (
      <div>
        <H1>Exemplo: Preenchimento de Grade</H1>
        <P>
          Preencha a grade de contribuições do GitHub com commits diários
          usando o modo arquivo.
        </P>
        <H2>Grade completa de um ano</H2>
        <CodeBlock
          id="grade-full"
          lang="bash"
          code={`commitforge commit \\
  --repo https://github.com/user/contributions.git \\
  --year 2023 \\
  --modo arquivo \\
  --commits-por-dia 4 \\
  --aleatorio`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Apenas dias úteis</H2>
        <CodeBlock
          id="grade-weekdays"
          lang="bash"
          code={`commitforge commit \\
  --repo https://github.com/user/contributions.git \\
  --start-date 2023-01-01 \\
  --end-date 2023-12-31 \\
  --modo arquivo \\
  --pular-fins-de-semana \\
  --commits-por-dia 2`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  // ── Solução de Problemas ───────────────────────────────────────────────────
  if (
    activeSection === "troubleshooting" ||
    activeSection === "trouble-token"
  ) {
    return (
      <div>
        <H1>Solução de Problemas</H1>
        <H2>Token inválido</H2>
        <div className="mb-4 rounded border border-red-800 bg-red-950 p-3 font-mono text-sm text-red-300">
          Erro: Token inválido ou expirado.
        </div>
        <P>Solução:</P>
        <UL items={[
          "Acesse github.com/settings/tokens/new",
          "Crie token com escopo: repo, workflow",
          "Use: commitforge validar-token --token ghp_xxx",
        ]} />
        <H2>Push rejeitado</H2>
        <div className="mb-4 rounded border border-red-800 bg-red-950 p-3 font-mono text-sm text-red-300">
          Erro: Push falhou: remote rejected
        </div>
        <CodeBlock
          id="trouble-push-fix"
          lang="bash"
          code={`# O CommitForge usa --force automaticamente.
# Se ainda falhar, verifique as permissões do token.
commitforge validar-token --token ghp_xxx`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Repositório vazio</H2>
        <div className="mb-4 rounded border border-red-800 bg-red-950 p-3 font-mono text-sm text-red-300">
          Erro: Nenhum arquivo encontrado no repositório
        </div>
        <P>O modo projeto requer arquivos rastreados.</P>
        <CodeBlock
          id="trouble-repo-fix"
          lang="bash"
          code={`# Adicione arquivos ao repositório primeiro:
git add .
git commit -m "initial commit"
git push
# Depois use o CommitForge`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Rate limit da API GitHub</H2>
        <div className="mb-4 rounded border border-red-800 bg-red-950 p-3 font-mono text-sm text-red-300">
          Erro: 403 API rate limit exceeded
        </div>
        <P>
          Use um token de acesso pessoal (PAT) para aumentar o limite de
          requisições de 60 para 5.000 por hora.
        </P>
        <H2>Ambiente gerenciado (macOS)</H2>
        <div className="mb-4 rounded border border-red-800 bg-red-950 p-3 font-mono text-sm text-red-300">
          Erro: externally-managed-environment
        </div>
        <CodeBlock
          id="trouble-venv-fix"
          lang="bash"
          code={`# Use um ambiente virtual:
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "trouble-push") {
    return (
      <div>
        <H1>Push rejeitado</H1>
        <div className="mb-4 rounded border border-red-800 bg-red-950 p-3 font-mono text-sm text-red-300">
          Erro: Push falhou: remote rejected
        </div>
        <P>Causas comuns e soluções:</P>
        <H2>1. Token sem permissão de escrita</H2>
        <CodeBlock
          id="push-check-token"
          lang="bash"
          code="commitforge validar-token --token ghp_xxx"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>2. Branch protegido</H2>
        <P>
          Use um nome de branch diferente via{" "}
          <span className="text-green-400 font-mono">--branch</span> para não
          conflitar com branches protegidos.
        </P>
        <H2>3. Repositório com branch padrão diferente</H2>
        <CodeBlock
          id="push-branch"
          lang="bash"
          code={`commitforge commit \\
  --repo URL --year 2020 \\
  --branch historico-customizado`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "trouble-repo-vazio") {
    return (
      <div>
        <H1>Repositório vazio</H1>
        <div className="mb-4 rounded border border-red-800 bg-red-950 p-3 font-mono text-sm text-red-300">
          Erro: Nenhum arquivo encontrado no repositório
        </div>
        <P>
          O modo projeto lista os arquivos rastreados com{" "}
          <span className="text-green-400 font-mono">git ls-files</span>. Se o
          repositório não tiver commits, o comando falhará.
        </P>
        <H2>Solução</H2>
        <CodeBlock
          id="repo-vazio-fix"
          lang="bash"
          code={`git add .
git commit -m "initial commit"
git push origin main
# Agora execute o CommitForge`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Alternativa: modo arquivo</H2>
        <P>
          O modo arquivo não requer arquivos pré-existentes. Use-o para
          repositórios vazios.
        </P>
        <CodeBlock
          id="repo-vazio-arquivo"
          lang="bash"
          code={`commitforge commit \\
  --repo URL --year 2020 \\
  --modo arquivo`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "trouble-rate-limit") {
    return (
      <div>
        <H1>Rate Limit da API GitHub</H1>
        <div className="mb-4 rounded border border-red-800 bg-red-950 p-3 font-mono text-sm text-red-300">
          Erro: 403 API rate limit exceeded
        </div>
        <H2>Limites da API</H2>
        <DocTable
          headers={["Tipo de acesso", "Limite por hora"]}
          rows={[
            ["Sem autenticação", "60 requisições"],
            ["Com token PAT", "5.000 requisições"],
            ["GitHub Actions", "1.000 requisições"],
          ]}
        />
        <H2>Solução</H2>
        <P>Sempre use um token de acesso pessoal ao executar o CommitForge.</P>
        <CodeBlock
          id="rate-token"
          lang="bash"
          code={`export GITHUB_TOKEN=ghp_xxx
commitforge commit --repo URL --year 2020`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "trouble-grafico") {
    return (
      <div>
        <H1>Commits não aparecem no gráfico de contribuições</H1>
        <P>
          Para que commits retroativos apareçam no gráfico de atividade do GitHub
          (contribution graph), <strong className="text-white">todos os critérios abaixo</strong> devem ser atendidos:
        </P>
        <DocTable
          headers={["Requisito", "Como garantir"]}
          rows={[
            ["E-mail do autor = e-mail verificado no GitHub", "Use --email com o e-mail cadastrado em github.com/settings/emails"],
            ["Branch existente no repositório remoto", "O CommitForge faz push automático com --force"],
            ["Repositório não é fork", "Commits em forks não contam no gráfico principal"],
            ["Commit no branch padrão ou qualquer branch", "GitHub conta commits de todos os branches desde 2020"],
            ["Data do commit dentro do período consultado", "No perfil, selecione o ano correto no seletor de anos"],
          ]}
        />
        <H2>Verificar e-mail da conta GitHub</H2>
        <CodeBlock
          id="grafico-email-api"
          lang="bash"
          code={`# Ver e-mails verificados da conta
curl -H "Authorization: token ghp_xxx" \\
  https://api.github.com/user/emails

# O CommitForge detecta isso automaticamente quando --token é fornecido`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Forçar e-mail correto nos commits</H2>
        <CodeBlock
          id="grafico-email-fix"
          lang="bash"
          code={`commitforge commit \\
  --repo https://github.com/user/repo.git \\
  --year 2020 \\
  --token ghp_xxx \\
  --email seu@email.com \\
  --username "Seu Nome"`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Ver commits em anos anteriores no GitHub</H2>
        <UL items={[
          "Acesse seu perfil: github.com/SEU_USUARIO",
          "Na seção 'Contribution Activity', role para baixo",
          "Clique no ano desejado (ex: 2020) no seletor acima do gráfico",
          "Os commits retroativos aparecerão no gráfico daquele ano",
        ]} />
        <H2>Verificar se commits foram contabilizados</H2>
        <CodeBlock
          id="grafico-verify"
          lang="bash"
          code={`# Listar commits do branch com datas
git log --format="%ad %an <%ae> — %s" --date=short

# Confirmar e-mail configurado no repo
git config user.email`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <div className="mt-4 rounded border border-yellow-800 bg-yellow-950/50 p-4 text-sm text-yellow-300">
          <strong>Importante:</strong> GitHub pode levar alguns minutos para atualizar o gráfico após o push. Se após 10 minutos os commits não aparecerem, verifique se o e-mail do autor bate com um e-mail verificado na conta.
        </div>
      </div>
    )
  }

  // ── Fallback / Welcome ─────────────────────────────────────────────────────
  return (
    <div>
      <H1>Documentação do CommitForge</H1>
      <P>
        Bem-vindo à documentação oficial do{" "}
        <span className="text-white font-semibold">CommitForge</span> — a
        ferramenta CLI para criar commits retroativos no GitHub de forma
        semântica e realista.
      </P>
      <H2>O que é o CommitForge?</H2>
      <P>
        O CommitForge permite registrar o histórico real de desenvolvimento de
        projetos antigos diretamente no GitHub, usando datas retroativas e
        agrupamento semântico de arquivos.
      </P>
      <H2>Principais recursos</H2>
      <DocTable
        headers={["Recurso", "Descrição"]}
        rows={[
          ["Modo Projeto", "Agrupa arquivos em 17 categorias semânticas"],
          ["Modo Arquivo", "Cria commits de log diários para preencher a grade"],
          ["API REST", "Controle total via HTTP para integrações CI/CD"],
          ["Interface Web", "GUI no navegador sem precisar do terminal"],
          ["Docker", "Imagem pronta sem dependências locais"],
          ["commitforge", "CLI instalada globalmente via curl/pip"],
        ]}
      />
      <H2>Início rápido</H2>
      <CodeBlock
        id="welcome-quick"
        lang="bash"
        code={`curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/install.sh | bash
export GITHUB_TOKEN=ghp_seu_token
commitforge commit --repo https://github.com/user/repo.git --year 2020 --modo projeto`}
        copiedStates={copiedStates}
        onCopy={onCopy}
      />
      <P>
        Use a barra lateral para navegar pela documentação completa.
      </P>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar — defined OUTSIDE DocsPage so React never remounts it on re-render,
// preserving the sidebar's scroll position when the user navigates sections.
// ---------------------------------------------------------------------------
interface SidebarContentProps {
  activeSection: string
  onNavClick: (id: string) => void
}

function SidebarContent({ activeSection, onNavClick }: SidebarContentProps) {
  return (
    <nav className="h-full overflow-y-auto py-4">
      {/* Logo */}
      <div className="mb-4 px-4">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-white" />
          <span className="font-mono text-sm font-bold text-white">
            CommitForge Docs
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-gray-500">v3.0.0</p>
      </div>

      {/* Link para Guia Git */}
      <div className="mb-4 px-4">
        <a
          href="/git"
          className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-green-400 transition-colors border border-gray-800 rounded px-2 py-1.5 hover:border-green-800"
        >
          <GitBranch size={12} />
          Guia Completo de Git →
        </a>
      </div>

      {sidebarSections.map((section) => {
        const Icon = section.icon
        return (
          <div key={section.id} className="mb-2">
            {/* Section header */}
            <button
              onClick={() => onNavClick(section.id)}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeSection === section.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon size={13} />
              {section.title}
            </button>

            {/* Sub-items */}
            <div className="ml-2">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavClick(item.id)}
                  className={`flex w-full items-center gap-1 border-l py-1.5 pl-4 pr-3 text-left font-mono text-xs transition-colors ${
                    activeSection === item.id
                      ? "border-white bg-gray-900 text-white"
                      : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                  }`}
                >
                  <ChevronRight
                    size={10}
                    className={activeSection === item.id ? "text-white" : "text-gray-700"}
                  />
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("welcome")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch {
      // ignore clipboard errors
    }
  }

  const handleNavClick = (id: string) => {
    setActiveSection(id)
    setSidebarOpen(false)
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black font-mono text-white">
      {/* ── Navbar ── */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-12 items-center justify-between border-b border-gray-800 bg-black px-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center rounded p-1 text-gray-400 hover:text-white md:hidden"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-white" />
            <span className="font-mono text-sm font-bold text-white">
              CommitForge
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="hidden font-mono text-xs text-gray-500 hover:text-white transition-colors md:block">
            Home
          </a>
          <a href="/git" className="hidden font-mono text-xs text-gray-400 hover:text-green-400 transition-colors md:block">
            Guia Git
          </a>
          <a
            href="https://github.com/estevam5s/commitforge"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-gray-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/70 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-12 z-20 h-[calc(100vh-3rem)] w-64 border-r border-gray-800 bg-black transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <SidebarContent activeSection={activeSection} onNavClick={handleNavClick} />
      </aside>

      {/* ── Main content ── */}
      <main className="min-h-screen pt-12 md:ml-64">
        <div className="mx-auto max-w-3xl px-6 py-10">
          {renderContent(activeSection, copiedStates, copyToClipboard)}
        </div>
      </main>
    </div>
  )
}
