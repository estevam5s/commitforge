"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import {
  Copy,
  Check,
  Terminal,
  Download,
  Github,
  Apple,
  ChevronDown,
  Zap,
  GitBranch,
  Clock,
} from "lucide-react"

// TVA Background — dynamically imported to avoid SSR issues with Canvas
const TvaBackground = dynamic(() => import("@/components/tva-background"), { ssr: false })

// Linux icon not in lucide-react, so we use a simple SVG inline component
function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.504 0C12.23 0 11.96.03 11.694.09 9.493.471 8.57 2.37 8.57 4.135c0 1.066.245 2.015.617 2.768-.986 1.64-1.78 3.4-1.78 5.213 0 1.555.37 3.038 1.01 4.327-.27.355-.5.71-.71 1.062-.17.286-.32.567-.45.84-.38.81-.582 1.594-.582 2.218 0 1.48 1.065 2.437 2.645 2.437.735 0 1.58-.23 2.43-.669.85-.438 1.73-1.065 2.57-1.86.84.795 1.72 1.422 2.57 1.86.85.44 1.695.669 2.43.669 1.58 0 2.645-.957 2.645-2.437 0-.624-.202-1.408-.582-2.218a9.62 9.62 0 0 0-.45-.84 8.49 8.49 0 0 0-.71-1.062c.64-1.29 1.01-2.772 1.01-4.327 0-1.813-.794-3.573-1.78-5.213.372-.753.617-1.702.617-2.768 0-1.765-.923-3.664-3.124-4.045A4.476 4.476 0 0 0 12.504 0zm-.008 1.46c.205 0 .41.017.612.052 1.584.277 2.274 1.73 2.274 3.093 0 .924-.234 1.733-.566 2.37L12.5 5.5l-2.316 1.475c-.332-.637-.566-1.446-.566-2.37 0-1.363.69-2.816 2.274-3.093.202-.035.407-.052.604-.052zM7.5 8.5c.5 0 1 .2 1.4.6L10 10.5l-1 1.5H7l-1-1.5 1.1-1.4c.4-.4.9-.6 1.4-.6zm9 0c.5 0 1 .2 1.4.6L19 10.5l-1 1.5h-2l-1-1.5 1.1-1.4c.4-.4.9-.6 1.4-.6zM12 13c1.1 0 2 .4 2.7 1.1l.8 3.4c-.5.3-1 .6-1.5.8l-.5-2.3h-3l-.5 2.3c-.5-.2-1-.5-1.5-.8l.8-3.4C10 13.4 10.9 13 12 13z" />
    </svg>
  )
}

function DockerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.185.186v1.887c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"/>
    </svg>
  )
}

type InstallTab = "curl" | "docker" | "macos" | "linux"

interface TerminalLine {
  text: string
  color: string
}

interface TerminalSequence {
  command: string
  outputs: TerminalLine[]
}

const terminalSequences: TerminalSequence[] = [
  {
    command: "commitforge commit --repo https://github.com/user/repo.git --year 2019 --modo projeto",
    outputs: [
      { text: "✓ Clonando repositório em /tmp/forge_abc123...", color: "text-green-400" },
      { text: "  [configuração]   6 arquivos → chore: configuração", color: "text-blue-400" },
      { text: "  [estilos]        2 arquivos → feat: estilos", color: "text-blue-400" },
      { text: "  [componentes]   21 arquivos → feat: componentes", color: "text-blue-400" },
      { text: "✓ 9 commits criados em 2019 • push concluído", color: "text-green-400" },
    ],
  },
  {
    command: "commitforge grupos --repo https://github.com/user/repo.git",
    outputs: [
      { text: "  GRUPO              ARQUIVOS   MENSAGEM", color: "text-white/40" },
      { text: "  configuração            6     chore: configuração", color: "text-yellow-300" },
      { text: "  estilos                 2     feat: estilos", color: "text-yellow-300" },
      { text: "  componentes            21     feat: componentes", color: "text-yellow-300" },
      { text: "✓ 3 grupos prontos para commit", color: "text-green-400" },
    ],
  },
  {
    command: "commitforge commit --interativo",
    outputs: [
      { text: "? URL do repositório: https://github.com/user/repo.git", color: "text-cyan-400" },
      { text: "? Modo [projeto/arquivo]: projeto", color: "text-cyan-400" },
      { text: "? Ano alvo: 2021", color: "text-cyan-400" },
      { text: "✓ Iniciando... 11 grupos encontrados • processando", color: "text-green-400" },
    ],
  },
]

const installContent: Record<InstallTab, { code: string; description: string }> = {
  curl: {
    code: `curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install.sh | bash`,
    description: "Instala automaticamente em macOS e Linux. Requer Python 3.8+ e git.",
  },
  docker: {
    code: `docker pull ghcr.io/estevam5s/commitforge:latest
docker run --rm -e GITHUB_TOKEN=ghp_xxx \\
  ghcr.io/estevam5s/commitforge:latest \\
  commitforge commit --repo URL --year 2020`,
    description: "Sem dependências locais. Requer Docker instalado.",
  },
  macos: {
    code: `# Via Homebrew
brew tap estevam5s/commitforge
brew install commitforge

# Ou via pip
pip install commitforge`,
    description: "macOS 12+ (Monterey ou superior). Python 3.8+ via Homebrew recomendado.",
  },
  linux: {
    code: `# Debian/Ubuntu
curl -fsSL https://apt.commitforge.dev/gpg | sudo apt-key add -
echo "deb https://apt.commitforge.dev stable main" | sudo tee /etc/apt/sources.list.d/commitforge.list
sudo apt update && sudo apt install commitforge

# Ou via pip
pip install commitforge`,
    description: "Compatível com Debian, Ubuntu, Fedora, Arch. Requer Python 3.8+.",
  },
}

const cliFlags = [
  { flag: "--repo, -r",              type: "string",  default: "—",                    desc: "URL do repositório Git" },
  { flag: "--year, -y",              type: "int",     default: "—",                    desc: "Ano completo (ex: 2019)" },
  { flag: "--start-date",            type: "date",    default: "—",                    desc: "Data início YYYY-MM-DD" },
  { flag: "--end-date",              type: "date",    default: "—",                    desc: "Data fim YYYY-MM-DD" },
  { flag: "--dias, -d",              type: "int",     default: "30",                   desc: "Últimos N dias" },
  { flag: "--modo, -M",              type: "choice",  default: "projeto",              desc: "projeto ou arquivo" },
  { flag: "--branch",                type: "string",  default: "historico-{year}",     desc: "Nome do branch" },
  { flag: "--token, -t",             type: "string",  default: "$GITHUB_TOKEN",        desc: "Token de acesso" },
  { flag: "--commits-por-dia",       type: "int",     default: "1",                    desc: "Commits por dia (modo arquivo)" },
  { flag: "--aleatorio",             type: "flag",    default: "false",                desc: "Horários aleatórios" },
  { flag: "--pular-fins-de-semana",  type: "flag",    default: "false",                desc: "Pular sábado/domingo" },
  { flag: "--sem-push",              type: "flag",    default: "false",                desc: "Não enviar ao remoto" },
  { flag: "--interativo",            type: "flag",    default: "false",                desc: "Modo interativo" },
]

const platforms = [
  { name: "GitHub",        url: "github.com" },
  { name: "GitLab",        url: "gitlab.com" },
  { name: "Bitbucket",     url: "bitbucket.org" },
  { name: "Gitea",         url: "Self-hosted" },
  { name: "Azure DevOps",  url: "dev.azure.com" },
  { name: "Git Local",     url: "Repositório local" },
]

const howItWorks = [
  { step: "01", title: "Clone o repositório em diretório temporário",       desc: "CommitForge clona o repo em /tmp para análise sem alterar seu ambiente local." },
  { step: "02", title: "Agrupa arquivos em 17 categorias semânticas",       desc: "Os arquivos são classificados por tipo: configuração, estilos, componentes, backend, CLI, templates, docs e mais." },
  { step: "03", title: "Distribui datas uniformemente no período",          desc: "As datas dos commits são distribuídas de forma natural ao longo do ano ou intervalo definido." },
  { step: "04", title: "Cria commits com datas retroativas",                desc: "Cada commit é criado com GIT_AUTHOR_DATE e GIT_COMMITTER_DATE configurados para o passado, com e-mail verificado da conta GitHub." },
  { step: "05", title: "Push com force para o remoto via token",            desc: "git push --force envia o histórico reescrito diretamente para o repositório remoto autenticado." },
  { step: "06", title: "Commits aparecem no gráfico de contribuições",      desc: "Os commits ficam visíveis na atividade do perfil GitHub. Selecione o ano no gráfico para ver os commits retroativos." },
]

// ─── Feedback Form ────────────────────────────────────────────────────────────
function FeedbackSection() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState("general")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setStatus("loading")
    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, rating: rating || null, category }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus("success")
        setName(""); setEmail(""); setMessage(""); setRating(0); setCategory("general")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <section className="border-t border-gray-800 px-6 py-20 bg-black">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs text-amber-500 font-mono tracking-widest uppercase">Feedback</span>
          <h2 className="text-3xl font-bold mt-2 text-white">O que você acha?</h2>
          <p className="text-gray-500 text-sm mt-2">Sua opinião ajuda a melhorar o CommitForge</p>
        </div>

        {status === "success" ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-white font-semibold text-lg">Feedback enviado!</p>
            <p className="text-gray-400 text-sm mt-1">Obrigado pela sua contribuição.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-gray-500 hover:text-white text-sm transition-colors"
            >
              Enviar outro
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-950 border border-gray-800 rounded-2xl p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Nome (opcional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">E-mail (opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="general">Geral</option>
                  <option value="feature">Sugestão de Feature</option>
                  <option value="bug">Bug Report</option>
                  <option value="performance">Performance</option>
                  <option value="docs">Documentação</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Avaliação</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || rating) ? "text-amber-400" : "text-gray-700"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Mensagem *</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conte sua experiência com o CommitForge..."
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-sm">Erro ao enviar. Tente novamente.</p>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !message.trim()}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition-all text-sm"
            >
              {status === "loading" ? "Enviando..." : "Enviar Feedback"}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default function CommitForgeLanding() {
  const [activeInstallTab, setActiveInstallTab] = useState<InstallTab>("curl")
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const [currentCommand, setCurrentCommand] = useState(0)
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([])
  const [currentTyping, setCurrentTyping] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)
  const [installCount, setInstallCount] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/install-track")
      .then((r) => r.json())
      .then((d) => setInstallCount(d.count ?? null))
      .catch(() => {})
  }, [])

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => setCopiedStates((prev) => ({ ...prev, [key]: false })), 2000)
    } catch {
      // silently fail
    }
  }

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setShowCursor((v) => !v), 500)
    return () => clearInterval(id)
  }, [])

  // Terminal animation cycle
  useEffect(() => {
    const seq = terminalSequences[currentCommand]
    const timeouts: ReturnType<typeof setTimeout>[] = []

    setTerminalLines([])
    setCurrentTyping("")
    setIsExecuting(false)

    // Type command
    for (let i = 1; i <= seq.command.length; i++) {
      timeouts.push(
        setTimeout(() => {
          setCurrentTyping(seq.command.slice(0, i))
        }, i * 22)
      )
    }

    const afterType = seq.command.length * 22 + 300

    // Mark as executing (Enter pressed)
    timeouts.push(setTimeout(() => setIsExecuting(true), afterType))

    // Show output lines
    seq.outputs.forEach((line, idx) => {
      timeouts.push(
        setTimeout(() => {
          setTerminalLines((prev) => [...prev, line])
        }, afterType + 200 + idx * 500)
      )
    })

    // Advance to next sequence
    const total = afterType + 200 + seq.outputs.length * 500 + 2800
    timeouts.push(
      setTimeout(() => {
        setCurrentCommand((prev) => (prev + 1) % terminalSequences.length)
      }, total)
    )

    return () => timeouts.forEach(clearTimeout)
  }, [currentCommand])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-black/90 border-b border-gray-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 shrink-0">
            <span className="flex gap-1 items-center">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </span>
            <span className="text-white font-bold text-base tracking-tight ml-1">CommitForge</span>
          </button>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7 text-sm text-gray-400">
            <button onClick={() => scrollTo("instalacao")} className="hover:text-white transition-colors">Instalação</button>
            <button onClick={() => scrollTo("modos")}      className="hover:text-white transition-colors">Modos</button>
            <button onClick={() => scrollTo("cli")}        className="hover:text-white transition-colors">CLI</button>
            <a href="/docs"       className="hover:text-white transition-colors">Docs</a>
            <a href="/git"        className="hover:text-white transition-colors">Guia Git</a>
            <a href="/changelog"  className="hover:text-white transition-colors">Changelog</a>
            <a
              href="https://github.com/estevam5s/commitforge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          {/* Right: version + pip install copy */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="px-2 py-0.5 rounded border border-gray-700 text-gray-400 text-xs">v1.0.0</span>
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300">
              <span className="text-green-400">$</span>
              <span>pip install commitforge</span>
              <button
                onClick={() => copyToClipboard("pip install commitforge", "nav-pip")}
                className="ml-1 text-gray-500 hover:text-white transition-colors"
              >
                {copiedStates["nav-pip"] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 max-w-7xl mx-auto">

        {/* TVA Background — Sacred Timeline canvas animation */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
             style={{ background: "radial-gradient(ellipse at center, rgba(120,53,15,0.18) 0%, rgba(0,0,0,0) 70%)" }}>
          <TvaBackground />
        </div>

        {/* TVA badge */}
        <div className="relative flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/50 bg-amber-950/30 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <span className="font-mono text-xs text-amber-400 tracking-widest uppercase">TVA Authorized</span>
            <span className="font-mono text-xs text-amber-700">·</span>
            <span className="font-mono text-xs text-amber-600">Sacred Timeline Active</span>
          </div>
        </div>

        {/* ASCII art */}
        <div className="relative overflow-x-auto mb-8">
          <pre className="text-green-500 text-[10px] sm:text-xs leading-tight text-center select-none opacity-80 whitespace-pre">
{`█▀▀ █▀█ █▀▄▀█ █▀▄▀█ █ ▀█▀   █▀▀ █▀█ █▀█ █▀▀ █▀▀
█▄▄ █▄█ █ ▀ █ █ ▀ █ █  █    █▀  █▄█ █▀▄ █▄█ ██▄`}
          </pre>
        </div>

        <div className="relative text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
            Commite no passado, direto do seu terminal.
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Crie commits com datas retroativas no GitHub, GitLab ou Bitbucket. Controle total do histórico git a partir da linha de comando.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo("instalacao")}
              className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold text-sm rounded transition-colors"
            >
              Ver Documentação →
            </button>
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded px-4 py-3 text-sm text-gray-300">
              <span className="text-green-400">$</span>
              <span>pip install commitforge</span>
              <button
                onClick={() => copyToClipboard("pip install commitforge", "hero-pip")}
                className="ml-2 text-gray-500 hover:text-white transition-colors"
              >
                {copiedStates["hero-pip"] ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Terminal demo */}
        <div className="relative max-w-4xl mx-auto rounded-lg border border-gray-700 overflow-hidden shadow-2xl">
          {/* Terminal bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-700">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-xs text-gray-500">commitforge — bash</span>
          </div>

          {/* Terminal body */}
          <div className="bg-black p-5 min-h-[220px] text-sm leading-relaxed">
            {/* Output lines from previous execution */}
            {terminalLines.map((line, i) => (
              <div key={i} className={`${line.color} mb-0.5`}>{line.text}</div>
            ))}

            {/* Current prompt line */}
            <div className="flex items-start gap-2 mt-1">
              <span className="text-green-400 shrink-0">$</span>
              <span className="text-white break-all">
                {currentTyping}
                {!isExecuting && (
                  <span
                    className={`inline-block w-[2px] h-[1em] bg-white ml-0.5 align-middle ${showCursor ? "opacity-100" : "opacity-0"}`}
                  />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* TVA bottom amber glow strip */}
        <div className="relative mt-10 flex items-center justify-center gap-3 pointer-events-none select-none">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
          <span className="font-mono text-[10px] text-amber-700/60 tracking-widest uppercase">
            TemporalReset · Nexus·Event · SacredTimeline
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
        </div>

      </section>

      {/* ─── Stats Bar ─── */}
      <div className="border-y border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-400">
          {[
            { icon: <GitBranch className="w-4 h-4 text-green-400" />, text: "17 grupos semânticos" },
            { icon: <Zap className="w-4 h-4 text-yellow-400" />,      text: "5000 commits/job" },
            { icon: <Github className="w-4 h-4 text-blue-400" />,     text: "GitHub + GitLab + Bitbucket" },
            { icon: <Terminal className="w-4 h-4 text-purple-400" />, text: "Python 3.8+" },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              {icon}
              {text}
            </span>
          ))}
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            {installCount !== null ? (
              <span>
                <span className="text-amber-400 font-semibold font-mono">{installCount.toLocaleString()}</span>
                {" "}instalações
              </span>
            ) : (
              <span className="text-gray-600 animate-pulse">carregando...</span>
            )}
          </span>
        </div>
      </div>

      {/* ─── Installation ─── */}
      <section id="instalacao" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Instalar CommitForge</h2>
          <p className="text-gray-500 text-sm">Escolha o método ideal para o seu ambiente</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-gray-700 mb-0 gap-0">
            {(["curl", "docker", "macos", "linux"] as InstallTab[]).map((tab) => {
              const labels: Record<InstallTab, { label: string; icon: React.ReactNode }> = {
                curl:   { label: "curl",   icon: <Download className="w-4 h-4" /> },
                docker: { label: "Docker", icon: <DockerIcon className="w-4 h-4" /> },
                macos:  { label: "macOS",  icon: <Apple className="w-4 h-4" /> },
                linux:  { label: "Linux",  icon: <LinuxIcon className="w-4 h-4" /> },
              }
              const isActive = activeInstallTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveInstallTab(tab)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-green-500 text-green-400"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {labels[tab].icon}
                  {labels[tab].label}
                </button>
              )
            })}
          </div>

          {/* Code block */}
          <div className="rounded-b-lg border border-t-0 border-gray-700">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900">
              <span className="text-xs text-gray-500">bash</span>
              <button
                onClick={() => copyToClipboard(installContent[activeInstallTab].code, `install-${activeInstallTab}`)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
              >
                {copiedStates[`install-${activeInstallTab}`]
                  ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copiado!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
              </button>
            </div>
            <pre className="bg-black p-5 text-sm text-gray-200 overflow-x-auto whitespace-pre leading-relaxed rounded-b-lg">
              {installContent[activeInstallTab].code.split("\n").map((line, i) => {
                const isComment = line.trimStart().startsWith("#")
                return (
                  <div
                    key={i}
                    className={isComment ? "text-gray-500" : line.trim() === "" ? "" : "text-green-300"}
                  >
                    {line || "\u00A0"}
                  </div>
                )
              })}
            </pre>
          </div>

          <p className="mt-3 text-sm text-gray-500">{installContent[activeInstallTab].description}</p>
        </div>
      </section>

      {/* ─── Commit Modes ─── */}
      <section id="modos" className="px-6 py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Dois modos de commit</h2>
            <p className="text-gray-500 text-sm">Escolha a estratégia ideal para o seu caso de uso</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Modo Projeto */}
            <div className="border border-green-800 rounded-lg bg-gray-950 p-6 relative">
              <span className="absolute top-4 right-4 px-2 py-0.5 bg-green-900 border border-green-700 text-green-400 text-xs rounded">
                Recomendado
              </span>
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-white font-bold text-lg">Modo Projeto</h3>
                  <code className="text-xs text-gray-500">--modo projeto</code>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Commita arquivos reais agrupados semanticamente. 17 grupos automáticos: configuração, estilos, componentes, backend, CLI, templates, docs.
              </p>
              <div className="bg-black border border-gray-700 rounded p-4 overflow-x-auto mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">bash</span>
                  <button
                    onClick={() => copyToClipboard("commitforge commit --repo URL --year 2019 --modo projeto", "mode-projeto")}
                    className="text-gray-600 hover:text-white transition-colors"
                  >
                    {copiedStates["mode-projeto"] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <code className="text-green-300 text-xs whitespace-nowrap">
                  commitforge commit --repo URL --year 2019 --modo projeto
                </code>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                {["Arquivos reais", "17 grupos semânticos", "Branch órfão limpo", "Histórico natural"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Modo Arquivo */}
            <div className="border border-gray-700 rounded-lg bg-gray-950 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-white font-bold text-lg">Modo Arquivo</h3>
                  <code className="text-xs text-gray-500">--modo arquivo</code>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Cria commits modificando um arquivo de log. Ideal para preencher gráfico de contribuições com quantidade exata de commits.
              </p>
              <div className="bg-black border border-gray-700 rounded p-4 overflow-x-auto mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">bash</span>
                  <button
                    onClick={() => copyToClipboard("commitforge commit --repo URL --year 2020 --modo arquivo --commits-por-dia 3", "mode-arquivo")}
                    className="text-gray-600 hover:text-white transition-colors"
                  >
                    {copiedStates["mode-arquivo"] ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <code className="text-green-300 text-xs whitespace-nowrap">
                  commitforge commit --repo URL --year 2020 --modo arquivo --commits-por-dia 3
                </code>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                {["Controle exato", "N commits/dia", "Pular fins de semana", "Mensagem customizada"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLI Reference ─── */}
      <section id="cli" className="px-6 py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Referência da CLI</h2>
            <p className="text-gray-500 text-sm">Todos os comandos e flags disponíveis</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* CLI subcommands */}
            <div>
              <h3 className="text-gray-300 text-sm font-bold mb-3 uppercase tracking-wider">Comandos CLI</h3>
              <div className="bg-black border border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Terminal className="w-3.5 h-3.5" />
                    bash
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `commitforge commit    # Criar commits retroativos
commitforge grupos    # Listar grupos de arquivos
commitforge preview   # Prévia de commits
commitforge validar-token  # Validar token GitHub
commitforge historico # Ver histórico de jobs
commitforge servidor  # Iniciar interface web`,
                      "cli-subcommands"
                    )}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    {copiedStates["cli-subcommands"]
                      ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copiado!</>
                      : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                  </button>
                </div>
                <div className="p-5 text-sm space-y-1 overflow-x-auto">
                  {[
                    { cmd: "commitforge commit",        comment: "Criar commits retroativos" },
                    { cmd: "commitforge grupos",        comment: "Listar grupos de arquivos" },
                    { cmd: "commitforge preview",       comment: "Prévia de commits" },
                    { cmd: "commitforge validar-token", comment: "Validar token GitHub" },
                    { cmd: "commitforge historico",     comment: "Ver histórico de jobs" },
                    { cmd: "commitforge servidor",      comment: "Iniciar interface web" },
                  ].map(({ cmd, comment }) => (
                    <div key={cmd} className="flex gap-4 whitespace-nowrap">
                      <span className="text-green-300">{cmd}</span>
                      <span className="text-gray-600"># {comment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Flags table */}
            <div>
              <h3 className="text-gray-300 text-sm font-bold mb-3 uppercase tracking-wider">Flags principais</h3>
              <div className="bg-black border border-gray-700 rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-900">
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Flag</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Padrão</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cliFlags.map((row, i) => (
                      <tr key={row.flag} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? "bg-black" : "bg-gray-950"}`}>
                        <td className="px-4 py-2.5">
                          <code className="text-yellow-300 text-xs">{row.flag}</code>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-blue-400 text-xs">{row.type}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <code className="text-gray-500 text-xs">{row.default}</code>
                        </td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="como-funciona" className="px-6 py-20 border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Como funciona</h2>
            <p className="text-gray-500 text-sm">Cinco etapas para reescrever seu histórico git</p>
          </div>

          <div className="max-w-2xl mx-auto relative">
            <div className="absolute left-5 top-6 bottom-6 w-px bg-gray-800 hidden sm:block" />
            <div className="space-y-8">
              {howItWorks.map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-5 relative">
                  <div className="shrink-0 w-10 h-10 rounded-full border border-gray-700 bg-black flex items-center justify-center text-green-400 text-xs font-bold z-10">
                    {step}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platforms ─── */}
      <section id="plataformas" className="px-6 py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Plataformas suportadas</h2>
            <p className="text-gray-500 text-sm">Compatível com qualquer serviço Git via HTTPS ou SSH</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {platforms.map(({ name, url }) => (
              <div
                key={name}
                className="border border-gray-700 rounded-lg bg-gray-950 p-4 flex flex-col items-center gap-3 hover:border-green-700 transition-colors text-center"
              >
                <Check className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-white text-sm font-medium">{name}</div>
                  <div className="text-gray-600 text-xs mt-0.5">{url}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Creator Section ─── */}
      <section className="border-t border-gray-800 px-6 py-20 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs text-green-500 font-mono tracking-widest uppercase">Criado por</span>
            <h2 className="text-3xl font-bold mt-2 text-white">Estevam Souza</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Photo with animated rings */}
            <div className="relative shrink-0 flex items-center justify-center w-52 h-52">
              {/* Outer pulsing ring */}
              <span className="absolute inset-0 rounded-full border border-green-500/20 animate-ping" style={{ animationDuration: "3s" }} />
              {/* Middle ring */}
              <span className="absolute inset-3 rounded-full border border-green-500/30 animate-pulse" style={{ animationDuration: "2s" }} />
              {/* Inner static ring */}
              <span className="absolute inset-6 rounded-full border border-green-500/50" />
              {/* Photo */}
              <div className="absolute inset-8 rounded-full overflow-hidden ring-2 ring-green-500/60 ring-offset-2 ring-offset-black shadow-lg shadow-green-500/20">
                <img
                  src="/profile.jpeg"
                  alt="Estevam Souza"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-0.5 rounded-full shadow-md shadow-green-500/40 whitespace-nowrap">
                Open Source Dev
              </span>
            </div>

            {/* Info card */}
            <div className="flex-1 space-y-5">
              <div className="border border-gray-800 bg-gray-950 rounded-lg p-5 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-gray-600 text-xs ml-2">estevam@commitforge ~ whoami</span>
                </div>
                <div className="space-y-2 text-gray-300">
                  <div><span className="text-green-400">nome</span><span className="text-gray-600">:</span>       <span className="text-white">Estevam Souza</span></div>
                  <div><span className="text-green-400">cargo</span><span className="text-gray-600">:</span>      <span className="text-yellow-300">Engenheiro de Dados</span></div>
                  <div><span className="text-green-400">foco</span><span className="text-gray-600">:</span>       <span className="text-blue-300">Python · TypeScript · DevTools</span></div>
                  <div><span className="text-green-400">github</span><span className="text-gray-600">:</span>     <a href="https://github.com/estevam5s" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@estevam5s</a></div>
                  <div><span className="text-green-400">linkedin</span><span className="text-gray-600">:</span>   <a href="https://www.linkedin.com/in/estevam-souza" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">in/estevam-souza</a></div>
                  <div className="pt-2 border-t border-gray-800 text-gray-500 text-xs leading-relaxed">
                    Construiu o CommitForge para resolver o problema real de registrar
                    histórico de projetos legados no Git com datas precisas e semântica de commits profissional.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/estevam5s"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:border-white hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-white/5"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/estevam5s"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-blue-800/50 rounded-lg text-sm text-blue-400 hover:border-blue-500 hover:text-blue-300 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
                <a
                  href="https://github.com/estevam5s/commitforge"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-green-800/50 rounded-lg text-sm text-green-400 hover:border-green-500 hover:text-green-300 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10"
                >
                  <Terminal className="w-4 h-4" />
                  Ver Repositório
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feedback Section ─── */}
      <FeedbackSection />

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-800 bg-gray-950">
        {/* Top grid */}
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-white font-bold tracking-tight">CommitForge</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Commits retroativos no Git com semântica profissional. Suporta GitHub, GitLab, Bitbucket e mais.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>v1.0.0 — estável</span>
            </div>
          </div>

          {/* Produto */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Produto</h4>
            <ul className="space-y-2 text-gray-500">
              <li><button onClick={() => scrollTo("instalacao")} className="hover:text-white transition-colors">Instalação</button></li>
              <li><button onClick={() => scrollTo("modos")} className="hover:text-white transition-colors">Modos de Commit</button></li>
              <li><button onClick={() => scrollTo("cli")} className="hover:text-white transition-colors">Referência CLI</button></li>
              <li><button onClick={() => scrollTo("como-funciona")} className="hover:text-white transition-colors">Como Funciona</button></li>
              <li><button onClick={() => scrollTo("plataformas")} className="hover:text-white transition-colors">Plataformas</button></li>
            </ul>
          </div>

          {/* Recursos */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Recursos</h4>
            <ul className="space-y-2 text-gray-500">
              <li><a href="/docs" className="hover:text-white transition-colors">Documentação</a></li>
              <li><a href="/git" className="hover:text-white transition-colors">Guia Git</a></li>
              <li><a href="/changelog" className="hover:text-white transition-colors">Changelog</a></li>
              <li><a href="/docs" className="hover:text-white transition-colors">API REST</a></li>
              <li>
                <a href="https://github.com/estevam5s/commitforge/blob/main/cli-commit/DOCS.md" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Guia Passo a Passo
                </a>
              </li>
              <li>
                <a href="/changelog" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Changelog
                </a>
              </li>
              <li>
                <a href="https://github.com/estevam5s/commitforge/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Reportar Bug
                </a>
              </li>
            </ul>
          </div>

          {/* Instalar */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Instalar</h4>
            <ul className="space-y-2 text-gray-500">
              <li className="font-mono text-xs">
                <button
                  onClick={() => copyToClipboard("curl -fsSL https://raw.githubusercontent.com/estevam5s/commitforge/main/cli-commit/install.sh | bash", "footer-curl")}
                  className="flex items-center gap-1.5 hover:text-green-400 transition-colors group"
                >
                  {copiedStates["footer-curl"] ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  curl install
                </button>
              </li>
              <li className="font-mono text-xs">
                <button
                  onClick={() => copyToClipboard("pip install commitforge", "footer-pip")}
                  className="flex items-center gap-1.5 hover:text-green-400 transition-colors group"
                >
                  {copiedStates["footer-pip"] ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  pip install
                </button>
              </li>
              <li className="font-mono text-xs">
                <button
                  onClick={() => copyToClipboard("docker pull ghcr.io/estevam5s/commitforge:latest", "footer-docker")}
                  className="flex items-center gap-1.5 hover:text-green-400 transition-colors group"
                >
                  {copiedStates["footer-docker"] ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  docker pull
                </button>
              </li>
              <li className="font-mono text-xs">
                <button
                  onClick={() => copyToClipboard("brew install commitforge", "footer-brew")}
                  className="flex items-center gap-1.5 hover:text-green-400 transition-colors group"
                >
                  {copiedStates["footer-brew"] ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  brew install
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 px-6 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>© 2026 CommitForge</span>
              <span className="text-gray-800">·</span>
              <span>MIT License</span>
              <span className="text-gray-800">·</span>
              <span>Criado por <a href="https://github.com/estevam5s" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Estevam Souza</a></span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/estevam5s/commitforge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
              <a href="/docs" className="hover:text-white transition-colors">Docs</a>
              <a href="https://github.com/estevam5s/commitforge/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Issues</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
