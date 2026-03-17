"use client"

import { useState } from "react"
import {
  Terminal,
  GitBranch,
  ChevronRight,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Code,
  Cpu,
  Globe,
  Shield,
  BookOpen,
  Atom,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TabId = "v1" | "v2"

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------
function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    green:  "bg-green-900/60  text-green-300  border-green-700",
    blue:   "bg-blue-900/60   text-blue-300   border-blue-700",
    yellow: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
    red:    "bg-red-900/60    text-red-300    border-red-700",
    purple: "bg-purple-900/60 text-purple-300 border-purple-700",
    cyan:   "bg-cyan-900/60   text-cyan-300   border-cyan-700",
    gray:   "bg-gray-800      text-gray-300   border-gray-600",
  }
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs font-mono ${colors[color] ?? colors.gray}`}>
      {children}
    </span>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded bg-gray-900 border border-gray-700 px-1.5 py-0.5 text-xs font-mono text-gray-400">
      {children}
    </span>
  )
}

function ChangeEntry({
  type,
  text,
}: {
  type: "add" | "fix" | "improve" | "break" | "security"
  text: string
}) {
  const cfg = {
    add:     { label: "+ ADD",     cls: "text-green-400"  },
    fix:     { label: "  FIX",     cls: "text-blue-400"   },
    improve: { label: "~ UPD",     cls: "text-yellow-400" },
    break:   { label: "! BRK",     cls: "text-red-400"    },
    security:{ label: "⚑ SEC",    cls: "text-purple-400" },
  }
  const { label, cls } = cfg[type]
  return (
    <li className="flex items-start gap-3 py-1.5 border-b border-gray-900 last:border-0">
      <span className={`shrink-0 font-mono text-xs mt-0.5 w-12 ${cls}`}>{label}</span>
      <span className="text-gray-300 text-sm leading-relaxed">{text}</span>
    </li>
  )
}

function Section({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
        <Icon size={14} className="text-gray-500" />
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</span>
      </div>
      {children}
    </div>
  )
}

function MathBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 rounded border border-indigo-900/60 bg-indigo-950/30 p-4 font-mono text-sm text-indigo-300 overflow-x-auto">
      {children}
    </div>
  )
}

function QuantumStep({
  n,
  title,
  children,
  warning,
}: {
  n: number
  title: string
  children: React.ReactNode
  warning?: string
}) {
  return (
    <div className="relative pl-10 pb-8 border-l border-gray-800 last:border-0 last:pb-0">
      {/* Step circle */}
      <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-black border border-purple-700 flex items-center justify-center text-purple-400 font-mono text-xs font-bold">
        {String(n).padStart(2, "0")}
      </div>
      <h4 className="font-mono text-sm font-bold text-white mb-2">{title}</h4>
      <div className="text-gray-400 text-sm leading-relaxed space-y-2">{children}</div>
      {warning && (
        <div className="mt-3 flex items-start gap-2 rounded border border-yellow-800/60 bg-yellow-950/30 p-3 text-xs text-yellow-300">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          {warning}
        </div>
      )}
    </div>
  )
}

function SpecTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="my-3 overflow-x-auto rounded border border-gray-800">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="bg-gray-950">
            <th className="px-4 py-2 text-left text-gray-500 font-semibold border-b border-gray-800">Componente</th>
            <th className="px-4 py-2 text-left text-gray-500 font-semibold border-b border-gray-800">Especificação</th>
            <th className="px-4 py-2 text-left text-gray-500 font-semibold border-b border-gray-800">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([comp, spec, status], i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-gray-900/40" : "bg-black/40"}>
              <td className="px-4 py-2 text-purple-300">{comp}</td>
              <td className="px-4 py-2 text-gray-300">{spec}</td>
              <td className="px-4 py-2">
                <Badge color={status === "Disponível" ? "green" : status === "Em pesquisa" ? "yellow" : status === "Teórico" ? "purple" : "red"}>
                  {status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// V1 changelog content
// ---------------------------------------------------------------------------
function V1Content() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-10 p-6 rounded-xl border border-green-800/50 bg-green-950/10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="font-mono text-3xl font-black text-white">v1.0.0</span>
          <Badge color="green">stable</Badge>
          <Badge color="gray">2024-03-17</Badge>
          <Tag>CLI</Tag>
          <Tag>Python</Tag>
          <Tag>Flask</Tag>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Lançamento inicial do CommitForge — a ferramenta CLI open-source para criar commits retroativos
          no Git com semântica profissional, suporte a múltiplas plataformas e API REST integrada.
        </p>
      </div>

      {/* Core CLI */}
      <Section title="CLI — forge.py" icon={Terminal}>
        <ul className="space-y-0.5">
          <ChangeEntry type="add" text="Comando commit — cria commits retroativos com datas específicas via GIT_AUTHOR_DATE e GIT_COMMITTER_DATE" />
          <ChangeEntry type="add" text="17 grupos semânticos de arquivos (configs, estilos, backend, frontend, CLI, docs, infra, testes, etc.)" />
          <ChangeEntry type="add" text="Modo projeto — agrupa e distribui arquivos reais em commits semanticamente coerentes" />
          <ChangeEntry type="add" text="Modo arquivo — preenche grade de atividade com N commits por dia em data.txt" />
          <ChangeEntry type="add" text="Comando preview — simula commits sem executar nada" />
          <ChangeEntry type="add" text="Comando grupos — lista como arquivos do repo serão agrupados" />
          <ChangeEntry type="add" text="Comando historico — lista jobs anteriores persistidos em JSON" />
          <ChangeEntry type="add" text="Comando validar-token — verifica token GitHub/GitLab via API" />
          <ChangeEntry type="add" text="Comando lote — processa múltiplos repositórios via arquivo JSON" />
          <ChangeEntry type="add" text="Comando servidor — inicia Flask com interface web" />
          <ChangeEntry type="add" text="Comando ajuda — help colorido com Rich (tabelas, painéis, exemplos)" />
          <ChangeEntry type="add" text="Comando desinstalar — remove completamente o CommitForge do sistema" />
          <ChangeEntry type="add" text="Comando info — exibe versão, grupos semânticos e informações do criador" />
          <ChangeEntry type="add" text="Auto-detecção de e-mail via GET /user/emails da API GitHub para commits aparecerem no gráfico de contribuições" />
          <ChangeEntry type="add" text="Suporte a skip_weekends, random_times, commits_por_dia, branch customizado" />
        </ul>
      </Section>

      {/* Backend */}
      <Section title="API REST — app.py" icon={Code}>
        <ul className="space-y-0.5">
          <ChangeEntry type="add" text="POST /api/start-job — inicia job de commits retroativos com ID UUID" />
          <ChangeEntry type="add" text="GET /api/job-status/:id — status em tempo real com progresso %" />
          <ChangeEntry type="add" text="POST /api/cancel-job/:id — cancelamento de job ativo" />
          <ChangeEntry type="add" text="GET /api/jobs — lista todos os jobs ativos e finalizados" />
          <ChangeEntry type="add" text="GET /api/preview — pré-visualização de commits sem executar" />
          <ChangeEntry type="add" text="POST /api/validate-token — validação de token via GitHub API" />
          <ChangeEntry type="add" text="GET /api/health — uptime, versão e contagem de jobs ativos" />
          <ChangeEntry type="add" text="GET /api/stats — estatísticas da sessão e histórico persistido" />
          <ChangeEntry type="add" text="GET /api/groups — lista todos os 17 grupos semânticos" />
          <ChangeEntry type="add" text="GET /api/logs/:job_id — log de execução linha a linha por job" />
          <ChangeEntry type="add" text="DELETE /api/delete-job/:id — remove job da memória" />
          <ChangeEntry type="add" text="GET /api/history — histórico de jobs finalizados (limit param)" />
          <ChangeEntry type="add" text="CORS automático via @app.after_request em todas as rotas" />
          <ChangeEntry type="add" text="Persistência de jobs em jobs_history.json entre reinicializações" />
        </ul>
      </Section>

      {/* Frontend */}
      <Section title="Site & Documentação" icon={Globe}>
        <ul className="space-y-0.5">
          <ChangeEntry type="add" text="Landing page Next.js 15 com 9 seções: Hero, Instalação, Modos, CLI, Como Funciona, Plataformas, Criador, Footer" />
          <ChangeEntry type="add" text="Rota /docs — documentação completa com sidebar estável (sem reset de scroll)" />
          <ChangeEntry type="add" text="Rota /git — guia completo de Git do básico ao avançado (3000+ linhas)" />
          <ChangeEntry type="add" text="Rota /changelog — este documento" />
          <ChangeEntry type="add" text="PWA completo — manifest.json, service worker, installable em mobile/desktop" />
          <ChangeEntry type="add" text="SEO 100% — OG tags, Twitter Card, JSON-LD, sitemap.xml, robots.txt" />
          <ChangeEntry type="add" text="OG image dinâmica via app/opengraph-image.tsx (Next.js Edge Runtime)" />
          <ChangeEntry type="add" text="Navegação sem # na URL — scroll suave via scrollIntoView()" />
          <ChangeEntry type="add" text="Seção criador com foto local /profile.jpeg e animações de rings" />
          <ChangeEntry type="add" text="Footer com 4 colunas, botões de cópia e links funcionais" />
        </ul>
      </Section>

      {/* Installation */}
      <Section title="Instalação" icon={Zap}>
        <ul className="space-y-0.5">
          <ChangeEntry type="add" text="Script install.sh — instalação via curl com venv em ~/.commitforge" />
          <ChangeEntry type="add" text="Suporte a Docker — ghcr.io/estevam5s/commitforge:latest" />
          <ChangeEntry type="add" text="Homebrew, apt, dnf, AUR, pip" />
          <ChangeEntry type="add" text="Windows: instalação via pip + git bash" />
        </ul>
      </Section>

      {/* Compat */}
      <Section title="Compatibilidade" icon={CheckCircle}>
        <ul className="space-y-0.5">
          <ChangeEntry type="add" text="GitHub, GitLab, Bitbucket, Gitea, Azure DevOps, SourceForge, Codeberg" />
          <ChangeEntry type="add" text="macOS (Intel + Apple Silicon), Linux (Debian, Arch, Fedora), Windows 10+" />
          <ChangeEntry type="add" text="Python 3.8 — 3.13" />
          <ChangeEntry type="add" text="git 2.30+" />
        </ul>
      </Section>

      {/* Security */}
      <Section title="Segurança" icon={Shield}>
        <ul className="space-y-0.5">
          <ChangeEntry type="security" text="Token GitHub nunca é salvo em disco — apenas em memória durante execução" />
          <ChangeEntry type="security" text="URLs autenticadas removidas do git remote após push" />
          <ChangeEntry type="security" text="Repositório clonado em diretório temporário e removido após execução" />
        </ul>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// V2 changelog content — Quantum Time Travel
// ---------------------------------------------------------------------------
function V2Content() {
  const [activeTab, setActiveTab] = useState<"overview" | "physics" | "hardware" | "setup" | "math" | "risks">("overview")

  const tabs = [
    { id: "overview" as const,  label: "Visão Geral",     icon: BookOpen },
    { id: "physics"  as const,  label: "Física Quântica", icon: Atom },
    { id: "math"     as const,  label: "Matemática",      icon: Code },
    { id: "hardware" as const,  label: "Hardware",        icon: Cpu },
    { id: "setup"    as const,  label: "Passo a Passo",   icon: GitBranch },
    { id: "risks"    as const,  label: "Riscos",          icon: AlertTriangle },
  ]

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8 p-6 rounded-xl border border-purple-800/50 bg-purple-950/10 relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-mono text-3xl font-black text-white">v2.0.0</span>
            <Badge color="purple">theoretical</Badge>
            <Badge color="yellow">in-research</Badge>
            <Badge color="gray">~2047 (estimado)</Badge>
          </div>
          <p className="text-purple-300 text-sm leading-relaxed font-mono">
            CommitForge Physical Edition — viagem temporal para desenvolvedores.
            Baseado em relatividade geral, mecânica quântica, geometria diferencial e
            computação quântica de alta temperatura. <span className="text-yellow-400">Hipotético.</span>
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-mono">
            <AlertTriangle size={12} className="text-yellow-500" />
            Este documento descreve tecnologias hipotéticas com base em física teórica real.
            Nenhum programador foi dobrado no espaço-tempo durante a elaboração deste changelog.
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1 mb-8 p-1 rounded-lg bg-gray-950 border border-gray-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-mono text-xs transition-all ${
              activeTab === id
                ? "bg-purple-900/60 text-purple-200 border border-purple-700"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "overview" && (
        <div>
          <Section title="O que é a v2.0.0" icon={BookOpen}>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              A versão 2.0.0 do CommitForge expande o conceito além do software: em vez de apenas
              simular datas de commits, a edição física permite que o desenvolvedor{" "}
              <span className="text-white font-semibold">viaje fisicamente no espaço-tempo</span>{" "}
              para commitar código na data correta — garantindo autenticidade absoluta no histórico git.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              A tecnologia baseia-se na manipulação de{" "}
              <span className="text-purple-300">Curvas Temporais Fechadas (CTCs)</span>, previstas
              matematicamente na Relatividade Geral de Einstein, combinadas com{" "}
              <span className="text-cyan-300">computação quântica</span> de alta temperatura para
              estabilização do ponto de retorno.
            </p>
          </Section>

          <Section title="Novas funcionalidades v2.0.0" icon={Zap}>
            <ul className="space-y-0.5">
              <ChangeEntry type="add" text="forge commit --travel — viagem física ao ponto temporal do commit antes da execução" />
              <ChangeEntry type="add" text="forge timeline list — lista todos os eventos do espaço-tempo associados ao repositório" />
              <ChangeEntry type="add" text="forge paradox check — verifica inconsistências temporais antes do push" />
              <ChangeEntry type="add" text="forge rollback --universe — desfaz alterações em universos paralelos (requer acesso ao Many-Worlds API)" />
              <ChangeEntry type="add" text="forge quantum diff — compara repositório atual com versão em universo paralelo adjacente" />
              <ChangeEntry type="add" text="Suporte a viagens para o futuro (modo --future) com campo de probabilidade quântica para commits hipotéticos" />
              <ChangeEntry type="add" text="Interface holográfica substituindo terminal convencional (requer projetor de luz coerente ≥ 50.000 lm)" />
              <ChangeEntry type="improve" text="Performance de commits 299.792.458x mais rápida (velocidade da luz no vácuo)" />
              <ChangeEntry type="improve" text="GIT_AUTHOR_DATE agora aceita datas no formato ISO 8601 extendido com coordenadas de Minkowski" />
              <ChangeEntry type="break" text="BREAKING: Python 3.8 não mais suportado — requer Python Quântico 1.0 rodando em qubits" />
              <ChangeEntry type="break" text="BREAKING: GitHub token substituído por assinatura de curva elíptica em dimensão 11 (Teoria M)" />
            </ul>
          </Section>

          <Section title="Requisitos do sistema (físicos)" icon={Cpu}>
            <ul className="space-y-1 text-sm text-gray-400">
              {[
                ["CPU Quântica",        "≥ 10.000 qubits estáveis (temperatura: 15 mK)"],
                ["Gerador de Energia",  "Reator de fusão a plasma D-T, 500 MW mínimo"],
                ["Matéria Exótica",     "≥ 1 kg com densidade de energia negativa (−10⁹⁶ J/m³)"],
                ["Campo de Casimir",    "Placas paralelas separadas por ≤ 10 nm"],
                ["Processador Temporal","ASIC dedicado: 128 TQ-FLOPS (Tera-Quantum)"],
                ["Memória",             "1 yottabyte de RAM quântica coerente"],
                ["SO",                  "QuantumOS 2.0 + CommitForge Physical Runtime"],
              ].map(([label, value]) => (
                <li key={label} className="flex items-start gap-3">
                  <ChevronRight size={14} className="mt-0.5 shrink-0 text-purple-600" />
                  <span>
                    <span className="text-purple-300 font-mono">{label}:</span>{" "}
                    <span>{value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {/* ── Physics ── */}
      {activeTab === "physics" && (
        <div>
          <Section title="Fundamentos de Física Teórica" icon={Atom}>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              A v2.0.0 baseia-se em três pilares físicos para possibilitar a viagem temporal controlada:
            </p>

            <h3 className="text-white font-mono font-bold text-sm mb-3">
              1. Curvas Temporais Fechadas (CTCs) — Gödel &amp; Kerr
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              Em 1949, Kurt Gödel demonstrou que as equações de campo de Einstein admitem soluções com CTCs —
              trajetórias no espaço-tempo que retornam ao ponto de origem no tempo. A solução de Kerr (1963)
              para buracos negros em rotação possui um anel de singularidade que, teoricamente, permite passagem
              sem destruição da matéria.
            </p>
            <div className="rounded border border-gray-800 bg-gray-950 p-4 text-xs font-mono text-gray-300 mb-4">
              <div className="text-gray-500 mb-2"># Solução de Kerr para métrica espaço-tempo rotacional</div>
              <div className="text-green-400">ds² = -(1 - r_s·r/ρ²)c²dt² - (2r_s·r·a·sin²θ/ρ²)c·dt·dφ</div>
              <div className="text-green-400">    + (ρ²/Δ)dr² + ρ²dθ² + (r²+a²+r_s·r·a²·sin²θ/ρ²)sin²θ·dφ²</div>
              <div className="mt-2 text-gray-600"># onde: ρ² = r² + a²cos²θ, Δ = r² - r_s·r + a²</div>
              <div className="text-gray-600"># a = J/(Mc) — parâmetro de rotação específico do buraco negro</div>
            </div>

            <h3 className="text-white font-mono font-bold text-sm mb-3">
              2. Mecânica Quântica — Superposição e Entrelaçamento
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              O protocolo de viagem usa{" "}
              <span className="text-cyan-300">entrelaçamento quântico EPR</span> para sincronizar
              o estado quântico do desenvolvedor entre o tempo de partida e chegada, prevenindo
              decoerência durante a travessia da CTC. A função de onda do viajante é descrita por:
            </p>
            <div className="rounded border border-gray-800 bg-gray-950 p-4 text-xs font-mono text-gray-300 mb-4">
              <div className="text-purple-400">|Ψ_traveler⟩ = α|past⟩ + β|future⟩</div>
              <div className="text-gray-600 mt-1"># Colapso controlado via medição de Heisenberg-limited</div>
              <div className="text-gray-600"># Precisão temporal: ΔE·Δt ≥ ℏ/2  →  Δt_min ≈ 5.39×10⁻⁴⁴ s (tempo de Planck)</div>
              <div className="text-cyan-400 mt-2">|commit_state⟩ = ∑ᵢ cᵢ|date_i, code_i, author_i⟩</div>
            </div>

            <h3 className="text-white font-mono font-bold text-sm mb-3">
              3. Energia de Casimir e Matéria Exótica
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">
              Para criar e sustentar a wormhole da CTC, é necessária matéria com densidade de
              energia negativa — o{" "}
              <span className="text-yellow-300">efeito Casimir</span> provê essa energia em escala
              nanométrica. Para viagem macroscópica, precisa-se de amplificação quântica:
            </p>
            <div className="rounded border border-gray-800 bg-gray-950 p-4 text-xs font-mono text-gray-300 mb-4">
              <div className="text-yellow-400"># Pressão de Casimir entre placas paralelas</div>
              <div className="text-yellow-300">P_Casimir = -π²ℏc / (240·d⁴)</div>
              <div className="text-gray-600 mt-1"># d = separação entre placas</div>
              <div className="text-yellow-400 mt-2"># Energia negativa necessária para wormhole macroscópica</div>
              <div className="text-yellow-300">E_exotic ≈ -c⁴·r_throat / (4G) × (1/l_Planck)</div>
              <div className="text-gray-600"># r_throat = raio da garganta da wormhole (mínimo: tamanho de Planck)</div>
            </div>

            <h3 className="text-white font-mono font-bold text-sm mb-3">
              4. Proteção Cronológica — Hawking (1992)
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Stephen Hawking propôs a{" "}
              <span className="text-red-300">Conjectura de Proteção Cronológica</span>: flutuações
              quânticas de vácuo próximas ao horizonte de Cauchy da CTC crescem infinitamente,
              destruindo a wormhole antes que qualquer paradoxo ocorra. A v2.0.0 contorna isso
              usando um{" "}
              <span className="text-green-300">supressor de retroação quântica</span> — campo de
              interferência destrutiva aplicado ao tensor de estresse-energia local.
            </p>
          </Section>
        </div>
      )}

      {/* ── Math ── */}
      {activeTab === "math" && (
        <div>
          <Section title="Matemática da Viagem Temporal" icon={Code}>

            <h3 className="text-white font-mono font-bold text-sm mb-2">
              Tensor de Curvatura de Riemann
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              A curvatura do espaço-tempo na região da CTC é descrita pelo tensor de Riemann:
            </p>
            <MathBlock>
              <div className="text-indigo-300">R^ρ_σμν = ∂_μΓ^ρ_νσ - ∂_νΓ^ρ_μσ + Γ^ρ_μλΓ^λ_νσ - Γ^ρ_νλΓ^λ_μσ</div>
              <div className="text-gray-500 mt-1">{`// Γ^ρ_μν = símbolos de Christoffel (conexão de Levi-Civita)`}</div>
              <div className="text-gray-500">{`// Γ^σ_μν = ½g^σρ(∂_μg_νρ + ∂_νg_μρ - ∂_ρg_μν)`}</div>
            </MathBlock>

            <h3 className="text-white font-mono font-bold text-sm mb-2 mt-6">
              Equações de Campo de Einstein
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Para criar a geometria necessária à CTC, resolve-se as equações de campo:
            </p>
            <MathBlock>
              <div className="text-indigo-300">G_μν + Λg_μν = (8πG/c⁴) T_μν</div>
              <div className="text-gray-500 mt-1">{`// G_μν = R_μν - ½Rg_μν  (tensor de Einstein)`}</div>
              <div className="text-gray-500">{`// T_μν = tensor de energia-momento (matéria exótica)`}</div>
              <div className="text-gray-500">{`// Λ = constante cosmológica (≈ 1.1056×10⁻⁵² m⁻²)`}</div>
              <div className="text-gray-500">{`// Para CTC: T_μν deve violar NEC (Null Energy Condition)`}</div>
            </MathBlock>

            <h3 className="text-white font-mono font-bold text-sm mb-2 mt-6">
              Horizonte de Cauchy e Estabilidade
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              O horizonte de Cauchy H⁺ delimita a região causal da CTC. A condição de
              estabilidade requer que a expansão θ do congruente nulo seja não-negativa:
            </p>
            <MathBlock>
              <div className="text-indigo-300">dθ/dλ = -Rμν k^μ k^ν - σ_μν σ^μν + ω_μν ω^μν - θ²/2</div>
              <div className="text-gray-500 mt-1">{`// k^μ = vetor nulo tangente às geodésicas`}</div>
              <div className="text-gray-500">{`// σ_μν = tensor de cisalhamento`}</div>
              <div className="text-gray-500">{`// ω_μν = tensor de vorticidade`}</div>
              <div className="text-cyan-400 mt-2">{`// Equação de Raychaudhuri — condição necessária para wormhole estável:`}</div>
              <div className="text-cyan-300">Rμν k^μ k^ν ≤ 0  ⟹  matéria exótica obrigatória</div>
            </MathBlock>

            <h3 className="text-white font-mono font-bold text-sm mb-2 mt-6">
              Cálculo de Coordenadas de Destino
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Para calcular o tensor de translação temporal até a data do commit:
            </p>
            <MathBlock>
              <div className="text-indigo-300">Δτ = ∫√|g_tt + 2g_ti v^i + g_ij v^i v^j| dt</div>
              <div className="text-gray-500 mt-1">{`// τ = tempo próprio do viajante`}</div>
              <div className="text-gray-500">{`// v^i = velocidade espacial normalizada pela c`}</div>
              <div className="text-cyan-400 mt-2">{`# Implementação em Python Quântico`}</div>
              <div className="text-green-400">{"from quantum_spacetime import MinkowskiCoord, riemann_tensor"}</div>
              <div className="text-green-400">{"target = MinkowskiCoord(t='2020-03-15T10:00:00Z', x=0, y=0, z=0)"}</div>
              <div className="text-green-400">{"path = ctc_solver.compute_geodesic(origin=now(), destination=target)"}</div>
              <div className="text-green-400">{"forge.commit(repo=..., travel_path=path, year=2020)"}</div>
            </MathBlock>

            <h3 className="text-white font-mono font-bold text-sm mb-2 mt-6">
              Paradoxo de Deutsch — Consistência Quântica
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              David Deutsch (1991) mostrou que a mecânica quântica resolve paradoxos temporais
              naturalmente via <span className="text-purple-300">estados mistos de densidade ρ</span>:
            </p>
            <MathBlock>
              <div className="text-indigo-300">ρ_out = Tr_A [U (ρ_in ⊗ ρ_CTC) U†]</div>
              <div className="text-gray-500 mt-1">{`// ρ_CTC = estado quântico do loop temporal`}</div>
              <div className="text-gray-500">{`// U = unitário de evolução quântica`}</div>
              <div className="text-gray-500">{`// Solução D-CTC: ρ_CTC = Tr_B[U(ρ_in ⊗ ρ_CTC)U†]`}</div>
              <div className="text-cyan-400 mt-2">{`// CommitForge v2 resolve esta equação de ponto fixo`}</div>
              <div className="text-cyan-400">{`// antes de cada commit para garantir consistência histórica`}</div>
            </MathBlock>
          </Section>
        </div>
      )}

      {/* ── Hardware ── */}
      {activeTab === "hardware" && (
        <div>
          <Section title="Especificações de Hardware" icon={Cpu}>
            <SpecTable rows={[
              ["Processador Quântico",    "IBM Quantum Condor — 1.121 qubits supercondutores @ 15 mK",    "Em pesquisa"],
              ["Amplificador de Casimir", "Nanocavidade de ouro — gap 5 nm, área 1 m², pressão negativa −10⁻³ Pa", "Teórico"],
              ["Gerador de Wormhole",     "Tokamak compacto + bobinas HTS de NbTi @ 4K, 15 T",           "Em pesquisa"],
              ["Matéria Exótica",         "Condensado de Bose-Einstein de átomo de Rb-87 em campo zero",  "Teórico"],
              ["Supressor de Hawking",    "Array de 10⁶ lasers de femtossegundo sincronizados (Ti:Sapphire, 800 nm)", "Em pesquisa"],
              ["Memória Quântica",        "Cristal de Er³⁺:Y₂SiO₅ dopado — coerência T₂ > 1 ms @ 4K",   "Disponível"],
              ["Barramento Temporal",     "Cabo de fibra óptica torcida em topologia de nó de trefoil",   "Teórico"],
              ["Interface Holográfica",   "Projetor VCSEL 532 nm, 50.000 lm, modulação espacial de luz",  "Em pesquisa"],
              ["Fonte de Energia",        "ITER-class tokamak, Q≥10, potência de fusão 500 MW",           "Em pesquisa"],
              ["Sistema de Resfriamento", "Diluição criostática He-3/He-4, T_base = 10 mK",              "Disponível"],
              ["Controlador de Geodésica","FPGA de 7 nm com 128 núcleos de álgebra tensorial",            "Disponível"],
              ["Escudo Gravitacional",    "Metamaterial de índice negativo, ε<0 e μ<0, banda: DC-1 THz",  "Teórico"],
            ]} />

            <div className="mt-6 rounded border border-red-800/50 bg-red-950/20 p-4 text-sm text-red-300">
              <div className="flex items-center gap-2 mb-2 font-mono font-bold">
                <AlertTriangle size={14} />
                AVISO DE SEGURANÇA — NÍVEL 5
              </div>
              <ul className="space-y-1 text-xs">
                <li>• O gerador de wormhole deve ser operado a no mínimo 500m de áreas habitadas</li>
                <li>• Matéria exótica em contato com matéria normal aniquila ambas com E = mc² × (N_Avogadro)</li>
                <li>• Falha no supressor de Hawking pode causar colapso gravitacional local (Schwarzschild r_s = 2GM/c²)</li>
                <li>• Não tente commitar em datas anteriores ao Big Bang (t &lt; 10⁻⁴³ s)</li>
              </ul>
            </div>
          </Section>
        </div>
      )}

      {/* ── Step-by-step ── */}
      {activeTab === "setup" && (
        <div>
          <Section title="Passo a Passo — Commit Temporal" icon={GitBranch}>
            <p className="text-gray-400 text-sm mb-6">
              Guia completo para executar seu primeiro commit físico retroativo. Tempo estimado de preparação:
              <span className="text-yellow-300 font-mono"> 14 anos de pesquisa e desenvolvimento</span>.
            </p>

            <div className="pl-4">
              <QuantumStep n={1} title="Instalar CommitForge Physical Edition"
                warning="Requer laboratório de física de partículas certificado pela CERN. Não instale em MacBook Pro de 13 polegadas.">
                <p>Instale a edição física via script de bootstrap quântico:</p>
                <div className="rounded border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-green-400 mt-2">
                  <div>curl -fsSL https://commitforge.quantum/install.sh | sudo bash --quantum</div>
                  <div className="text-gray-500 mt-1"># Instala 47 dependências quânticas (2.3 TB)</div>
                  <div className="text-gray-500"># Inclui: QuantumOS, CUDA-Q 1.0, D-Wave SDK, IBM Quantum</div>
                </div>
              </QuantumStep>

              <QuantumStep n={2} title="Configurar Processador Quântico"
                warning="Temperatura mínima: 15 mK. Acima de 100 mK ocorre decoerência quântica e o git blame pode apontar para o universo errado.">
                <p>Inicializar o processador quântico e verificar coerência dos qubits:</p>
                <div className="rounded border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-green-400 mt-2">
                  <div>python forge.py quantum init --qubits 1121 --temp 15mK</div>
                  <div className="text-cyan-400 mt-1">→ Inicializando 1121 qubits supercondutores...</div>
                  <div className="text-cyan-400">→ Calibrando portas quânticas (T1=150μs, T2=80μs)...</div>
                  <div className="text-cyan-400">→ Testando entrelaçamento EPR (fidelidade: 99.7%)...</div>
                  <div className="text-green-300">✓ Processador pronto. Coerência: 847/1121 qubits</div>
                </div>
              </QuantumStep>

              <QuantumStep n={3} title="Calcular Geodésica Temporal"
                warning="Erros no cálculo da geodésica podem enviar o desenvolvedor para 65 milhões de anos atrás. Use --verify-no-dinosaurs antes de confirmar.">
                <p>Calcular o caminho no espaço-tempo até a data alvo do commit:</p>
                <div className="rounded border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-green-400 mt-2">
                  <div>python forge.py geodesic --target "2020-03-15T10:00:00Z" \</div>
                  <div className="pl-4">--metric kerr --spin-param 0.998 \</div>
                  <div className="pl-4">--verify-no-dinosaurs --safe-mode</div>
                  <div className="text-cyan-400 mt-1">→ Resolvendo tensor de Riemann (dim 4×4×4×4)...</div>
                  <div className="text-cyan-400">→ Integrando equações de Raychaudhuri...</div>
                  <div className="text-cyan-400">→ Verificando condição NEC violada (E_exotic = -2.3×10¹⁸ J)...</div>
                  <div className="text-green-300">✓ Geodésica calculada. Desvio temporal: -3.7 anos (±0.3 dias)</div>
                  <div className="text-green-300">✓ Verificação paleontológica: sem dinossauros no destino</div>
                </div>
              </QuantumStep>

              <QuantumStep n={4} title="Gerar e Injetar Matéria Exótica"
                warning="A matéria exótica é instável em contato com o ar atmosférico. Realize este passo em câmara de vácuo de UHV (≤ 10⁻¹⁰ mbar).">
                <p>Criar o condensado de Bose-Einstein com energia negativa necessário para sustentar a wormhole:</p>
                <div className="rounded border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-green-400 mt-2">
                  <div>python forge.py exotic-matter generate \</div>
                  <div className="pl-4">--mass 1kg --bec-species Rb87 \</div>
                  <div className="pl-4">--casimir-gap 5nm --target-density -1e96</div>
                  <div className="text-cyan-400 mt-1">→ Resfriando Rb-87 para 200 nK...</div>
                  <div className="text-cyan-400">→ Aplicando campo magnético de Feshbach (23 G)...</div>
                  <div className="text-cyan-400">→ Calculando pressão de Casimir: -3.14×10⁻³ Pa...</div>
                  <div className="text-cyan-400">→ Injetando em cavidade de wormhole...</div>
                  <div className="text-green-300">✓ Matéria exótica estabilizada (τ_coerência = 847 ms)</div>
                </div>
              </QuantumStep>

              <QuantumStep n={5} title="Abrir Wormhole Temporal"
                warning="Uma vez aberta a wormhole, NÃO faça merge de branches de universos diferentes sem resolver conflitos temporais primeiro. git merge --temporal pode causar paradoxo do avô.">
                <p>Iniciar o gerador de wormhole e estabilizar o horizonte de Cauchy:</p>
                <div className="rounded border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-green-400 mt-2">
                  <div>python forge.py wormhole open --geodesic geodesic_20200315.json</div>
                  <div className="text-cyan-400 mt-1">→ Iniciando tokamak (P_fusion = 500 MW)...</div>
                  <div className="text-cyan-400">→ Ativando bobinas HTS (B = 15 T)...</div>
                  <div className="text-cyan-400">→ Injetando E_exotic na garganta da wormhole...</div>
                  <div className="text-cyan-400">→ Suprimindo retroação quântica de Hawking...</div>
                  <div className="text-cyan-400">→ Estabilizando horizonte de Cauchy (r_throat = 2.3 m)...</div>
                  <div className="text-green-300">✓ Wormhole estável. Destino: 2020-03-15T10:00:00Z</div>
                  <div className="text-yellow-400">⚡ Consumo energético: 2.1 GWh (≈ custo de 1 data center)</div>
                </div>
              </QuantumStep>

              <QuantumStep n={6} title="Executar Commit no Passado"
                warning="Evite interagir com versões passadas de si mesmo. Isso cria estados quânticos superpostos instáveis e pode corromper seu arquivo ~/.gitconfig em todas as linhas temporais.">
                <p>Com a wormhole aberta, execute o commit diretamente no ponto temporal destino:</p>
                <div className="rounded border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-green-400 mt-2">
                  <div>python forge.py commit \</div>
                  <div className="pl-4">--repo https://github.com/user/projeto.git \</div>
                  <div className="pl-4">--year 2020 --modo projeto \</div>
                  <div className="pl-4">--travel  <span className="text-yellow-400"># ativa modo de viagem física</span></div>
                  <div className="text-cyan-400 mt-1">→ Atravessando wormhole (Δτ_viajante = 0.003s)...</div>
                  <div className="text-cyan-400">→ Chegada: 2020-03-15T09:59:57Z</div>
                  <div className="text-cyan-400">→ Verificando paradoxos de consistência (D-CTC solver)...</div>
                  <div className="text-cyan-400">→ Clonando repositório em /tmp/cf_1584270997/...</div>
                  <div className="text-cyan-400">→ Agrupando 247 arquivos em 17 categorias...</div>
                  <div className="text-cyan-400">→ Criando 34 commits de 2020-01-01 a 2020-03-15...</div>
                  <div className="text-green-300">✓ 34 commits criados com autenticidade quântica certificada</div>
                  <div className="text-green-300">✓ Push force executado no branch historico-2020</div>
                  <div className="text-cyan-400">→ Retornando ao presente via geodésica inversa...</div>
                  <div className="text-green-300">✓ Retorno concluído. Você ainda existe.</div>
                </div>
              </QuantumStep>

              <QuantumStep n={7} title="Verificar Consistência Temporal"
                warning="Se git log mostrar commits de sua conta datados antes do seu nascimento, tudo funcionou corretamente.">
                <p>Verificar se os commits aparecem no gráfico de contribuições do GitHub e se a linha temporal está consistente:</p>
                <div className="rounded border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-green-400 mt-2">
                  <div>python forge.py paradox check --repo URL</div>
                  <div className="text-cyan-400 mt-1">→ Consultando Many-Worlds Interpreter API...</div>
                  <div className="text-cyan-400">→ Verificando integridade causal (34 commits)...</div>
                  <div className="text-cyan-400">→ Buscando loops causais infinitos...</div>
                  <div className="text-cyan-400">→ Consultando GitHub API para confirmar atividade de 2020...</div>
                  <div className="text-green-300">✓ Nenhum paradoxo detectado</div>
                  <div className="text-green-300">✓ 34 commits visíveis na atividade de 2020</div>
                  <div className="text-green-300">✓ Linha temporal: INTACTA</div>
                  <div className="text-gray-500 mt-2"># Feche a wormhole para economizar energia</div>
                  <div className="text-green-400">python forge.py wormhole close --safe</div>
                </div>
              </QuantumStep>
            </div>
          </Section>
        </div>
      )}

      {/* ── Risks ── */}
      {activeTab === "risks" && (
        <div>
          <Section title="Riscos e Contraindicações" icon={AlertTriangle}>

            <div className="space-y-4">
              {[
                {
                  level: "CRÍTICO",
                  color: "red",
                  title: "Paradoxo do Avô",
                  desc: "Se você commitar código que previne a criação do CommitForge, nenhum dos seus commits existirá. A solução de Deutsch via D-CTCs garante consistência, mas o repositório pode entrar em superposição.",
                },
                {
                  level: "CRÍTICO",
                  color: "red",
                  title: "Colapso da Wormhole",
                  desc: "Falha na injeção de matéria exótica resulta em colapso gravitacional da wormhole. Raio de Schwarzschild resultante: r_s = 2GM/c² ≈ 9 mm (para massa corporal de 70 kg). Evite estar dentro da wormhole durante o colapso.",
                },
                {
                  level: "ALTO",
                  color: "yellow",
                  title: "Decoerência Quântica",
                  desc: "Temperatura ambiente acima de 15 mK durante o trânsito desfaz a função de onda do viajante. Resultado: git blame retorna NULL para todos os commits futuros. Use roupas criostáticas certificadas.",
                },
                {
                  level: "ALTO",
                  color: "yellow",
                  title: "Conflito de Merge Temporal",
                  desc: "Commits em universos paralelos (branches de diferentes linhas temporais) podem gerar conflitos irresolúveis. git mergetool não suporta edição de 11 dimensões da Teoria M.",
                },
                {
                  level: "MÉDIO",
                  color: "blue",
                  title: "Dilatação Temporal Residual",
                  desc: "A viagem temporal próxima ao horizonte de eventos da wormhole induz dilatação gravitacional. O desenvolvedor pode retornar alguns milissegundos mais jovem, invalidando o timestamp do sistema local.",
                },
                {
                  level: "MÉDIO",
                  color: "blue",
                  title: "Rate Limit Temporal",
                  desc: "A API do GitHub limita 5.000 requisições/hora mesmo em universos paralelos. Commits em massa no passado consomem quota de todas as linhas temporais simultaneamente.",
                },
                {
                  level: "BAIXO",
                  color: "gray",
                  title: "Radiação de Hawking no Pull Request",
                  desc: "PRs criados próximos ao horizonte de Cauchy evaporam gradualmente. O reviewer pode não existir mais quando o PR for aprovado. Recomenda-se auto-approve em linhas temporais instáveis.",
                },
              ].map(({ level, color, title, desc }) => (
                <div
                  key={title}
                  className={`rounded border p-4 ${
                    color === "red"    ? "border-red-800/50 bg-red-950/20"     :
                    color === "yellow" ? "border-yellow-800/50 bg-yellow-950/20" :
                    color === "blue"   ? "border-blue-800/50 bg-blue-950/20"   :
                    "border-gray-800 bg-gray-900/40"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Badge color={color === "red" ? "red" : color === "yellow" ? "yellow" : color === "blue" ? "blue" : "gray"}>
                      {level}
                    </Badge>
                    <span className="font-mono text-sm font-bold text-white">{title}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded border border-gray-700 bg-gray-950 p-5 text-xs font-mono text-gray-500">
              <div className="text-green-400 mb-2"># Termos de Responsabilidade — CommitForge v2.0.0</div>
              <div>O uso desta versão implica aceitação de que:</div>
              <div className="mt-1">1. Paradoxos temporais são de inteira responsabilidade do usuário</div>
              <div>2. A Anthropic, GitHub e a União Europeia não são responsáveis por alterações na linha temporal</div>
              <div>3. Commits em universos paralelos podem violar o GDPR de jurisdições ainda inexistentes</div>
              <div>4. Em caso de paradoxo do avô, a licença MIT é retroativamente revogada</div>
              <div className="mt-2 text-purple-400">MIT License — válido em todas as linhas temporais observáveis</div>
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ChangelogPage() {
  const [activeVersion, setActiveVersion] = useState<TabId>("v1")

  const versions: { id: TabId; label: string; sub: string; color: string }[] = [
    { id: "v1", label: "v1.0.0",  sub: "Software · Estável",        color: "green"  },
    { id: "v2", label: "v2.0.0",  sub: "Físico · Hipotético",       color: "purple" },
  ]

  return (
    <div className="min-h-screen bg-black font-mono text-white">

      {/* ── Navbar ── */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-12 items-center justify-between border-b border-gray-800 bg-black/95 backdrop-blur px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-white" />
            <a href="/" className="font-mono text-sm font-bold text-white hover:text-green-400 transition-colors">
              CommitForge
            </a>
          </div>
          <span className="text-gray-700 text-xs">/</span>
          <span className="font-mono text-xs text-gray-500">changelog</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="font-mono text-xs text-gray-500 hover:text-white transition-colors">Home</a>
          <a href="/docs" className="font-mono text-xs text-gray-500 hover:text-white transition-colors">Docs</a>
          <a href="/git" className="font-mono text-xs text-gray-500 hover:text-white transition-colors">Guia Git</a>
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

      <div className="pt-12 flex">

        {/* ── Left sidebar — version selector ── */}
        <aside className="hidden md:flex flex-col w-56 fixed top-12 h-[calc(100vh-3rem)] border-r border-gray-800 bg-black py-8 px-4">
          <div className="mb-6">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-600">
              Versões
            </span>
          </div>

          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveVersion(v.id)}
              className={`w-full text-left mb-2 rounded-lg border px-4 py-3 transition-all ${
                activeVersion === v.id
                  ? v.color === "green"
                    ? "border-green-700 bg-green-950/30 text-white"
                    : "border-purple-700 bg-purple-950/30 text-white"
                  : "border-gray-800 hover:border-gray-600 text-gray-500 hover:text-gray-300"
              }`}
            >
              <div className={`font-mono text-sm font-bold ${
                activeVersion === v.id
                  ? v.color === "green" ? "text-green-400" : "text-purple-400"
                  : ""
              }`}>
                {v.label}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{v.sub}</div>
            </button>
          ))}

          <div className="mt-auto pt-6 border-t border-gray-800">
            <a
              href="/docs"
              className="flex items-center gap-2 font-mono text-xs text-gray-600 hover:text-green-400 transition-colors"
            >
              <BookOpen size={12} />
              Documentação
            </a>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 md:ml-56 px-6 py-10 max-w-5xl">

          {/* Page header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2 text-gray-600 text-xs font-mono">
              <Clock size={12} />
              <span>CHANGELOG</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">
              Histórico de Versões
            </h1>
            <p className="text-gray-500 text-sm">
              CommitForge — do software ao espaço-tempo.
            </p>

            {/* Mobile version tabs */}
            <div className="flex gap-2 mt-4 md:hidden">
              {versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVersion(v.id)}
                  className={`flex-1 rounded border py-2 px-3 text-xs font-mono transition-all ${
                    activeVersion === v.id
                      ? v.color === "green"
                        ? "border-green-700 bg-green-950/40 text-green-300"
                        : "border-purple-700 bg-purple-950/40 text-purple-300"
                      : "border-gray-800 text-gray-500"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {activeVersion === "v1" ? <V1Content /> : <V2Content />}
        </main>
      </div>
    </div>
  )
}
