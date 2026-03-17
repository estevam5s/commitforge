"use client"

import { useState, useRef } from "react"
import {
  Copy,
  Check,
  Menu,
  X,
  ChevronRight,
  Terminal,
  Zap,
  Settings,
  Code,
  Download,
  Package,
  GitBranch,
  Clock,
  Users,
  Tag,
  RotateCcw,
  BookOpen,
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
// Sidebar sections definition
// ---------------------------------------------------------------------------
const sidebarSections: SidebarSection[] = [
  {
    title: "Fundamentos",
    id: "fundamentos",
    icon: GitBranch,
    items: [
      { title: "O que é Git", id: "fund-o-que-e-git" },
      { title: "Instalação", id: "fund-instalacao" },
      { title: "Configuração inicial", id: "fund-config-inicial" },
      { title: "Conceitos básicos", id: "fund-conceitos" },
    ],
  },
  {
    title: "Repositório",
    id: "repositorio",
    icon: Package,
    items: [
      { title: "git init", id: "repo-init" },
      { title: "git clone", id: "repo-clone" },
      { title: "git remote", id: "repo-remote" },
      { title: "git fetch / pull", id: "repo-fetch-pull" },
    ],
  },
  {
    title: "Stage & Commit",
    id: "stage-commit",
    icon: Check,
    items: [
      { title: "git status", id: "sc-status" },
      { title: "git add", id: "sc-add" },
      { title: "git commit", id: "sc-commit" },
      { title: "git diff", id: "sc-diff" },
      { title: "git log", id: "sc-log" },
    ],
  },
  {
    title: "Branches",
    id: "branches",
    icon: GitBranch,
    items: [
      { title: "git branch", id: "br-branch" },
      { title: "git checkout / switch", id: "br-checkout" },
      { title: "git merge", id: "br-merge" },
      { title: "git rebase", id: "br-rebase" },
      { title: "git cherry-pick", id: "br-cherry-pick" },
    ],
  },
  {
    title: "Desfazendo Alterações",
    id: "desfazendo",
    icon: RotateCcw,
    items: [
      { title: "git reset", id: "des-reset" },
      { title: "git revert", id: "des-revert" },
      { title: "git restore", id: "des-restore" },
      { title: "git stash", id: "des-stash" },
    ],
  },
  {
    title: "Colaboração",
    id: "colaboracao",
    icon: Users,
    items: [
      { title: "git push", id: "col-push" },
      { title: "git pull", id: "col-pull" },
      { title: "git fetch", id: "col-fetch" },
      { title: "Resolução de conflitos", id: "col-conflitos" },
    ],
  },
  {
    title: "Tags & Versões",
    id: "tags-versoes",
    icon: Tag,
    items: [
      { title: "git tag", id: "tag-tag" },
      { title: "Versionamento semântico", id: "tag-semver" },
      { title: "git describe", id: "tag-describe" },
    ],
  },
  {
    title: "Histórico Avançado",
    id: "historico-avancado",
    icon: Clock,
    items: [
      { title: "git log avançado", id: "hist-log" },
      { title: "git blame", id: "hist-blame" },
      { title: "git bisect", id: "hist-bisect" },
      { title: "git reflog", id: "hist-reflog" },
    ],
  },
  {
    title: "Configuração Avançada",
    id: "config-avancada",
    icon: Settings,
    items: [
      { title: ".gitignore", id: "cfg-gitignore" },
      { title: "git config global", id: "cfg-config-global" },
      { title: "Hooks", id: "cfg-hooks" },
      { title: "git alias", id: "cfg-alias" },
    ],
  },
  {
    title: "Fluxos de Trabalho",
    id: "fluxos",
    icon: Zap,
    items: [
      { title: "Git Flow", id: "flx-gitflow" },
      { title: "GitHub Flow", id: "flx-githubflow" },
      { title: "Trunk-based Development", id: "flx-trunk" },
      { title: "Squash commits", id: "flx-squash" },
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
// Heading helpers
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

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded border border-green-800 bg-green-950 p-3 text-sm text-green-300">
      <span className="font-semibold">Dica: </span>
      {children}
    </div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded border border-yellow-700 bg-yellow-950 p-3 text-sm text-yellow-300">
      <span className="font-semibold">Atenção: </span>
      {children}
    </div>
  )
}

function Danger({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded border border-red-700 bg-red-950 p-3 text-sm text-red-300">
      <span className="font-semibold">Cuidado: </span>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SidebarContent — defined OUTSIDE the main component to prevent remounting
// on state changes, preserving sidebar scroll position
// ---------------------------------------------------------------------------
interface SidebarProps {
  sections: SidebarSection[]
  activeSection: string
  onNavClick: (id: string) => void
}

function SidebarContent({ sections, activeSection, onNavClick }: SidebarProps) {
  const navRef = useRef<HTMLElement>(null)
  return (
    <nav ref={navRef} className="h-full overflow-y-auto py-4">
      {/* Logo */}
      <div className="mb-6 px-4">
        <div className="flex items-center gap-2">
          <GitBranch size={18} className="text-white" />
          <span className="font-mono text-sm font-bold text-white">
            Guia Git
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-gray-500">Referência completa</p>
      </div>

      {/* Welcome link */}
      <div className="mb-2 px-4">
        <button
          onClick={() => onNavClick("welcome")}
          className={`flex w-full items-center gap-2 rounded py-1.5 text-left font-mono text-xs transition-colors ${
            activeSection === "welcome"
              ? "text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <BookOpen size={13} />
          Visão geral
        </button>
      </div>

      {sections.map((section) => {
        const Icon = section.icon
        return (
          <div key={section.id} className="mb-2">
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
// Content renderer
// ---------------------------------------------------------------------------
function renderContent(
  activeSection: string,
  copiedStates: Record<string, boolean>,
  onCopy: (text: string, key: string) => void,
) {
  // ── WELCOME ──────────────────────────────────────────────────────────────
  if (activeSection === "welcome") {
    return (
      <div>
        <H1>Guia Git — Referência Completa</H1>
        <P>
          Bem-vindo ao guia de referência Git do{" "}
          <span className="text-white font-semibold">CommitForge</span>. Aqui
          você encontra desde conceitos básicos até fluxos de trabalho avançados,
          com exemplos práticos para cada comando.
        </P>
        <H2>Seções disponíveis</H2>
        <DocTable
          headers={["Seção", "Tópicos", "Nível"]}
          rows={[
            ["Fundamentos", "O que é Git, instalação, configuração, conceitos", "Iniciante"],
            ["Repositório", "init, clone, remote, fetch/pull", "Iniciante"],
            ["Stage & Commit", "status, add, commit, diff, log", "Iniciante"],
            ["Branches", "branch, checkout, merge, rebase, cherry-pick", "Intermediário"],
            ["Desfazendo Alterações", "reset, revert, restore, stash", "Intermediário"],
            ["Colaboração", "push, pull, fetch, conflitos", "Intermediário"],
            ["Tags & Versões", "tag, semver, describe", "Intermediário"],
            ["Histórico Avançado", "log avançado, blame, bisect, reflog", "Avançado"],
            ["Configuração Avançada", ".gitignore, config, hooks, alias", "Avançado"],
            ["Fluxos de Trabalho", "Git Flow, GitHub Flow, Trunk-based, Squash", "Avançado"],
          ]}
        />
        <H2>Início rápido</H2>
        <CodeBlock
          id="welcome-quickstart"
          lang="bash"
          code={`# 1. Configurar identidade
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# 2. Criar repositório
git init meu-projeto
cd meu-projeto

# 3. Primeiro commit
echo "# Meu Projeto" > README.md
git add README.md
git commit -m "feat: initial commit"

# 4. Conectar ao remoto e fazer push
git remote add origin https://github.com/usuario/repo.git
git push -u origin main`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <P>Use a barra lateral para navegar por cada seção.</P>
      </div>
    )
  }

  // ── FUNDAMENTOS ──────────────────────────────────────────────────────────
  if (activeSection === "fund-o-que-e-git" || activeSection === "fundamentos") {
    return (
      <div>
        <H1>O que é Git</H1>
        <P>
          Git é um sistema de controle de versão distribuído, criado por Linus
          Torvalds em 2005. Ele rastreia mudanças em arquivos ao longo do tempo,
          permite colaboração entre múltiplos desenvolvedores e facilita a
          recuperação de versões anteriores.
        </P>
        <H2>Por que usar Git?</H2>
        <UL
          items={[
            "Histórico completo de todas as alterações no projeto",
            "Trabalho paralelo em branches independentes",
            "Colaboração sem sobrescrita acidental de código",
            "Reversão simples de bugs introduzidos em qualquer commit",
            "Distribuído: cada desenvolvedor tem uma cópia completa",
          ]}
        />
        <H2>Modelos de VCS</H2>
        <DocTable
          headers={["Tipo", "Exemplo", "Característica"]}
          rows={[
            ["Local", "RCS", "Apenas na máquina local"],
            ["Centralizado", "SVN, CVS", "Servidor central único"],
            ["Distribuído", "Git, Mercurial", "Cada clone é um repositório completo"],
          ]}
        />
        <H2>Três estados do Git</H2>
        <DocTable
          headers={["Estado", "Descrição", "Área"]}
          rows={[
            ["Modified", "Arquivo alterado mas não preparado", "Working directory"],
            ["Staged", "Arquivo marcado para o próximo commit", "Staging area (index)"],
            ["Committed", "Dados armazenados no repositório", ".git directory"],
          ]}
        />
      </div>
    )
  }

  if (activeSection === "fund-instalacao") {
    return (
      <div>
        <H1>Instalação do Git</H1>
        <P>O Git está disponível para todos os sistemas operacionais principais.</P>
        <H2>macOS</H2>
        <CodeBlock
          id="install-macos"
          lang="bash"
          code={`# Via Homebrew (recomendado)
brew install git

# Via Xcode Command Line Tools
xcode-select --install

# Verificar versão
git --version`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Linux (Debian/Ubuntu)</H2>
        <CodeBlock
          id="install-linux-deb"
          lang="bash"
          code={`sudo apt update
sudo apt install git

# Fedora / RHEL
sudo dnf install git

# Arch Linux
sudo pacman -S git`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Windows</H2>
        <CodeBlock
          id="install-windows"
          lang="bash"
          code={`# Via winget
winget install --id Git.Git -e --source winget

# Via Chocolatey
choco install git

# Ou baixe o instalador em: https://git-scm.com/download/win`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Verificar instalação</H2>
        <CodeBlock
          id="install-verify"
          lang="bash"
          code={`git --version
# git version 2.43.0

which git
# /usr/bin/git`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "fund-config-inicial") {
    return (
      <div>
        <H1>Configuração inicial</H1>
        <P>
          Antes de usar o Git, configure sua identidade. Essas informações são
          registradas em cada commit que você criar.
        </P>
        <H2>Identidade obrigatória</H2>
        <CodeBlock
          id="config-identity"
          lang="bash"
          code={`git config --global user.name "Seu Nome Completo"
git config --global user.email "seu@email.com"`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Editor padrão</H2>
        <CodeBlock
          id="config-editor"
          lang="bash"
          code={`# VS Code
git config --global core.editor "code --wait"

# Vim
git config --global core.editor vim

# Nano
git config --global core.editor nano`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Branch padrão</H2>
        <CodeBlock
          id="config-branch"
          lang="bash"
          code={`# Definir 'main' como branch padrão (recomendado)
git config --global init.defaultBranch main`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Verificar configurações</H2>
        <CodeBlock
          id="config-list"
          lang="bash"
          code={`git config --list
git config --global --list
git config user.name`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Níveis de configuração</H2>
        <DocTable
          headers={["Nível", "Flag", "Arquivo", "Escopo"]}
          rows={[
            ["Sistema", "--system", "/etc/gitconfig", "Todos os usuários"],
            ["Global", "--global", "~/.gitconfig", "Usuário atual"],
            ["Local", "--local", ".git/config", "Repositório atual"],
          ]}
        />
      </div>
    )
  }

  if (activeSection === "fund-conceitos") {
    return (
      <div>
        <H1>Conceitos básicos</H1>
        <H2>Repositório (repo)</H2>
        <P>
          Um repositório Git é um diretório que contém todos os arquivos do
          projeto e o histórico completo de alterações. O histórico fica
          armazenado no diretório oculto <span className="text-green-400 font-mono">.git/</span>.
        </P>
        <H2>Commit</H2>
        <P>
          Um commit é um snapshot do estado dos arquivos em um momento específico.
          Cada commit tem um hash SHA-1 único (ex:{" "}
          <span className="text-green-400 font-mono">a1b2c3d</span>), mensagem,
          autor, data e referência ao commit pai.
        </P>
        <H2>Branch</H2>
        <P>
          Um branch é um ponteiro leve para um commit específico. O branch padrão
          costuma se chamar <span className="text-green-400 font-mono">main</span>{" "}
          ou <span className="text-green-400 font-mono">master</span>.
        </P>
        <H2>HEAD</H2>
        <P>
          HEAD é um ponteiro especial que indica o commit atual (ou branch atual)
          em que você está trabalhando.
        </P>
        <H2>Glossário rápido</H2>
        <DocTable
          headers={["Termo", "Descrição"]}
          rows={[
            ["Working tree", "Diretório de trabalho com os arquivos atuais"],
            ["Index / Stage", "Área de preparação entre o trabalho e o commit"],
            ["Origin", "Nome convencional do repositório remoto principal"],
            ["Upstream", "Branch remoto que o branch local rastreia"],
            ["Merge", "Combinar históricos de dois branches"],
            ["Rebase", "Reaplicar commits sobre uma base diferente"],
            ["Tag", "Referência imutável a um commit específico (ex: v1.0.0)"],
            ["Stash", "Área temporária para guardar alterações sem commitar"],
          ]}
        />
      </div>
    )
  }

  // ── REPOSITÓRIO ──────────────────────────────────────────────────────────
  if (activeSection === "repositorio" || activeSection === "repo-init") {
    return (
      <div>
        <H1>git init</H1>
        <P>
          Inicializa um novo repositório Git em um diretório, criando a pasta
          <span className="text-green-400 font-mono"> .git/</span> com toda a
          estrutura necessária.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="init-syntax"
          lang="bash"
          code="git init [<diretório>] [--bare] [-b <branch>]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções principais</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["--bare", "Cria um repositório sem working tree (para servidores)"],
            ["-b <nome>", "Define o nome do branch inicial (ex: -b main)"],
            ["--template=<dir>", "Usa um diretório de templates customizado"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="init-examples"
          lang="bash"
          code={`# Inicializar no diretório atual
git init

# Inicializar em novo diretório
git init meu-projeto

# Definir branch inicial como 'main'
git init -b main

# Criar repositório bare (servidor)
git init --bare /srv/repos/meu-repo.git`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Após <span className="font-mono">git init</span>, configure o remoto com{" "}
          <span className="font-mono">git remote add origin URL</span> para conectar
          ao GitHub/GitLab.
        </Tip>
      </div>
    )
  }

  if (activeSection === "repo-clone") {
    return (
      <div>
        <H1>git clone</H1>
        <P>
          Clona um repositório existente para o diretório local, copiando todo o
          histórico de commits, branches e tags.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="clone-syntax"
          lang="bash"
          code="git clone <url> [<diretório>] [opções]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções principais</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["--depth <n>", "Clone superficial com apenas os últimos n commits"],
            ["--branch <nome>", "Clona um branch ou tag específico"],
            ["--single-branch", "Clona apenas o branch especificado"],
            ["--recurse-submodules", "Inicializa submódulos automaticamente"],
            ["--mirror", "Clone completo incluindo todas as referências remotas"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="clone-examples"
          lang="bash"
          code={`# Clone básico via HTTPS
git clone https://github.com/usuario/repo.git

# Clone via SSH
git clone git@github.com:usuario/repo.git

# Clone em diretório customizado
git clone https://github.com/usuario/repo.git meu-nome

# Clone superficial (apenas últimos 10 commits)
git clone --depth 10 https://github.com/usuario/repo.git

# Clone de branch específico
git clone --branch develop https://github.com/usuario/repo.git`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Use <span className="font-mono">--depth 1</span> para clonar apenas o
          commit mais recente — ideal em CI/CD para acelerar builds.
        </Tip>
      </div>
    )
  }

  if (activeSection === "repo-remote") {
    return (
      <div>
        <H1>git remote</H1>
        <P>
          Gerencia as conexões com repositórios remotos. Um remote é um alias
          para uma URL de repositório.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="remote-syntax"
          lang="bash"
          code={`git remote [-v]
git remote add <nome> <url>
git remote remove <nome>
git remote rename <antigo> <novo>
git remote set-url <nome> <nova-url>`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Subcomandos</H2>
        <DocTable
          headers={["Subcomando", "Descrição"]}
          rows={[
            ["git remote -v", "Lista os remotes com URLs (fetch e push)"],
            ["git remote add origin URL", "Adiciona um remote chamado origin"],
            ["git remote remove origin", "Remove o remote origin"],
            ["git remote rename old new", "Renomeia um remote"],
            ["git remote set-url origin URL", "Atualiza a URL de um remote"],
            ["git remote show origin", "Detalhes do remote: branches rastreados"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="remote-examples"
          lang="bash"
          code={`# Adicionar remoto
git remote add origin https://github.com/usuario/repo.git

# Listar remotos
git remote -v
# origin  https://github.com/usuario/repo.git (fetch)
# origin  https://github.com/usuario/repo.git (push)

# Adicionar segundo remoto (ex: upstream de fork)
git remote add upstream https://github.com/original/repo.git

# Trocar de HTTPS para SSH
git remote set-url origin git@github.com:usuario/repo.git

# Ver informações detalhadas
git remote show origin`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "repo-fetch-pull") {
    return (
      <div>
        <H1>git fetch / pull</H1>
        <P>
          Ambos baixam alterações do repositório remoto, mas com comportamentos
          diferentes: <span className="text-green-400 font-mono">fetch</span> apenas
          baixa, enquanto{" "}
          <span className="text-green-400 font-mono">pull</span> baixa e integra.
        </P>
        <H2>git fetch</H2>
        <CodeBlock
          id="fetch-examples"
          lang="bash"
          code={`# Baixar todas as alterações do origin
git fetch origin

# Baixar branch específico
git fetch origin main

# Baixar de todos os remotos
git fetch --all

# Ver o que veio antes de integrar
git log origin/main..HEAD`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>git pull</H2>
        <CodeBlock
          id="pull-examples"
          lang="bash"
          code={`# Pull padrão (fetch + merge)
git pull origin main

# Pull com rebase em vez de merge
git pull --rebase origin main

# Pull que não cria merge commit
git pull --ff-only

# Pull de todos os remotos
git pull --all`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Diferença entre fetch e pull</H2>
        <DocTable
          headers={["Comando", "O que faz", "Altera working tree?"]}
          rows={[
            ["git fetch", "Baixa commits do remoto para referências locais", "Não"],
            ["git pull", "fetch + merge (ou rebase) no branch atual", "Sim"],
          ]}
        />
        <Tip>
          Prefira <span className="font-mono">git fetch</span> seguido de inspeção
          antes de integrar, especialmente em branches compartilhados.
        </Tip>
      </div>
    )
  }

  // ── STAGE & COMMIT ───────────────────────────────────────────────────────
  if (activeSection === "stage-commit" || activeSection === "sc-status") {
    return (
      <div>
        <H1>git status</H1>
        <P>
          Exibe o estado atual do working tree e da staging area — quais arquivos
          foram modificados, quais estão staged e quais não são rastreados.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="status-syntax"
          lang="bash"
          code="git status [--short] [--branch] [--porcelain]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Flags úteis</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["-s / --short", "Saída compacta (ex: M README.md)"],
            ["-b / --branch", "Mostra o branch e rastreamento remoto"],
            ["--porcelain", "Saída estável para scripts"],
            ["-u / --untracked-files", "Controla como arquivos não rastreados são mostrados"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="status-examples"
          lang="bash"
          code={`# Status completo
git status

# Status compacto
git status -s
# M  arquivo-modificado.txt    (staged)
#  M outro-modificado.txt      (não staged)
# ?? novo-arquivo.txt          (não rastreado)

# Com info do branch
git status -sb`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "sc-add") {
    return (
      <div>
        <H1>git add</H1>
        <P>
          Adiciona arquivos ou alterações à staging area (index) para serem
          incluídos no próximo commit.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="add-syntax"
          lang="bash"
          code="git add <arquivo|padrão|diretório>"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["git add .", "Adiciona todos os arquivos do diretório atual"],
            ["git add -A", "Adiciona todas as alterações (incluindo deletados)"],
            ["git add -p", "Modo interativo: adiciona partes de um arquivo (hunks)"],
            ["git add -u", "Apenas arquivos já rastreados (não novos)"],
            ["git add '*.js'", "Glob: todos os .js recursivamente"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="add-examples"
          lang="bash"
          code={`# Adicionar arquivo específico
git add src/index.ts

# Adicionar diretório inteiro
git add src/

# Adicionar tudo
git add .

# Adicionar interativamente (escolher hunks)
git add -p

# Adicionar arquivos por padrão
git add "*.tsx"

# Verificar o que foi staged
git status
git diff --staged`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Use <span className="font-mono">git add -p</span> para revisar cada
          bloco de alteração antes de adicionar ao stage — ótimo para commits
          atômicos e limpos.
        </Tip>
      </div>
    )
  }

  if (activeSection === "sc-commit") {
    return (
      <div>
        <H1>git commit</H1>
        <P>
          Cria um novo commit com as alterações staged, armazenando um snapshot
          permanente no histórico do repositório.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="commit-syntax"
          lang="bash"
          code='git commit [-m "mensagem"] [--amend] [-a] [--allow-empty]'
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções principais</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["-m <msg>", "Mensagem do commit inline"],
            ["-a", "Stage automático de arquivos rastreados (não novos)"],
            ["--amend", "Modifica o último commit (mensagem ou conteúdo)"],
            ["--no-edit", "Amend sem abrir o editor"],
            ["--allow-empty", "Cria commit mesmo sem alterações staged"],
            ["-S", "Assina o commit com GPG"],
            ["--date=<data>", "Define data customizada para o commit"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="commit-examples"
          lang="bash"
          code={`# Commit básico
git commit -m "feat: adicionar autenticação com JWT"

# Stage + commit de arquivos rastreados
git commit -am "fix: corrigir validação do formulário"

# Amend: corrigir mensagem do último commit
git commit --amend -m "feat: adicionar autenticação com JWT e refresh token"

# Amend: adicionar arquivo esquecido ao último commit
git add arquivo-esquecido.ts
git commit --amend --no-edit

# Commit com data retroativa
git commit --date="2023-01-15T10:00:00" -m "feat: implementação inicial"`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Convenção de mensagens (Conventional Commits)</H2>
        <DocTable
          headers={["Tipo", "Uso"]}
          rows={[
            ["feat", "Nova funcionalidade"],
            ["fix", "Correção de bug"],
            ["docs", "Documentação"],
            ["style", "Formatação (sem mudança lógica)"],
            ["refactor", "Refatoração sem feat nem fix"],
            ["test", "Adição ou correção de testes"],
            ["chore", "Tarefas de manutenção, dependências"],
            ["perf", "Melhoria de performance"],
          ]}
        />
        <Warning>
          Nunca use <span className="font-mono">--amend</span> em commits que já
          foram enviados para um repositório remoto compartilhado — isso reescreve
          o histórico e cria conflitos para outros colaboradores.
        </Warning>
      </div>
    )
  }

  if (activeSection === "sc-diff") {
    return (
      <div>
        <H1>git diff</H1>
        <P>
          Exibe as diferenças entre estados do repositório: working tree,
          staging area e commits.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="diff-syntax"
          lang="bash"
          code="git diff [opções] [<commit>] [--] [<caminho>]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Casos de uso comuns</H2>
        <DocTable
          headers={["Comando", "O que compara"]}
          rows={[
            ["git diff", "Working tree vs staging area"],
            ["git diff --staged", "Staging area vs último commit"],
            ["git diff HEAD", "Working tree vs último commit"],
            ["git diff main..feature", "Diferença entre dois branches"],
            ["git diff abc123 def456", "Diferença entre dois commits"],
            ["git diff -- arquivo.ts", "Diff de um arquivo específico"],
            ["git diff --stat", "Resumo: quantas linhas alteradas por arquivo"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="diff-examples"
          lang="bash"
          code={`# Ver alterações não staged
git diff

# Ver alterações staged (prontas para commit)
git diff --staged

# Comparar branches
git diff main..feature/login

# Resumo das mudanças
git diff --stat HEAD~3..HEAD

# Diff com contexto reduzido
git diff -U1

# Diff apenas de nomes de arquivo
git diff --name-only main..feature`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "sc-log") {
    return (
      <div>
        <H1>git log</H1>
        <P>
          Exibe o histórico de commits do repositório. Altamente configurável
          com filtros, formatos e opções de visualização.
        </P>
        <H2>Flags essenciais</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["--oneline", "Uma linha por commit (hash abreviado + mensagem)"],
            ["--graph", "Grafo ASCII de branches e merges"],
            ["--all", "Inclui todos os branches e tags"],
            ["-n <N>", "Limita aos últimos N commits"],
            ["--author=<nome>", "Filtra por autor"],
            ["--since=<data>", "Commits após a data especificada"],
            ["--until=<data>", "Commits antes da data especificada"],
            ["-p", "Exibe o patch (diff) de cada commit"],
            ["--stat", "Estatísticas de arquivos alterados"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="log-examples"
          lang="bash"
          code={`# Log simples
git log --oneline

# Grafo decorado
git log --oneline --graph --all --decorate

# Últimos 5 commits
git log -5

# Commits de um autor
git log --author="Estevam"

# Commits da última semana
git log --since="1 week ago"

# Log com diff de cada commit
git log -p -2

# Commits que alteram um arquivo
git log -- src/auth/login.ts`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Formato customizado</H2>
        <CodeBlock
          id="log-format"
          lang="bash"
          code={`git log --pretty=format:"%h %an %ar %s"
# a1b2c3d Estevam 2 days ago feat: login page

# Aliases úteis
git config --global alias.lg "log --oneline --graph --all --decorate"`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  // ── BRANCHES ─────────────────────────────────────────────────────────────
  if (activeSection === "branches" || activeSection === "br-branch") {
    return (
      <div>
        <H1>git branch</H1>
        <P>
          Gerencia branches locais e remotos. Um branch é apenas um ponteiro
          leve para um commit, tornando criação e exclusão muito rápidas.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="branch-syntax"
          lang="bash"
          code={`git branch               # listar branches locais
git branch <nome>        # criar branch
git branch -d <nome>     # deletar (seguro)
git branch -D <nome>     # forçar deleção
git branch -m <old> <new># renomear`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["-a", "Lista branches locais e remotos"],
            ["-r", "Lista apenas branches remotos"],
            ["-v", "Lista com último commit de cada branch"],
            ["-d", "Deleta branch (apenas se já foi mergeado)"],
            ["-D", "Força deleção independente do estado"],
            ["-m", "Renomeia o branch atual"],
            ["--merged", "Lista branches já mergeados no atual"],
            ["--no-merged", "Lista branches ainda não mergeados"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="branch-examples"
          lang="bash"
          code={`# Listar todos os branches
git branch -a

# Criar branch
git branch feature/autenticacao

# Criar e já mudar para ele
git checkout -b feature/autenticacao
# ou (Git 2.23+)
git switch -c feature/autenticacao

# Renomear branch atual
git branch -m novo-nome

# Deletar branch local já mergeado
git branch -d feature/autenticacao

# Deletar branch remoto
git push origin --delete feature/autenticacao

# Ver branches mergeados
git branch --merged main`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "br-checkout") {
    return (
      <div>
        <H1>git checkout / git switch</H1>
        <P>
          Muda o branch ativo ou restaura arquivos. O comando{" "}
          <span className="text-green-400 font-mono">git switch</span> (Git 2.23+)
          foi criado especificamente para navegar entre branches, enquanto{" "}
          <span className="text-green-400 font-mono">checkout</span> é mais genérico.
        </P>
        <H2>Navegação entre branches</H2>
        <CodeBlock
          id="checkout-examples"
          lang="bash"
          code={`# Mudar de branch (clássico)
git checkout main

# Mudar de branch (moderno)
git switch main

# Criar e mudar (clássico)
git checkout -b feature/nova

# Criar e mudar (moderno)
git switch -c feature/nova

# Voltar ao branch anterior
git checkout -
git switch -

# Criar branch a partir de um commit específico
git checkout -b hotfix abc123`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Checkout de arquivo (restaurar versão)</H2>
        <CodeBlock
          id="checkout-file"
          lang="bash"
          code={`# Descartar alterações de um arquivo (working tree)
git checkout -- arquivo.ts
# ou (moderno)
git restore arquivo.ts

# Restaurar arquivo para versão de um commit
git checkout abc123 -- src/config.ts`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Checkout em modo detached HEAD</H2>
        <CodeBlock
          id="checkout-detached"
          lang="bash"
          code={`# Ir para um commit específico (detached HEAD)
git checkout abc123

# Criar branch a partir daqui para salvar o trabalho
git checkout -b experimento`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Warning>
          Em detached HEAD, qualquer commit feito não pertence a nenhum branch e
          pode ser perdido. Sempre crie um branch antes de commitar.
        </Warning>
      </div>
    )
  }

  if (activeSection === "br-merge") {
    return (
      <div>
        <H1>git merge</H1>
        <P>
          Integra o histórico de dois branches, criando um commit de merge quando
          há históricos divergentes.
        </P>
        <H2>Tipos de merge</H2>
        <DocTable
          headers={["Tipo", "Quando ocorre", "Cria merge commit?"]}
          rows={[
            ["Fast-forward", "Branch atual não divergiu da base", "Não"],
            ["Recursive / Ort", "Históricos divergentes", "Sim"],
            ["Squash", "Comprime todos os commits em um", "Não (você commita)"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="merge-examples"
          lang="bash"
          code={`# Merge padrão (fast-forward se possível)
git checkout main
git merge feature/login

# Forçar merge commit mesmo com fast-forward possível
git merge --no-ff feature/login

# Merge squash (comprime commits)
git merge --squash feature/login
git commit -m "feat: implementar login"

# Abortar merge em conflito
git merge --abort

# Ver branches já mergeados
git branch --merged`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Resolvendo conflito de merge</H2>
        <CodeBlock
          id="merge-conflict"
          lang="bash"
          code={`# 1. Merge cria conflito
git merge feature/login

# 2. Verificar arquivos com conflito
git status

# 3. Editar arquivos — o Git marca conflitos assim:
# <<<<<<< HEAD
# código do branch atual
# =======
# código do branch mergeado
# >>>>>>> feature/login

# 4. Após resolver, marcar como resolvido
git add arquivo-com-conflito.ts

# 5. Finalizar o merge
git commit`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "br-rebase") {
    return (
      <div>
        <H1>git rebase</H1>
        <P>
          Reaplica commits de um branch sobre outro, criando um histórico linear
          sem merge commits. Útil para manter um histórico limpo.
        </P>
        <H2>Rebase básico</H2>
        <CodeBlock
          id="rebase-basic"
          lang="bash"
          code={`# Rebase do feature sobre main (histórico linear)
git checkout feature/login
git rebase main

# Equivalente mais moderno
git rebase main feature/login`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Rebase interativo</H2>
        <CodeBlock
          id="rebase-interactive"
          lang="bash"
          code={`# Reorganizar os últimos 3 commits
git rebase -i HEAD~3

# Opções disponíveis no editor:
# pick   - manter o commit
# reword - manter e editar a mensagem
# edit   - parar para editar o commit
# squash - juntar com o commit anterior
# fixup  - squash sem mensagem
# drop   - remover o commit`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Controles durante rebase</H2>
        <CodeBlock
          id="rebase-controls"
          lang="bash"
          code={`# Continuar após resolver conflito
git rebase --continue

# Pular o commit com conflito
git rebase --skip

# Abortar e voltar ao estado anterior
git rebase --abort`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Danger>
          Nunca faça rebase de branches públicos/compartilhados. O rebase reescreve
          o histórico — isso causa problemas graves para outros colaboradores.
        </Danger>
      </div>
    )
  }

  if (activeSection === "br-cherry-pick") {
    return (
      <div>
        <H1>git cherry-pick</H1>
        <P>
          Aplica as alterações de um ou mais commits específicos no branch atual,
          sem precisar fazer merge do branch inteiro.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="cherry-syntax"
          lang="bash"
          code="git cherry-pick <commit> [<commit>...]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["-x", "Adiciona referência ao commit original na mensagem"],
            ["-e", "Permite editar a mensagem antes de commitar"],
            ["-n / --no-commit", "Aplica as mudanças sem commitar"],
            ["--continue", "Continua após resolver conflito"],
            ["--abort", "Cancela a operação"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="cherry-examples"
          lang="bash"
          code={`# Aplicar commit específico no branch atual
git cherry-pick abc123

# Aplicar múltiplos commits
git cherry-pick abc123 def456

# Aplicar intervalo de commits
git cherry-pick abc123..def456

# Aplicar sem commitar (só stage)
git cherry-pick -n abc123

# Hotfix: pegar correção do main para branch de release
git checkout release/2.0
git cherry-pick abc123 -x`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  // ── DESFAZENDO ALTERAÇÕES ────────────────────────────────────────────────
  if (activeSection === "desfazendo" || activeSection === "des-reset") {
    return (
      <div>
        <H1>git reset</H1>
        <P>
          Move o ponteiro HEAD (e opcionalmente o branch) para um commit anterior.
          Existem três modos com comportamentos distintos para o staging e working tree.
        </P>
        <H2>Modos</H2>
        <DocTable
          headers={["Modo", "HEAD", "Index/Stage", "Working Tree"]}
          rows={[
            ["--soft", "Move", "Inalterado", "Inalterado"],
            ["--mixed (padrão)", "Move", "Resetado", "Inalterado"],
            ["--hard", "Move", "Resetado", "Resetado"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="reset-examples"
          lang="bash"
          code={`# Desfazer último commit (manter alterações staged)
git reset --soft HEAD~1

# Desfazer último commit (manter alterações no working tree)
git reset HEAD~1         # equivale a --mixed

# Desfazer último commit (descartar todas as alterações)
git reset --hard HEAD~1

# Resetar para um commit específico
git reset --hard abc123

# Remover arquivo do stage (sem perder alterações)
git reset HEAD arquivo.ts
# ou (moderno)
git restore --staged arquivo.ts`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Danger>
          <span className="font-mono">--hard</span> descarta permanentemente todas
          as alterações não commitadas. Use com cuidado. O{" "}
          <span className="font-mono">git reflog</span> pode ajudar a recuperar,
          mas nem sempre.
        </Danger>
      </div>
    )
  }

  if (activeSection === "des-revert") {
    return (
      <div>
        <H1>git revert</H1>
        <P>
          Cria um novo commit que desfaz as alterações de um commit anterior.
          É seguro para branches públicos pois não reescreve o histórico.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="revert-syntax"
          lang="bash"
          code="git revert <commit> [--no-edit] [-n]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="revert-examples"
          lang="bash"
          code={`# Reverter último commit
git revert HEAD

# Reverter commit específico
git revert abc123

# Reverter sem abrir editor
git revert --no-edit abc123

# Reverter sem commitar (apenas stage)
git revert -n abc123

# Reverter intervalo de commits
git revert HEAD~3..HEAD`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>reset vs revert</H2>
        <DocTable
          headers={["Aspecto", "git reset", "git revert"]}
          rows={[
            ["Histórico", "Reescreve", "Preserva"],
            ["Uso em público", "Perigoso", "Seguro"],
            ["Como funciona", "Move o ponteiro HEAD", "Cria novo commit de desfazer"],
            ["Reversível", "Via reflog", "Sim (revert do revert)"],
          ]}
        />
        <Tip>
          Em branches que já foram enviados para o remoto, sempre prefira{" "}
          <span className="font-mono">git revert</span> ao invés de{" "}
          <span className="font-mono">git reset</span>.
        </Tip>
      </div>
    )
  }

  if (activeSection === "des-restore") {
    return (
      <div>
        <H1>git restore</H1>
        <P>
          Comando moderno (Git 2.23+) para restaurar arquivos no working tree ou
          no stage, substituindo usos do <span className="text-green-400 font-mono">git checkout</span>{" "}
          para essa finalidade.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="restore-syntax"
          lang="bash"
          code="git restore [--staged] [--source=<tree>] <arquivo>"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["--staged", "Remove do stage (sem alterar working tree)"],
            ["--source=<tree>", "Restaura de um commit ou branch específico"],
            ["-W / --worktree", "Restaura apenas o working tree (padrão)"],
            ["-S / --staged -W", "Restaura stage e working tree"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="restore-examples"
          lang="bash"
          code={`# Descartar alterações de um arquivo no working tree
git restore arquivo.ts

# Descartar todas as alterações do diretório atual
git restore .

# Remover do stage (unstage)
git restore --staged arquivo.ts

# Restaurar arquivo para versão de um commit anterior
git restore --source=HEAD~2 src/config.ts

# Restaurar arquivo para versão de outro branch
git restore --source=main src/utils.ts`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "des-stash") {
    return (
      <div>
        <H1>git stash</H1>
        <P>
          Guarda temporariamente alterações não commitadas em uma pilha (stash),
          deixando o working tree limpo para trocar de branch ou tarefa.
        </P>
        <H2>Comandos principais</H2>
        <DocTable
          headers={["Comando", "Descrição"]}
          rows={[
            ["git stash", "Salva alterações na pilha (equivale a git stash push)"],
            ["git stash list", "Lista todos os stashes"],
            ["git stash pop", "Aplica e remove o stash mais recente"],
            ["git stash apply", "Aplica sem remover da pilha"],
            ["git stash drop", "Remove um stash específico"],
            ["git stash clear", "Remove todos os stashes"],
            ["git stash show", "Exibe o conteúdo do stash"],
            ["git stash branch <nome>", "Cria branch a partir do stash"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="stash-examples"
          lang="bash"
          code={`# Salvar alterações com mensagem
git stash push -m "WIP: implementação do login"

# Incluir arquivos não rastreados no stash
git stash push -u

# Listar stashes
git stash list
# stash@{0}: On feature: WIP: implementação do login
# stash@{1}: On main: correção temporária

# Aplicar stash mais recente
git stash pop

# Aplicar stash específico
git stash apply stash@{1}

# Criar branch a partir do stash
git stash branch feature/login stash@{0}`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Use <span className="font-mono">git stash push -u -m "descrição"</span>{" "}
          para incluir arquivos não rastreados e adicionar uma mensagem descritiva
          ao stash.
        </Tip>
      </div>
    )
  }

  // ── COLABORAÇÃO ──────────────────────────────────────────────────────────
  if (activeSection === "colaboracao" || activeSection === "col-push") {
    return (
      <div>
        <H1>git push</H1>
        <P>
          Envia commits locais para o repositório remoto.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="push-syntax"
          lang="bash"
          code="git push [<remote>] [<branch>] [opções]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["-u / --set-upstream", "Define o upstream (rastreamento remoto) do branch"],
            ["--force / -f", "Força o push mesmo com histórico divergente (perigoso)"],
            ["--force-with-lease", "Push forçado mas seguro: falha se remoto foi atualizado"],
            ["--tags", "Envia todas as tags locais"],
            ["--delete", "Deleta o branch remoto"],
            ["--dry-run", "Simula o push sem executar"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="push-examples"
          lang="bash"
          code={`# Push para origin, branch atual
git push

# Definir upstream e fazer push
git push -u origin feature/login

# Push de branch específico
git push origin feature/login

# Push forçado (seguro)
git push --force-with-lease origin feature/login

# Enviar todas as tags
git push --tags

# Deletar branch remoto
git push origin --delete feature/antiga`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Warning>
          Prefira <span className="font-mono">--force-with-lease</span> ao{" "}
          <span className="font-mono">--force</span>. O primeiro falha se alguém
          commitou no remoto desde sua última sincronização.
        </Warning>
      </div>
    )
  }

  if (activeSection === "col-pull") {
    return (
      <div>
        <H1>git pull</H1>
        <P>
          Baixa alterações do remoto e as integra no branch local atual
          (equivale a <span className="text-green-400 font-mono">git fetch</span>{" "}
          seguido de <span className="text-green-400 font-mono">git merge</span> ou{" "}
          <span className="text-green-400 font-mono">git rebase</span>).
        </P>
        <H2>Opções</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["--rebase", "Usa rebase em vez de merge ao integrar"],
            ["--ff-only", "Falha se não puder fazer fast-forward"],
            ["--no-commit", "Integra mas não commita automaticamente"],
            ["--autostash", "Faz stash automático antes e pop depois"],
            ["--all", "Faz fetch de todos os remotos"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="pull-col-examples"
          lang="bash"
          code={`# Pull padrão (fetch + merge)
git pull

# Pull com rebase (histórico linear)
git pull --rebase origin main

# Configurar pull para sempre usar rebase
git config --global pull.rebase true

# Pull somente se fast-forward
git pull --ff-only

# Pull com stash automático
git pull --autostash`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Configure <span className="font-mono">pull.rebase true</span> globalmente
          para evitar merge commits desnecessários ao sincronizar branches.
        </Tip>
      </div>
    )
  }

  if (activeSection === "col-fetch") {
    return (
      <div>
        <H1>git fetch</H1>
        <P>
          Baixa objetos e referências do repositório remoto sem modificar o
          working tree ou branches locais.
        </P>
        <H2>Exemplos</H2>
        <CodeBlock
          id="fetch-col-examples"
          lang="bash"
          code={`# Fetch do origin
git fetch origin

# Fetch de todos os remotos
git fetch --all

# Fetch de branch específico
git fetch origin feature/login

# Fetch e limpar branches remotos deletados
git fetch --prune

# Ver o que veio antes de integrar
git log origin/main..HEAD --oneline

# Comparar branch local com remoto
git diff main origin/main`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Use <span className="font-mono">git fetch --prune</span> regularmente
          para remover referências a branches remotos que já foram deletados.
        </Tip>
      </div>
    )
  }

  if (activeSection === "col-conflitos") {
    return (
      <div>
        <H1>Resolução de conflitos</H1>
        <P>
          Conflitos ocorrem quando duas branches alteram as mesmas linhas de um
          arquivo. O Git marca as regiões conflitantes e aguarda sua resolução.
        </P>
        <H2>Identificar conflitos</H2>
        <CodeBlock
          id="conflict-identify"
          lang="bash"
          code={`# Após merge/rebase com conflito:
git status
# both modified: src/auth/login.ts

git diff --diff-filter=U`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Marcadores de conflito</H2>
        <CodeBlock
          id="conflict-markers"
          lang="text"
          code={`<<<<<<< HEAD
// código do branch atual
const timeout = 3000
=======
// código do branch incoming
const timeout = 5000
>>>>>>> feature/login`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Ferramentas de merge</H2>
        <CodeBlock
          id="conflict-tools"
          lang="bash"
          code={`# Abrir ferramenta de merge configurada
git mergetool

# Configurar VS Code como ferramenta de merge
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# Resolver favorecendo o branch atual (ours)
git checkout --ours src/config.ts
git add src/config.ts

# Resolver favorecendo o branch incoming (theirs)
git checkout --theirs src/config.ts
git add src/config.ts`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Finalizar após resolução</H2>
        <CodeBlock
          id="conflict-finalize"
          lang="bash"
          code={`# Marcar como resolvido
git add arquivo-resolvido.ts

# Finalizar merge
git commit

# Ou finalizar rebase
git rebase --continue`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  // ── TAGS & VERSÕES ───────────────────────────────────────────────────────
  if (activeSection === "tags-versoes" || activeSection === "tag-tag") {
    return (
      <div>
        <H1>git tag</H1>
        <P>
          Tags são referências imutáveis a commits específicos. Usadas principalmente
          para marcar versões de lançamento.
        </P>
        <H2>Tipos de tag</H2>
        <DocTable
          headers={["Tipo", "Comando", "Descrição"]}
          rows={[
            ["Lightweight", "git tag v1.0.0", "Apenas um ponteiro para o commit"],
            ["Annotated", "git tag -a v1.0.0 -m 'msg'", "Objeto Git completo com metadados"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="tag-examples"
          lang="bash"
          code={`# Criar tag lightweight
git tag v1.0.0

# Criar tag annotated (recomendado para releases)
git tag -a v1.0.0 -m "Release versão 1.0.0"

# Taggear commit anterior
git tag -a v0.9.0 abc123 -m "Beta release"

# Listar todas as tags
git tag
git tag -l "v1.*"

# Ver detalhes de uma tag
git show v1.0.0

# Enviar tag ao remoto
git push origin v1.0.0

# Enviar todas as tags
git push --tags

# Deletar tag local
git tag -d v1.0.0-beta

# Deletar tag remota
git push origin --delete v1.0.0-beta`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Prefira tags annotated para versões de produção — elas armazenam o
          tagger, data e uma mensagem, tornando o histórico mais informativo.
        </Tip>
      </div>
    )
  }

  if (activeSection === "tag-semver") {
    return (
      <div>
        <H1>Versionamento semântico</H1>
        <P>
          O Semantic Versioning (SemVer) define um padrão para nomear versões
          no formato <span className="text-green-400 font-mono">MAJOR.MINOR.PATCH</span>.
        </P>
        <H2>Estrutura</H2>
        <DocTable
          headers={["Campo", "Quando incrementar", "Exemplo"]}
          rows={[
            ["MAJOR", "Mudanças incompatíveis com a API anterior", "1.0.0 → 2.0.0"],
            ["MINOR", "Nova funcionalidade compatível com versão anterior", "1.0.0 → 1.1.0"],
            ["PATCH", "Correção de bug compatível", "1.0.0 → 1.0.1"],
          ]}
        />
        <H2>Sufixos comuns</H2>
        <DocTable
          headers={["Sufixo", "Significado"]}
          rows={[
            ["v1.0.0-alpha", "Versão instável em desenvolvimento inicial"],
            ["v1.0.0-beta", "Versão para testes com feature-complete"],
            ["v1.0.0-rc.1", "Release candidate — candidato a versão final"],
            ["v1.0.0", "Versão estável de produção"],
          ]}
        />
        <H2>Workflow com tags SemVer</H2>
        <CodeBlock
          id="semver-workflow"
          lang="bash"
          code={`# Verificar última tag
git describe --tags --abbrev=0

# Criar nova versão minor
git tag -a v1.1.0 -m "feat: adicionar autenticação OAuth"
git push origin v1.1.0

# Criar versão patch após hotfix
git tag -a v1.0.1 -m "fix: corrigir vazamento de memória"
git push origin v1.0.1`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "tag-describe") {
    return (
      <div>
        <H1>git describe</H1>
        <P>
          Gera um nome legível para um commit com base na tag mais próxima no
          histórico.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="describe-syntax"
          lang="bash"
          code="git describe [--tags] [--abbrev=<n>] [--always] [<commit>]"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="describe-examples"
          lang="bash"
          code={`# Descrever HEAD
git describe
# v1.0.0-3-gabc123  (3 commits após v1.0.0, hash abc123)

# Incluir tags lightweight
git describe --tags

# Descrever mesmo sem tags anteriores
git describe --always

# Só a tag mais próxima
git describe --tags --abbrev=0

# Descrever commit específico
git describe abc123`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Use <span className="font-mono">git describe --tags --abbrev=0</span>{" "}
          em scripts de CI/CD para obter automaticamente a versão atual do projeto.
        </Tip>
      </div>
    )
  }

  // ── HISTÓRICO AVANÇADO ───────────────────────────────────────────────────
  if (activeSection === "historico-avancado" || activeSection === "hist-log") {
    return (
      <div>
        <H1>git log avançado</H1>
        <P>
          O <span className="text-green-400 font-mono">git log</span> possui
          inúmeras opções de filtragem e formatação para investigar o histórico
          com precisão.
        </P>
        <H2>Busca por conteúdo</H2>
        <CodeBlock
          id="log-advanced"
          lang="bash"
          code={`# Commits que adicionaram/removeram string
git log -S "nome_da_funcao"

# Commits com mensagem contendo regex
git log --grep="feat:"

# Commits por autor e período
git log --author="Estevam" --since="2024-01-01" --until="2024-12-31"

# Commits que alteraram um arquivo específico
git log --follow -- src/auth/login.ts

# Commits que tocaram diretório
git log -- src/components/`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Formatações visuais</H2>
        <CodeBlock
          id="log-visual"
          lang="bash"
          code={`# Grafo completo com decoração
git log --oneline --graph --all --decorate

# Formato personalizado rico
git log --pretty=format:"%C(yellow)%h%Creset %C(blue)%ad%Creset %C(green)%an%Creset %s" --date=short

# Commits entre duas datas
git log --after="2024-06-01" --before="2024-07-01" --oneline`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Comparações entre refs</H2>
        <CodeBlock
          id="log-refs"
          lang="bash"
          code={`# Commits no feature que não estão no main
git log main..feature/login

# Commits em ambos que divergem
git log main...feature/login

# Commits do último dia
git log --since=yesterday --oneline`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "hist-blame") {
    return (
      <div>
        <H1>git blame</H1>
        <P>
          Exibe qual commit e autor foi o responsável por cada linha de um arquivo.
          Essencial para rastrear a origem de bugs ou entender o contexto de código.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="blame-syntax"
          lang="bash"
          code="git blame [opções] <arquivo>"
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Opções</H2>
        <DocTable
          headers={["Flag", "Descrição"]}
          rows={[
            ["-L <start>,<end>", "Mostra apenas as linhas no intervalo especificado"],
            ["-e", "Mostra email do autor em vez do nome"],
            ["-w", "Ignora alterações de whitespace"],
            ["-C", "Detecta linhas movidas entre arquivos"],
            ["--since=<data>", "Ignora commits mais recentes que a data"],
          ]}
        />
        <H2>Exemplos</H2>
        <CodeBlock
          id="blame-examples"
          lang="bash"
          code={`# Blame completo do arquivo
git blame src/auth/login.ts

# Apenas linhas 20 a 50
git blame -L 20,50 src/auth/login.ts

# Ignorar refatorações de whitespace
git blame -w src/utils.ts

# Com emails
git blame -e src/index.ts

# Blame de versão anterior
git blame HEAD~5 -- src/config.ts`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "hist-bisect") {
    return (
      <div>
        <H1>git bisect</H1>
        <P>
          Usa busca binária para encontrar o commit que introduziu um bug. O Git
          navega automaticamente pelo histórico dividindo-o ao meio a cada passo.
        </P>
        <H2>Workflow básico</H2>
        <CodeBlock
          id="bisect-workflow"
          lang="bash"
          code={`# 1. Iniciar bisect
git bisect start

# 2. Marcar commit atual como ruim (tem o bug)
git bisect bad

# 3. Marcar commit antigo como bom (não tinha o bug)
git bisect good v1.0.0

# 4. O Git faz checkout no meio. Testar e marcar:
git bisect good   # se este commit não tem o bug
git bisect bad    # se este commit tem o bug

# 5. Repetir até o Git identificar o commit culpado

# 6. Terminar e voltar ao HEAD
git bisect reset`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Bisect automático com script</H2>
        <CodeBlock
          id="bisect-auto"
          lang="bash"
          code={`# Script de teste: sai com 0 se bom, não-zero se ruim
git bisect start HEAD v1.0.0
git bisect run npm test

# Ou script customizado
git bisect run ./scripts/test-bug.sh`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          O bisect automático com <span className="font-mono">git bisect run</span>{" "}
          economiza muito tempo em repositórios grandes — basta ter um script
          que retorna 0 para "bom" e qualquer outro código para "ruim".
        </Tip>
      </div>
    )
  }

  if (activeSection === "hist-reflog") {
    return (
      <div>
        <H1>git reflog</H1>
        <P>
          O reflog registra todos os movimentos do ponteiro HEAD localmente,
          mesmo aqueles que não aparecem no log normal. É o "seguro de vida" do Git.
        </P>
        <H2>Exemplos</H2>
        <CodeBlock
          id="reflog-examples"
          lang="bash"
          code={`# Ver todos os movimentos do HEAD
git reflog

# Saída típica:
# abc123 HEAD@{0}: commit: feat: login
# def456 HEAD@{1}: reset: moving to HEAD~2
# ghi789 HEAD@{2}: commit: fix: bug

# Reflog de um branch específico
git reflog show feature/login

# Recuperar commit perdido após reset --hard
git checkout HEAD@{2}
git checkout -b branch-recuperado

# Ou resetar para o estado anterior
git reset --hard HEAD@{1}`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Casos de uso comuns</H2>
        <UL
          items={[
            "Recuperar commits após git reset --hard acidental",
            "Recuperar branch deletado antes do garbage collection",
            "Auditar o que aconteceu no repositório nas últimas horas",
            "Encontrar o estado de antes de um rebase mal-sucedido",
          ]}
        />
        <Warning>
          O reflog é local e temporário — por padrão, entradas expiram após 90
          dias. Não use como backup de longo prazo.
        </Warning>
      </div>
    )
  }

  // ── CONFIGURAÇÃO AVANÇADA ────────────────────────────────────────────────
  if (activeSection === "config-avancada" || activeSection === "cfg-gitignore") {
    return (
      <div>
        <H1>.gitignore</H1>
        <P>
          O arquivo <span className="text-green-400 font-mono">.gitignore</span>{" "}
          lista padrões de arquivos e diretórios que o Git deve ignorar e não
          rastrear.
        </P>
        <H2>Sintaxe</H2>
        <CodeBlock
          id="gitignore-syntax"
          lang="gitignore"
          code={`# Comentário
node_modules/        # ignorar diretório
*.log                # ignorar por extensão
.env                 # ignorar arquivo específico
dist/                # ignorar diretório de build
!dist/index.html     # ! = exceção (não ignorar)
/coverage            # ignorar apenas na raiz
**/temp              # ignorar em qualquer nível
*.local              # qualquer arquivo .local`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Exemplo para projeto Node.js/TypeScript</H2>
        <CodeBlock
          id="gitignore-node"
          lang="gitignore"
          code={`# Dependências
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
.next/
out/

# Ambiente
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# IDE
.vscode/settings.json
.idea/
*.swp

# Sistema
.DS_Store
Thumbs.db`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Gitignore global</H2>
        <CodeBlock
          id="gitignore-global"
          lang="bash"
          code={`# Criar gitignore global (vale para todos os repos)
git config --global core.excludesfile ~/.gitignore_global

# Adicionar padrões comuns
echo ".DS_Store" >> ~/.gitignore_global
echo "*.swp" >> ~/.gitignore_global`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Use <span className="font-mono">git rm --cached arquivo</span> para
          parar de rastrear um arquivo já commitado após adicioná-lo ao .gitignore.
        </Tip>
      </div>
    )
  }

  if (activeSection === "cfg-config-global") {
    return (
      <div>
        <H1>git config global</H1>
        <P>
          Configurações globais que se aplicam a todos os repositórios do usuário.
          Armazenadas em <span className="text-green-400 font-mono">~/.gitconfig</span>.
        </P>
        <H2>Configurações essenciais</H2>
        <CodeBlock
          id="cfg-global-essential"
          lang="bash"
          code={`# Identidade
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Editor
git config --global core.editor "code --wait"

# Branch padrão
git config --global init.defaultBranch main

# Pull com rebase
git config --global pull.rebase true

# Push apenas o branch atual
git config --global push.default current

# Colorir output
git config --global color.ui auto`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Configurações de diff e merge</H2>
        <CodeBlock
          id="cfg-global-diff"
          lang="bash"
          code={`# Ferramenta de diff
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'

# Ferramenta de merge
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# Auto-stash no pull com rebase
git config --global rebase.autostash true

# Detectar renomeações no diff
git config --global diff.renames true`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Ver e editar o arquivo diretamente</H2>
        <CodeBlock
          id="cfg-global-edit"
          lang="bash"
          code={`# Abrir ~/.gitconfig no editor
git config --global --edit

# Ver todas as configurações globais
git config --global --list`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "cfg-hooks") {
    return (
      <div>
        <H1>Git Hooks</H1>
        <P>
          Hooks são scripts executados automaticamente em eventos do Git. Ficam em{" "}
          <span className="text-green-400 font-mono">.git/hooks/</span> e podem
          ser em qualquer linguagem de script.
        </P>
        <H2>Hooks mais usados</H2>
        <DocTable
          headers={["Hook", "Quando executa", "Caso de uso"]}
          rows={[
            ["pre-commit", "Antes de criar o commit", "Lint, formatação, testes rápidos"],
            ["commit-msg", "Após digitar a mensagem", "Validar formato da mensagem"],
            ["pre-push", "Antes do push", "Rodar testes completos"],
            ["post-merge", "Após merge", "npm install se package.json mudou"],
            ["prepare-commit-msg", "Antes do editor abrir", "Template de mensagem"],
          ]}
        />
        <H2>Exemplo: pre-commit com lint</H2>
        <CodeBlock
          id="hooks-pre-commit"
          lang="bash"
          code={`#!/bin/sh
# .git/hooks/pre-commit

# Rodar ESLint nos arquivos staged
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.ts$')
if [ -n "$FILES" ]; then
  npx eslint $FILES
  if [ $? -ne 0 ]; then
    echo "ESLint falhou. Commit cancelado."
    exit 1
  fi
fi`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Tornando o hook executável</H2>
        <CodeBlock
          id="hooks-chmod"
          lang="bash"
          code={`chmod +x .git/hooks/pre-commit`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Usando Husky (compartilhável)</H2>
        <CodeBlock
          id="hooks-husky"
          lang="bash"
          code={`# Instalar Husky
npm install --save-dev husky
npx husky init

# Adicionar hook pre-commit
echo "npx lint-staged" > .husky/pre-commit

# package.json
# "lint-staged": {
#   "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
# }`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Use <span className="font-mono">Husky</span> +{" "}
          <span className="font-mono">lint-staged</span> para compartilhar hooks
          com a equipe via controle de versão.
        </Tip>
      </div>
    )
  }

  if (activeSection === "cfg-alias") {
    return (
      <div>
        <H1>git alias</H1>
        <P>
          Aliases permitem criar atalhos para comandos Git longos ou frequentes,
          economizando tempo e reduzindo erros de digitação.
        </P>
        <H2>Criar aliases</H2>
        <CodeBlock
          id="alias-create"
          lang="bash"
          code={`# Alias simples
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm "commit -m"

# Alias com múltiplos flags
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.last "log -1 HEAD --stat"

# Alias para unstage
git config --global alias.unstage "restore --staged"

# Alias para ver branches remotos
git config --global alias.rb "branch -r"`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Aliases no ~/.gitconfig</H2>
        <CodeBlock
          id="alias-gitconfig"
          lang="ini"
          code={`[alias]
  st = status
  co = checkout
  sw = switch
  br = branch
  cm = commit -m
  lg = log --oneline --graph --all --decorate
  last = log -1 HEAD --stat
  unstage = restore --staged
  aliases = config --get-regexp alias
  undo = reset --soft HEAD~1
  wip = !git add -A && git commit -m 'WIP'`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Usar aliases</H2>
        <CodeBlock
          id="alias-use"
          lang="bash"
          code={`git st          # git status
git lg          # log completo com grafo
git undo        # desfaz último commit (--soft)
git wip         # stage tudo + commit "WIP"`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  // ── FLUXOS DE TRABALHO ───────────────────────────────────────────────────
  if (activeSection === "fluxos" || activeSection === "flx-gitflow") {
    return (
      <div>
        <H1>Git Flow</H1>
        <P>
          Git Flow é uma estratégia de branching com branches de vida longa
          estruturados para ciclos de release formais.
        </P>
        <H2>Branches principais</H2>
        <DocTable
          headers={["Branch", "Propósito", "Merge para"]}
          rows={[
            ["main", "Código de produção", "-"],
            ["develop", "Integração de features", "main (via release)"],
            ["feature/*", "Nova funcionalidade", "develop"],
            ["release/*", "Preparação de versão", "main + develop"],
            ["hotfix/*", "Correção urgente em produção", "main + develop"],
          ]}
        />
        <H2>Workflow com git-flow CLI</H2>
        <CodeBlock
          id="gitflow-workflow"
          lang="bash"
          code={`# Instalar (macOS)
brew install git-flow

# Inicializar no repositório
git flow init

# Iniciar feature
git flow feature start autenticacao

# Finalizar feature (merge em develop)
git flow feature finish autenticacao

# Iniciar release
git flow release start 1.0.0

# Finalizar release (merge em main e develop, cria tag)
git flow release finish 1.0.0

# Iniciar hotfix
git flow hotfix start corrigir-login

# Finalizar hotfix
git flow hotfix finish corrigir-login`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <Tip>
          Git Flow é ideal para projetos com ciclos de release definidos.
          Para entregas contínuas (CD), considere GitHub Flow ou Trunk-based.
        </Tip>
      </div>
    )
  }

  if (activeSection === "flx-githubflow") {
    return (
      <div>
        <H1>GitHub Flow</H1>
        <P>
          Modelo simplificado com apenas um branch principal (
          <span className="text-green-400 font-mono">main</span>) e branches de
          feature de vida curta, integrados via Pull Requests.
        </P>
        <H2>Princípios</H2>
        <UL
          items={[
            "main sempre está pronto para deploy em produção",
            "Todo trabalho novo começa em um branch a partir de main",
            "Commits são enviados regularmente ao branch remoto",
            "Pull Request é aberto para revisão e discussão",
            "Após aprovação, merge para main e deploy imediato",
          ]}
        />
        <H2>Workflow</H2>
        <CodeBlock
          id="githubflow-workflow"
          lang="bash"
          code={`# 1. Criar branch a partir de main
git checkout main
git pull origin main
git checkout -b feature/autenticacao-oauth

# 2. Trabalhar e commitar regularmente
git add .
git commit -m "feat: adicionar OAuth provider"
git push origin feature/autenticacao-oauth

# 3. Abrir Pull Request no GitHub
# (via interface web ou gh CLI)
gh pr create --title "feat: autenticação OAuth" --base main

# 4. Após aprovação e merge, limpar branch local
git checkout main
git pull origin main
git branch -d feature/autenticacao-oauth`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Comparação Git Flow vs GitHub Flow</H2>
        <DocTable
          headers={["Aspecto", "Git Flow", "GitHub Flow"]}
          rows={[
            ["Complexidade", "Alta", "Baixa"],
            ["Branches permanentes", "main + develop", "Apenas main"],
            ["Releases", "Formais com branch release", "Deploy a cada merge"],
            ["Ideal para", "Versões agendadas", "Entrega contínua"],
          ]}
        />
      </div>
    )
  }

  if (activeSection === "flx-trunk") {
    return (
      <div>
        <H1>Trunk-based Development</H1>
        <P>
          Todos os desenvolvedores integram suas alterações no branch principal
          (trunk/main) pelo menos uma vez por dia. Branches de feature existem,
          mas têm vida muito curta (horas, não dias).
        </P>
        <H2>Princípios</H2>
        <UL
          items={[
            "Um único branch de longa duração: main/trunk",
            "Branches de feature com duração máxima de 1-2 dias",
            "Feature flags para esconder funcionalidades incompletas",
            "Testes automatizados extensivos como porta de entrada",
            "CI/CD integrado — cada commit ao trunk é potencialmente deployável",
          ]}
        />
        <H2>Workflow</H2>
        <CodeBlock
          id="trunk-workflow"
          lang="bash"
          code={`# Atualizar trunk
git checkout main
git pull origin main

# Criar branch de vida curta
git checkout -b feature/botao-login

# Trabalhar rapidamente (horas, não dias)
git add .
git commit -m "feat: botão de login com feature flag"

# Integrar ao trunk diariamente
git rebase main
git push origin feature/botao-login

# Merge rápido (sem review longa)
# Via CLI
gh pr create --title "feat: login button" --base main
gh pr merge --squash --delete-branch`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Feature flags em código</H2>
        <CodeBlock
          id="trunk-feature-flag"
          lang="typescript"
          code={`// Feature flag para funcionalidade incompleta
const FEATURES = {
  newAuthFlow: process.env.NEXT_PUBLIC_FF_NEW_AUTH === 'true',
}

export function LoginButton() {
  if (FEATURES.newAuthFlow) {
    return <NewLoginButton />
  }
  return <LegacyLoginButton />
}`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
      </div>
    )
  }

  if (activeSection === "flx-squash") {
    return (
      <div>
        <H1>Squash commits</H1>
        <P>
          Squash combina múltiplos commits em um único, produzindo um histórico
          mais limpo e legível no branch principal.
        </P>
        <H2>Métodos de squash</H2>
        <H3>1. Rebase interativo</H3>
        <CodeBlock
          id="squash-rebase"
          lang="bash"
          code={`# Squash dos últimos 4 commits
git rebase -i HEAD~4

# No editor, mudar "pick" para "squash" (ou "s") nos commits a juntar:
# pick   abc123 feat: adicionar login
# squash def456 fix: corrigir validação
# squash ghi789 fix: ajustar estilos
# squash jkl012 chore: remover logs`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H3>2. Merge squash</H3>
        <CodeBlock
          id="squash-merge"
          lang="bash"
          code={`# Squash durante merge
git checkout main
git merge --squash feature/login
git commit -m "feat: implementar autenticação completa"

# Via GitHub Pull Request
# Opção "Squash and merge" na interface`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H3>3. Reset + commit</H3>
        <CodeBlock
          id="squash-reset"
          lang="bash"
          code={`# Reset mantendo as alterações no working tree
git reset --soft HEAD~4

# Commitar tudo junto
git commit -m "feat: implementar autenticação completa"

# Forçar push (reescreveu o histórico)
git push --force-with-lease origin feature/login`}
          copiedStates={copiedStates}
          onCopy={onCopy}
        />
        <H2>Quando usar squash</H2>
        <DocTable
          headers={["Situação", "Recomendação"]}
          rows={[
            ["Commits WIP, fix, typo no feature branch", "Squash antes do merge para main"],
            ["Feature branch com 10+ commits dispersos", "Squash para 1-3 commits semânticos"],
            ["Branch de produção público", "Evite squash (reescreve histórico)"],
            ["PR de pequena correção", "Squash and merge via GitHub UI"],
          ]}
        />
      </div>
    )
  }

  // ── FALLBACK / WELCOME ────────────────────────────────────────────────────
  return (
    <div>
      <H1>Guia Git — Referência Completa</H1>
      <P>
        Bem-vindo ao guia de referência Git do{" "}
        <span className="text-white font-semibold">CommitForge</span>. Selecione
        uma seção na barra lateral para começar.
      </P>
      <H2>Seções disponíveis</H2>
      <DocTable
        headers={["Seção", "Tópicos"]}
        rows={[
          ["Fundamentos", "O que é Git, instalação, configuração, conceitos"],
          ["Repositório", "init, clone, remote, fetch/pull"],
          ["Stage & Commit", "status, add, commit, diff, log"],
          ["Branches", "branch, checkout, merge, rebase, cherry-pick"],
          ["Desfazendo Alterações", "reset, revert, restore, stash"],
          ["Colaboração", "push, pull, fetch, conflitos"],
          ["Tags & Versões", "tag, semver, describe"],
          ["Histórico Avançado", "log avançado, blame, bisect, reflog"],
          ["Configuração Avançada", ".gitignore, config, hooks, alias"],
          ["Fluxos de Trabalho", "Git Flow, GitHub Flow, Trunk-based, Squash"],
        ]}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function GitPage() {
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
            <a
              href="/"
              className="font-mono text-sm font-bold text-white hover:text-gray-300 transition-colors"
            >
              CommitForge
            </a>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <a
            href="/docs"
            className="font-mono text-xs text-gray-400 hover:text-white transition-colors"
          >
            Docs
          </a>
          <a
            href="/git"
            className="font-mono text-xs text-green-400 border-b border-green-400 pb-0.5"
            aria-current="page"
          >
            Guia Git
          </a>
        </nav>
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
        <SidebarContent
          sections={sidebarSections}
          activeSection={activeSection}
          onNavClick={handleNavClick}
        />
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
