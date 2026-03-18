"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { RefreshCw, Download, ChevronDown, Shield, Home } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatsData {
  total_installs: number
  by_platform: { platform: string; count: number }[]
  by_method: { method: string; count: number }[]
  last_30_days: { date: string; count: number }[]
  feedbacks: { id: string; created_at: string; name: string | null; rating: number | null; message: string; category: string; status: string }[]
  recent_commits: { id: string; created_at: string; repo_name: string | null; commits_count: number; status: string; duration_ms: number | null; mode: string | null }[]
  improvements: { id: string; title: string; description: string | null; priority: string; status: string; author: string | null; version_target: string | null; tags: string[] }[]
}

interface TimelineEvent {
  id: string
  created_at: string
  operator: string
  repo_name: string | null
  repo_url: string | null
  commit_year: number
  commits_count: number
  branch_name: string | null
  mode: string | null
  timeline_type: 'sacred' | 'branched' | 'nexus' | 'pruned'
  nexus_level: number
  is_future: boolean
  is_deep_past: boolean
  status: 'active' | 'pruned' | 'monitored' | 'warning'
  source: string
}

interface GuardianData {
  events: TimelineEvent[]
  timeline_health: number
  threat_level: 'green' | 'yellow' | 'red' | 'critical'
  total_events: number
  nexus_count: number
  branch_count: number
  pruned_count: number
  future_count: number
  deep_past_count: number
  cli_count: number
  flask_count: number
  timeline_chart: { year: number; count: number; isFuture: boolean }[]
  current_year: number
  prunes: { id: string; created_at: string; event_id: string; action: string; reason: string | null; guardian: string }[]
}

type Section =
  | "overview" | "installs" | "commits" | "feedbacks" | "improvements" | "backups"
  | "guardian" | "guardian-map" | "guardian-nexus" | "guardian-variants" | "guardian-prunes" | "guardian-alerts"

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = { linux: "#00ff88", macos: "#a78bfa", windows: "#60a5fa", docker: "#38bdf8", arch: "#1d4ed8", debian: "#dc2626", ubuntu: "#f97316", fedora: "#06b6d4", other: "#6b7280" }
const METHOD_COLORS: Record<string, string>   = { curl: "#f5a623", docker: "#38bdf8", brew: "#a78bfa", apt: "#f87171", pacman: "#60a5fa", winget: "#34d399", powershell: "#22d3ee", pip: "#fb923c", git: "#a3e635", other: "#6b7280", unknown: "#6b7280" }
const STATUS_LABELS: Record<string, string>   = { pending: "pendente", in_progress: "em andamento", running: "executando", completed: "concluído", done: "feito", failed: "falhou", cancelled: "cancelado", reviewed: "revisado", rejected: "rejeitado", wont_fix: "não vai corrigir" }
const PRIORITY_LABELS: Record<string, string> = { low: "baixa", medium: "média", high: "alta", critical: "crítica" }

const AVT_MESSAGES = [
  { agent: "Mobius M. Mobius", msg: "Todos os dados temporais foram sincronizados com sucesso.", icon: "🕵️", level: "info" },
  { agent: "Hunter B-15",      msg: "Atividade de instalações detectada. Monitorando variantes.", icon: "👮", level: "warning" },
  { agent: "He Who Remains",   msg: "Tudo isso já aconteceu antes. E vai acontecer de novo.", icon: "👁️", level: "info" },
  { agent: "Ravonna Renslayer",msg: "A Linha do Tempo Sagrada está em conformidade.", icon: "⚖️", level: "info" },
  { agent: "Minutemen",        msg: "Unidade de poda em standby. Aguardando ordens.", icon: "🚨", level: "warning" },
  { agent: "Hunter X-05",      msg: "Dossier atualizado. Novos registros adicionados ao arquivo.", icon: "📁", level: "info" },
  { agent: "Loki",             msg: "Eu sou o Loki, o Deus da Trapaça, e até eu uso git agora.", icon: "🐍", level: "info" },
]

const NAV_ITEMS = [
  { id: "overview",          label: "Visão Geral",       icon: "◈",  group: "main" },
  { id: "installs",          label: "Instalações",       icon: "⬇",  group: "main" },
  { id: "commits",           label: "Commits Log",       icon: "⊕",  group: "main" },
  { id: "feedbacks",         label: "Feedbacks",         icon: "◎",  group: "main" },
  { id: "improvements",      label: "Melhorias CLI",     icon: "◆",  group: "main" },
  { id: "backups",           label: "Backups",           icon: "⊟",  group: "main" },
  { id: "guardian",          label: "Painel Principal",  icon: "⌖",  group: "guardian" },
  { id: "guardian-map",      label: "Mapa Temporal",     icon: "⟁",  group: "guardian" },
  { id: "guardian-nexus",    label: "Eventos Nexus",     icon: "⚡",  group: "guardian" },
  { id: "guardian-variants", label: "Variantes",         icon: "⑂",  group: "guardian" },
  { id: "guardian-prunes",   label: "Arquivo de Podas",  icon: "✂",  group: "guardian" },
  { id: "guardian-alerts",   label: "Central de Alertas",icon: "⚠",  group: "guardian" },
]

const SECTION_TITLES: Record<Section, string> = {
  overview: "Visão Geral",
  installs: "Instalações",
  commits: "Commits Log",
  feedbacks: "Feedbacks",
  improvements: "Melhorias CLI",
  backups: "Backups & Exportação",
  guardian: "Guardião — Painel Principal",
  "guardian-map": "Guardião — Mapa Temporal",
  "guardian-nexus": "Guardião — Eventos Nexus",
  "guardian-variants": "Guardião — Variantes",
  "guardian-prunes": "Guardião — Arquivo de Podas",
  "guardian-alerts": "Guardião — Central de Alertas",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}
function formatDuration(ms: number | null) {
  if (!ms) return "—"
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}
function downloadJSON(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))]
  const blob = new Blob([lines.join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Reusable components ──────────────────────────────────────────────────────

function ScanLine() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
      style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.4) 2px, rgba(0,255,136,0.4) 4px)" }}
    />
  )
}

function Glitch({ text }: { text: string }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{text}</span>
      <span
        className="absolute inset-0 text-[#ff4040] opacity-0 hover:opacity-60 transition-opacity duration-75 select-none"
        style={{ clipPath: "inset(30% 0 50% 0)", transform: "translateX(-2px)" }}
        aria-hidden
      >{text}</span>
    </span>
  )
}

function PulsingDot({ color = "#00ff88" }: { color?: string }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  )
}

function AVTStatCard({ title, value, sub, icon, color = "amber" }: { title: string; value: string | number; sub?: string; icon: string; color?: string }) {
  const palettes: Record<string, { border: string; glow: string; text: string; bg: string }> = {
    amber: { border: "border-[#f5a623]/30", glow: "shadow-[#f5a623]/10", text: "text-[#f5a623]", bg: "from-[#f5a623]/5 to-transparent" },
    green: { border: "border-[#00ff88]/30", glow: "shadow-[#00ff88]/10", text: "text-[#00ff88]", bg: "from-[#00ff88]/5 to-transparent" },
    blue:  { border: "border-[#4aabff]/30", glow: "shadow-[#4aabff]/10", text: "text-[#4aabff]", bg: "from-[#4aabff]/5 to-transparent" },
    red:   { border: "border-[#ff4040]/30", glow: "shadow-[#ff4040]/10", text: "text-[#ff4040]", bg: "from-[#ff4040]/5 to-transparent" },
  }
  const p = palettes[color] ?? palettes.amber
  return (
    <div className={`relative bg-gradient-to-br ${p.bg} border ${p.border} rounded-sm p-5 shadow-lg ${p.glow} overflow-hidden`}>
      <span className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${p.border} opacity-60`} />
      <span className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${p.border} opacity-60`} />
      <span className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${p.border} opacity-60`} />
      <span className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${p.border} opacity-60`} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-white/40 text-xs tracking-widest uppercase font-mono">{title}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-4xl font-bold font-mono mb-1 ${p.text}`} style={{ textShadow: "0 0 20px currentColor" }}>{value}</p>
      {sub && <p className="text-white/20 text-xs font-mono mt-1">{sub}</p>}
    </div>
  )
}

function AVTBadge({ value, map }: { value: string; map: Record<string, string> }) {
  const col: Record<string, string> = {
    pending: "border-yellow-500/40 text-yellow-400",
    in_progress: "border-blue-500/40 text-blue-400",
    running: "border-amber-500/40 text-amber-400",
    completed: "border-green-500/40 text-[#00ff88]",
    done: "border-green-500/40 text-[#00ff88]",
    failed: "border-red-500/40 text-red-400",
    cancelled: "border-white/10 text-white/30",
    reviewed: "border-purple-500/40 text-purple-400",
    low: "border-white/10 text-white/30",
    medium: "border-yellow-500/40 text-yellow-400",
    high: "border-orange-500/40 text-orange-400",
    critical: "border-red-500/40 text-red-400",
  }
  const cls = col[value] ?? "border-white/10 text-white/40"
  return (
    <span className={`inline-flex items-center border rounded px-2 py-0.5 text-[10px] font-mono tracking-wider ${cls}`}>
      {map[value] ?? value}
    </span>
  )
}

function AVTAlert({ agent, msg, icon, level, onDismiss }: { agent: string; msg: string; icon: string; level: string; onDismiss: () => void }) {
  const colors: Record<string, string> = {
    info: "border-[#f5a623]/40 bg-[#f5a623]/5",
    warning: "border-[#ff8c00]/50 bg-[#ff8c00]/5",
    danger: "border-[#ff4040]/50 bg-[#ff4040]/5",
  }
  return (
    <div className={`relative border ${colors[level] ?? colors.info} rounded-sm p-3 mb-3`}>
      <button onClick={onDismiss} className="absolute top-2 right-2 text-white/20 hover:text-white/60 text-xs">×</button>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-[#f5a623] font-mono text-xs tracking-widest">{agent}</span>
        <PulsingDot color={level === "warning" ? "#ff8c00" : "#f5a623"} />
      </div>
      <p className="text-white/70 text-xs font-mono leading-relaxed italic">&quot;{msg}&quot;</p>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activeSection, onNavigate }: { activeSection: Section; onNavigate: (s: Section) => void }) {
  const mainItems = NAV_ITEMS.filter(i => i.group === "main")
  const guardianItems = NAV_ITEMS.filter(i => i.group === "guardian")
  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col border-r border-white/5 z-20 font-mono"
      style={{ background: "#040810" }}
    >
      {/* Branding */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🛡️</span>
          <span className="text-[#f5a623] font-black tracking-[0.2em] text-lg" style={{ textShadow: "0 0 20px rgba(245,166,35,0.5)" }}>
            <Glitch text="AVT HQ" />
          </span>
        </div>
        <p className="text-white/25 text-[10px] tracking-widest uppercase">Linha do Tempo Sagrada</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="text-white/20 text-[9px] tracking-[0.3em] uppercase px-2 pb-2">Principal</p>
        {mainItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Section)}
            className={`w-full flex items-center gap-2.5 px-2 py-2 text-xs text-left transition-all rounded-sm ${
              activeSection === item.id
                ? "border-l-2 border-[#f5a623] text-[#f5a623] bg-[#f5a623]/5 pl-[6px]"
                : "border-l-2 border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <span className="text-sm w-4 flex-shrink-0 text-center">{item.icon}</span>
            <span className="tracking-wide">{item.label}</span>
          </button>
        ))}

        <div className="pt-4 pb-2">
          <div className="flex items-center gap-2 px-2 pb-2">
            <p className="text-white/20 text-[9px] tracking-[0.3em] uppercase">Guardião AVT</p>
            <PulsingDot color="#ff4040" />
          </div>
          {guardianItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Section)}
              className={`w-full flex items-center gap-2.5 px-2 py-2 text-xs text-left transition-all rounded-sm ${
                activeSection === item.id
                  ? "border-l-2 border-[#f5a623] text-[#f5a623] bg-[#f5a623]/5 pl-[6px]"
                  : "border-l-2 border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <span className="text-sm w-4 flex-shrink-0 text-center">{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="border border-[#f5a623]/30 text-[#f5a623] text-[9px] font-mono px-2 py-0.5 tracking-widest">v3.0.0</span>
          <span className="text-white/20 text-[9px] tracking-widest">CommitForge</span>
        </div>
        <a
          href="/"
          className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-[10px] tracking-widest transition-colors"
        >
          <Home className="w-3 h-3" />
          ← Voltar ao Site
        </a>
      </div>
    </aside>
  )
}

// ─── Timeline SVG ─────────────────────────────────────────────────────────────

function TimelineSVG({ events }: { events: TimelineEvent[] }) {
  const years = Array.from({ length: 16 }, (_, i) => 2015 + i)
  const W = 700, H = 130, PAD = 40
  const yearX = (y: number) => PAD + ((y - 2015) / 15) * (W - PAD * 2)
  const cy = 75
  const currentYear = new Date().getFullYear()

  const eventsByYear: Record<number, TimelineEvent[]> = {}
  events.forEach(e => {
    if (e.commit_year >= 2015 && e.commit_year <= 2030) {
      if (!eventsByYear[e.commit_year]) eventsByYear[e.commit_year] = []
      eventsByYear[e.commit_year].push(e)
    }
  })

  const typeColor = (t: string) =>
    t === "nexus" ? "#ff4040" : t === "branched" ? "#f5a623" : t === "pruned" ? "#444" : "#00ff88"

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 130 }}>
      <defs>
        <filter id="glow-s"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00ff88" floodOpacity="0.6"/></filter>
        <filter id="glow-n"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff4040" floodOpacity="0.8"/></filter>
        <filter id="glow-b"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f5a623" floodOpacity="0.7"/></filter>
      </defs>
      <rect x={yearX(currentYear)} y={0} width={W - yearX(currentYear)} height={H} fill="rgba(255,64,64,0.04)"/>
      <line x1={PAD} y1={cy} x2={W - PAD} y2={cy} stroke="#00ff88" strokeWidth="1.5" opacity="0.2" filter="url(#glow-s)"/>
      <line x1={yearX(currentYear)} y1={8} x2={yearX(currentYear)} y2={H - 8} stroke="#f5a623" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
      <text x={yearX(currentYear) + 3} y={18} fill="#f5a623" fontSize="7" fontFamily="monospace" opacity="0.7">HOJE</text>
      {years.filter((_, i) => i % 3 === 0).map(y => (
        <g key={y}>
          <line x1={yearX(y)} y1={cy - 4} x2={yearX(y)} y2={cy + 4} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          <text x={yearX(y)} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace">{y}</text>
        </g>
      ))}
      {Object.entries(eventsByYear).map(([yr, evts]) => {
        const x = yearX(parseInt(yr))
        const hasBranch = evts.some(e => e.timeline_type === "branched" || e.timeline_type === "nexus")
        if (!hasBranch) return null
        const maxNexus = evts.reduce((m, e) => Math.max(m, e.nexus_level), 0)
        const lift = 20 + maxNexus * 3
        const col = evts.some(e => e.timeline_type === "nexus") ? "#ff4040" : "#f5a623"
        return (
          <path key={yr} d={`M${x},${cy} C${x},${cy - lift} ${x + 30},${cy - lift} ${x + 30},${cy}`}
            fill="none" stroke={col} strokeWidth="1" opacity="0.5"
            filter={col === "#ff4040" ? "url(#glow-n)" : "url(#glow-b)"}/>
        )
      })}
      {Object.entries(eventsByYear).map(([yr, evts]) => {
        const x = yearX(parseInt(yr))
        const topType = evts.find(e => e.timeline_type === "nexus")?.timeline_type
          ?? evts.find(e => e.timeline_type === "branched")?.timeline_type
          ?? "sacred"
        const col = typeColor(topType)
        const r = Math.min(8, 3 + Math.log2(evts.reduce((s, e) => s + e.commits_count, 0) + 1))
        const flt = topType === "nexus" ? "url(#glow-n)" : topType === "branched" ? "url(#glow-b)" : "url(#glow-s)"
        return (
          <g key={yr}>
            <circle cx={x} cy={cy} r={r + 3} fill={col} opacity="0.1"/>
            <circle cx={x} cy={cy} r={r} fill={col} opacity="0.85" filter={flt}/>
            <text x={x} y={cy - r - 4} textAnchor="middle" fill={col} fontSize="7" fontFamily="monospace" opacity="0.8">{evts.length}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Prune Modal ──────────────────────────────────────────────────────────────

function PruneModal({
  target,
  onClose,
  onSuccess,
}: {
  target: TimelineEvent
  onClose: () => void
  onSuccess: () => void
}) {
  const [action, setAction] = useState<"pruned" | "warned" | "monitored">("pruned")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const doPrune = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/guardian/prune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: target.id, action, reason, guardian: "Guardião AVT" }),
      })
      const json = await res.json()
      if (json.ok) { onSuccess(); onClose() }
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative border border-[#ff4040]/40 p-6 max-w-md w-full mx-4" style={{ background: "#040810" }}>
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff4040]/60" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff4040]/60" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ff4040]/60" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ff4040]/60" />
        <h3 className="text-[#ff4040] font-mono font-bold tracking-widest mb-1">AÇÃO DO GUARDIÃO</h3>
        <p className="text-white/30 text-xs font-mono mb-4 tracking-widest">
          {target.operator} · {target.repo_name} · {target.commit_year}
        </p>
        <div className="flex gap-2 mb-4">
          {(["pruned", "warned", "monitored"] as const).map(a => (
            <button key={a} onClick={() => setAction(a)}
              className={`flex-1 py-2 text-[10px] tracking-widest font-mono border transition-all ${
                action === a
                  ? a === "pruned" ? "border-[#ff4040] bg-[#ff4040]/20 text-[#ff4040]"
                    : a === "warned" ? "border-[#ff8c00] bg-[#ff8c00]/20 text-[#ff8c00]"
                    : "border-[#f5a623] bg-[#f5a623]/20 text-[#f5a623]"
                  : "border-white/10 text-white/30 hover:border-white/30"
              }`}>
              {a === "pruned" ? "✂ PODAR" : a === "warned" ? "⚠ ALERTAR" : "👁 MONITORAR"}
            </button>
          ))}
        </div>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Motivo (opcional)..."
          rows={2}
          className="w-full bg-black border border-white/10 focus:border-[#ff4040]/40 outline-none p-3 text-xs font-mono text-white/60 placeholder-white/15 resize-none mb-4 transition-colors"
        />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-white/10 text-white/30 py-2 text-xs tracking-widest font-mono hover:border-white/30 transition-colors">
            CANCELAR
          </button>
          <button onClick={doPrune} disabled={loading}
            className="flex-1 border border-[#ff4040]/50 bg-[#ff4040]/15 hover:bg-[#ff4040]/30 text-[#ff4040] py-2 text-xs tracking-widest font-mono disabled:opacity-40 transition-all">
            {loading ? "EXECUTANDO..." : "CONFIRMAR"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Overview ────────────────────────────────────────────────────────

function SectionOverview({ data, guardianData, loading }: { data: StatsData | null; guardianData: GuardianData | null; loading: boolean }) {
  const threatColor = (tl: string) =>
    tl === "green" ? "#00ff88" : tl === "yellow" ? "#f5a623" : tl === "red" ? "#ff8c00" : "#ff4040"
  const tc = guardianData?.threat_level ?? "green"

  const tooltipStyle = { background: "#060910", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 0, fontFamily: "monospace", fontSize: 11 }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AVTStatCard title="Total Instalações" value={loading ? "···" : (data?.total_installs ?? 0).toLocaleString()} sub="registros totais" icon="⬇" color="amber" />
        <AVTStatCard title="Commits Registrados" value={loading ? "···" : (data?.recent_commits.length ?? 0)} sub="eventos no log" icon="⊕" color="green" />
        <AVTStatCard title="Feedbacks" value={loading ? "···" : (data?.feedbacks.length ?? 0)} sub="relatórios recebidos" icon="◎" color="blue" />
        <AVTStatCard
          title="Saúde da Linha"
          value={loading ? "···" : `${guardianData?.timeline_health ?? 100}%`}
          sub={tc.toUpperCase()}
          icon="⌖"
          color={tc === "green" ? "green" : tc === "yellow" ? "amber" : "red"}
        />
      </div>

      {/* Health meter + 30-day chart */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Health */}
        <div className="relative border border-white/5 rounded-sm p-5 overflow-hidden" style={{ background: "rgba(255,255,255,0.01)" }}>
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10" />
          <p className="text-white/30 text-[10px] tracking-widest mb-4 font-mono">⌖ INTEGRIDADE DA LINHA SAGRADA</p>
          <div className="flex items-center justify-center py-4">
            <svg viewBox="0 0 120 120" className="w-32 h-32">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke={threatColor(tc)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(guardianData?.timeline_health ?? 100) * 3.14} 314`}
                strokeDashoffset="78.5"
                transform="rotate(-90 60 60)"
                style={{ filter: `drop-shadow(0 0 6px ${threatColor(tc)})`, transition: "stroke-dasharray 1s ease" }}
              />
              <text x="60" y="56" textAnchor="middle" fill={threatColor(tc)} fontSize="18" fontFamily="monospace" fontWeight="bold">
                {guardianData?.timeline_health ?? 100}
              </text>
              <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">SAÚDE</text>
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <PulsingDot color={threatColor(tc)} />
            <span className="text-xs font-mono" style={{ color: threatColor(tc) }}>
              {tc === "green" ? "LINHA SAGRADA ESTÁVEL" : tc === "yellow" ? "RAMIFICAÇÕES DETECTADAS" : tc === "red" ? "EVENTOS NEXUS ATIVOS" : "CRISE TEMPORAL CRÍTICA"}
            </span>
          </div>
        </div>

        {/* 30-day chart */}
        <div className="relative border border-[#00ff88]/15 rounded-sm p-5 overflow-hidden" style={{ background: "rgba(0,255,136,0.01)" }}>
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ff88]/30" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00ff88]/30" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00ff88]/30" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ff88]/30" />
          <p className="text-[#00ff88] text-[10px] tracking-widest mb-4 font-mono">◈ INSTALAÇÕES — ÚLTIMOS 30 DIAS</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-5 h-5 border border-[#00ff88] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data?.last_30_days ?? []}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,255,136,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(0,255,136,0.3)", fontSize: 9, fontFamily: "monospace" }}
                  tickFormatter={d => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} />
                <YAxis tick={{ fill: "rgba(0,255,136,0.3)", fontSize: 9, fontFamily: "monospace" }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#00ff88" }} itemStyle={{ color: "#00ff88" }} />
                <Line type="monotone" dataKey="count" stroke="#00ff88" strokeWidth={1.5} dot={{ fill: "#00ff88", r: 2 }} activeDot={{ r: 4, fill: "#00ff88" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent commits */}
        <div className="relative border border-white/5 rounded-sm p-5 overflow-hidden">
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10" />
          <p className="text-white/30 text-[10px] tracking-widest mb-4 font-mono">⊕ COMMITS RECENTES</p>
          <div className="space-y-2">
            {(data?.recent_commits ?? []).slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2 border border-white/5 hover:border-white/10 transition-all">
                <span className="text-white/20 text-xs">▸</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-mono truncate">{c.repo_name ?? "repositório"}</p>
                  <p className="text-white/20 text-[10px]">{formatDate(c.created_at)}</p>
                </div>
                <AVTBadge value={c.status} map={STATUS_LABELS} />
              </div>
            ))}
            {!loading && !data?.recent_commits.length && (
              <p className="text-white/20 text-xs text-center py-6 tracking-widest font-mono">— SEM COMMITS —</p>
            )}
          </div>
        </div>

        {/* Recent feedbacks */}
        <div className="relative border border-white/5 rounded-sm p-5 overflow-hidden">
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10" />
          <p className="text-white/30 text-[10px] tracking-widest mb-4 font-mono">◎ FEEDBACKS RECENTES</p>
          <div className="space-y-2">
            {(data?.feedbacks ?? []).slice(0, 3).map(f => (
              <div key={f.id} className="p-3 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-xs font-mono">{f.name ?? "Anônimo"}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-[10px] ${i < (f.rating ?? 0) ? "text-[#f5a623]" : "text-white/10"}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-white/40 text-xs font-mono truncate">{f.message}</p>
              </div>
            ))}
            {!loading && !data?.feedbacks.length && (
              <p className="text-white/20 text-xs text-center py-6 tracking-widest font-mono">— SEM FEEDBACKS —</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Installs ────────────────────────────────────────────────────────

function SectionInstalls({ data, loading }: { data: StatsData | null; loading: boolean }) {
  const tooltipStyle = { background: "#060910", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 0, fontFamily: "monospace", fontSize: 11 }
  return (
    <div className="space-y-6">
      {/* Big number */}
      <div className="relative border border-[#f5a623]/20 rounded-sm p-8 text-center overflow-hidden">
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#f5a623]/40" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#f5a623]/40" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#f5a623]/40" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#f5a623]/40" />
        <p className="text-white/30 text-[10px] tracking-widest mb-2 font-mono">TOTAL DE INSTALAÇÕES</p>
        <p className="text-[#f5a623] text-6xl font-black font-mono" style={{ textShadow: "0 0 40px rgba(245,166,35,0.4)" }}>
          {loading ? "···" : (data?.total_installs ?? 0).toLocaleString()}
        </p>
        <p className="text-white/20 text-xs font-mono mt-2 tracking-widest">registros totais na linha do tempo</p>
        <button
          onClick={() => data && downloadJSON("installs_summary.json", { by_platform: data.by_platform, by_method: data.by_method, last_30_days: data.last_30_days, total: data.total_installs })}
          disabled={!data}
          className="mt-4 inline-flex items-center gap-2 border border-[#f5a623]/30 hover:border-[#f5a623]/60 text-[#f5a623]/60 hover:text-[#f5a623] px-4 py-2 text-[10px] tracking-widest font-mono transition-all disabled:opacity-40"
        >
          <Download className="w-3 h-3" /> EXPORTAR CSV
        </button>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* By platform bar */}
        <div className="relative border border-[#4aabff]/15 rounded-sm p-5 overflow-hidden">
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#4aabff]/30" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#4aabff]/30" />
          <p className="text-[#4aabff] text-[10px] tracking-widest mb-4 font-mono">◈ POR PLATAFORMA</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center"><div className="w-5 h-5 border border-[#4aabff] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.by_platform ?? []}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(74,171,255,0.05)" />
                <XAxis dataKey="platform" tick={{ fill: "rgba(74,171,255,0.4)", fontSize: 9, fontFamily: "monospace" }} />
                <YAxis tick={{ fill: "rgba(74,171,255,0.4)", fontSize: 9, fontFamily: "monospace" }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#4aabff" }} />
                <Bar dataKey="count" radius={[2,2,0,0]}>
                  {(data?.by_platform ?? []).map(e => <Cell key={e.platform} fill={PLATFORM_COLORS[e.platform] ?? "#6b7280"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By method pie */}
        <div className="relative border border-[#f5a623]/15 rounded-sm p-5 overflow-hidden">
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#f5a623]/30" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#f5a623]/30" />
          <p className="text-[#f5a623] text-[10px] tracking-widest mb-4 font-mono">⬡ POR MÉTODO</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center"><div className="w-5 h-5 border border-[#f5a623] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={data?.by_method ?? []} dataKey="count" cx="50%" cy="50%" outerRadius={60} innerRadius={30} strokeWidth={0}>
                    {(data?.by_method ?? []).map(e => <Cell key={e.method} fill={METHOD_COLORS[e.method] ?? "#6b7280"} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {(data?.by_method ?? []).map(e => (
                  <div key={e.method} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: METHOD_COLORS[e.method] ?? "#6b7280", boxShadow: `0 0 4px ${METHOD_COLORS[e.method] ?? "#6b7280"}` }} />
                      <span className="text-white/50 font-mono">{e.method}</span>
                    </div>
                    <span className="text-white/80 font-mono">{e.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 30-day line chart */}
      <div className="relative border border-[#00ff88]/15 rounded-sm p-5 overflow-hidden">
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ff88]/30" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ff88]/30" />
        <p className="text-[#00ff88] text-[10px] tracking-widest mb-4 font-mono">◈ INSTALAÇÕES — ÚLTIMOS 30 DIAS</p>
        {loading ? (
          <div className="h-48 flex items-center justify-center"><div className="w-5 h-5 border border-[#00ff88] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.last_30_days ?? []}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,255,136,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(0,255,136,0.3)", fontSize: 9, fontFamily: "monospace" }}
                tickFormatter={d => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} />
              <YAxis tick={{ fill: "rgba(0,255,136,0.3)", fontSize: 9, fontFamily: "monospace" }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#00ff88" }} itemStyle={{ color: "#00ff88" }} />
              <Line type="monotone" dataKey="count" stroke="#00ff88" strokeWidth={1.5} dot={{ fill: "#00ff88", r: 2 }} activeDot={{ r: 4, fill: "#00ff88" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

// ─── Section: Commits ─────────────────────────────────────────────────────────

function SectionCommits({ data, loading }: { data: StatsData | null; loading: boolean }) {
  const [statusFilter, setStatusFilter] = useState("all")
  const filtered = useMemo(() =>
    (data?.recent_commits ?? []).filter(c => statusFilter === "all" || c.status === statusFilter),
    [data, statusFilter]
  )
  const statuses = useMemo(() => {
    const s = new Set((data?.recent_commits ?? []).map(c => c.status))
    return Array.from(s)
  }, [data])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-white/10 px-3 py-1.5 text-white/50 text-xs font-mono focus:outline-none focus:border-[#f5a623]/40 transition-colors"
            style={{ background: "#040810" }}>
            <option value="all">Todos os status</option>
            {statuses.map(s => <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>)}
          </select>
          <span className="text-white/20 text-xs font-mono">{filtered.length} registros</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => data && downloadJSON("commits.json", data.recent_commits)}
            disabled={!data}
            className="flex items-center gap-1.5 border border-white/10 hover:border-[#f5a623]/40 text-white/40 hover:text-[#f5a623] px-3 py-1.5 text-[10px] tracking-widest font-mono transition-all disabled:opacity-40">
            <Download className="w-3 h-3" /> JSON
          </button>
          <button onClick={() => data && downloadCSV("commits.csv", data.recent_commits as unknown as Record<string, unknown>[])}
            disabled={!data}
            className="flex items-center gap-1.5 border border-white/10 hover:border-[#f5a623]/40 text-white/40 hover:text-[#f5a623] px-3 py-1.5 text-[10px] tracking-widest font-mono transition-all disabled:opacity-40">
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
      </div>

      <div className="relative border border-white/5 rounded-sm overflow-hidden">
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5">
                {["Data", "Repo", "Commits", "Modo", "Status", "Duração"].map(h => (
                  <th key={h} className="text-left text-white/20 p-3 font-normal tracking-widest text-[10px] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-white/20 tracking-widest">CARREGANDO...</td></tr>
              ) : !filtered.length ? (
                <tr><td colSpan={6} className="py-12 text-center text-white/20 tracking-widest">— SEM REGISTROS —</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-white/40">{formatDate(c.created_at)}</td>
                    <td className="p-3 text-white/70 max-w-40 truncate">{c.repo_name ?? "—"}</td>
                    <td className="p-3 text-[#00ff88]">{c.commits_count}</td>
                    <td className="p-3 text-white/40">{c.mode ?? "—"}</td>
                    <td className="p-3"><AVTBadge value={c.status} map={STATUS_LABELS} /></td>
                    <td className="p-3 text-white/40">{formatDuration(c.duration_ms)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Section: Feedbacks ───────────────────────────────────────────────────────

function SectionFeedbacks({ data, loading }: { data: StatsData | null; loading: boolean }) {
  const [catFilter, setCatFilter] = useState("all")
  const [expanded, setExpanded] = useState<string | null>(null)
  const filtered = useMemo(() =>
    (data?.feedbacks ?? []).filter(f => catFilter === "all" || f.category === catFilter),
    [data, catFilter]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="border border-white/10 px-3 py-1.5 text-white/50 text-xs font-mono focus:outline-none focus:border-[#f5a623]/40 transition-colors"
            style={{ background: "#040810" }}>
            <option value="all">Todas as categorias</option>
            {["bug","feature","general","performance","docs"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="text-white/20 text-xs font-mono">{filtered.length} feedbacks</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => data && downloadCSV("feedbacks.csv", data.feedbacks as unknown as Record<string, unknown>[])}
            disabled={!data}
            className="flex items-center gap-1.5 border border-white/10 hover:border-[#f5a623]/40 text-white/40 hover:text-[#f5a623] px-3 py-1.5 text-[10px] tracking-widest font-mono transition-all disabled:opacity-40">
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-20"><div className="w-5 h-5 border border-[#38bdf8] border-t-transparent rounded-full animate-spin" /></div>
        ) : !filtered.length ? (
          <p className="text-white/20 text-xs text-center py-12 font-mono tracking-widest">— NENHUM FEEDBACK —</p>
        ) : (
          filtered.map(f => (
            <div key={f.id} className="border border-white/5 hover:border-white/10 transition-all p-4 rounded-sm">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-white/70 text-sm font-mono">{f.name ?? "Anônimo"}</span>
                  {f.rating !== null && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < (f.rating ?? 0) ? "text-[#f5a623]" : "text-white/10"}`}>★</span>
                      ))}
                    </div>
                  )}
                  <AVTBadge value={f.category} map={{ bug: "bug", feature: "feature", general: "geral", performance: "perf", docs: "docs" }} />
                </div>
                <div className="flex items-center gap-2">
                  <AVTBadge value={f.status} map={STATUS_LABELS} />
                  <span className="text-white/20 text-[10px] font-mono">{formatDate(f.created_at)}</span>
                  <button onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                    className="text-white/20 hover:text-white/60 transition-colors">
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded === f.id ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
              {expanded === f.id && (
                <p className="text-white/40 text-xs mt-3 leading-relaxed border-t border-white/5 pt-3 font-mono">{f.message}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Section: Improvements ───────────────────────────────────────────────────

function SectionImprovements({ data, loading }: { data: StatsData | null; loading: boolean }) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const filtered = useMemo(() =>
    (data?.improvements ?? []).filter(i =>
      (statusFilter === "all" || i.status === statusFilter) &&
      (priorityFilter === "all" || i.priority === priorityFilter)
    ),
    [data, statusFilter, priorityFilter]
  )

  const priorityColor: Record<string, string> = { low: "text-white/30", medium: "text-yellow-400", high: "text-orange-400", critical: "text-[#ff4040]" }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-white/10 px-3 py-1.5 text-white/50 text-xs font-mono focus:outline-none transition-colors"
            style={{ background: "#040810" }}>
            <option value="all">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="border border-white/10 px-3 py-1.5 text-white/50 text-xs font-mono focus:outline-none transition-colors"
            style={{ background: "#040810" }}>
            <option value="all">Todas as prioridades</option>
            {Object.entries(PRIORITY_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <span className="text-white/20 text-xs font-mono">{filtered.length} itens</span>
        </div>
        <button onClick={() => data && downloadJSON("improvements.json", data.improvements)}
          disabled={!data}
          className="flex items-center gap-1.5 border border-white/10 hover:border-[#f5a623]/40 text-white/40 hover:text-[#f5a623] px-3 py-1.5 text-[10px] tracking-widest font-mono transition-all disabled:opacity-40">
          <Download className="w-3 h-3" /> JSON
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border border-[#f5a623] border-t-transparent rounded-full animate-spin" /></div>
      ) : !filtered.length ? (
        <p className="text-white/20 text-xs text-center py-12 font-mono tracking-widest">— NENHUMA MELHORIA —</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="relative border border-white/5 hover:border-white/10 rounded-sm p-4 transition-all overflow-hidden">
              <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/10" />
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white/80 text-sm font-mono leading-snug flex-1">{item.title}</h3>
                <span className={`text-[10px] font-mono font-bold flex-shrink-0 ${priorityColor[item.priority] ?? "text-white/40"}`}>
                  {PRIORITY_LABELS[item.priority] ?? item.priority}
                </span>
              </div>
              {item.description && (
                <p className="text-white/30 text-xs font-mono leading-relaxed mb-3 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <AVTBadge value={item.status} map={STATUS_LABELS} />
                {item.version_target && (
                  <span className="border border-white/10 text-white/30 text-[10px] font-mono px-2 py-0.5 rounded-sm">{item.version_target}</span>
                )}
              </div>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-mono text-white/25 border border-white/5 px-1.5 py-0.5 rounded-sm">{tag}</span>
                  ))}
                </div>
              )}
              {item.author && (
                <p className="text-white/20 text-[10px] font-mono mt-1">por {item.author}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Section: Backups ─────────────────────────────────────────────────────────

function SectionBackups({ data, guardianData, loading, lastUpdated }: { data: StatsData | null; guardianData: GuardianData | null; loading: boolean; lastUpdated: Date | null }) {
  const items = [
    { label: "Exportar Instalações", desc: "by_platform, by_method, last_30_days, total", icon: "⬇", color: "#f5a623",
      action: () => data && downloadJSON("installs.json", { by_platform: data.by_platform, by_method: data.by_method, last_30_days: data.last_30_days, total: data.total_installs }) },
    { label: "Exportar Commits", desc: "recent_commits — histórico completo", icon: "⊕", color: "#00ff88",
      action: () => data && downloadCSV("commits.csv", data.recent_commits as unknown as Record<string, unknown>[]) },
    { label: "Exportar Feedbacks", desc: "feedbacks — relatórios dos agentes", icon: "◎", color: "#38bdf8",
      action: () => data && downloadCSV("feedbacks.csv", data.feedbacks as unknown as Record<string, unknown>[]) },
    { label: "Exportar Melhorias", desc: "improvements — nexus events da CLI", icon: "◆", color: "#a78bfa",
      action: () => data && downloadJSON("improvements.json", data.improvements) },
  ]

  const exportAll = () => {
    if (!data) return
    downloadJSON("avt_backup_completo.json", { stats: data, guardian: guardianData, exported_at: new Date().toISOString() })
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="border border-white/5 rounded-sm p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <PulsingDot color={loading ? "#f5a623" : "#00ff88"} />
          <span className="text-white/50 text-xs font-mono tracking-widest">
            {loading ? "SINCRONIZANDO..." : "DADOS SINCRONIZADOS"}
          </span>
        </div>
        {lastUpdated && (
          <span className="text-white/20 text-[10px] font-mono tracking-widest">
            Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
          </span>
        )}
      </div>

      {/* Export buttons */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <button
            key={item.label}
            onClick={item.action}
            disabled={!data}
            className="relative border border-white/5 hover:border-white/15 rounded-sm p-5 text-left transition-all group disabled:opacity-40"
          >
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 group-hover:border-white/20 transition-colors" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/10 group-hover:border-white/20 transition-colors" />
            <div className="text-2xl mb-3" style={{ color: item.color, textShadow: `0 0 10px ${item.color}40` }}>{item.icon}</div>
            <p className="text-white/70 text-sm font-mono group-hover:text-white transition-colors">{item.label}</p>
            <p className="text-white/25 text-[10px] font-mono mt-1 leading-relaxed">{item.desc}</p>
            <div className="mt-3 flex items-center gap-1 text-white/30 group-hover:text-white/60 text-[10px] tracking-widest font-mono transition-colors">
              <Download className="w-2.5 h-2.5" /> BAIXAR
            </div>
          </button>
        ))}
      </div>

      {/* Export all */}
      <div className="border border-[#f5a623]/20 rounded-sm p-6 text-center">
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#f5a623]/40" />
        <p className="text-white/40 text-xs font-mono tracking-widest mb-3">BACKUP COMPLETO — TODOS OS DADOS</p>
        <button
          onClick={exportAll}
          disabled={!data}
          className="inline-flex items-center gap-2 border border-[#f5a623]/40 hover:border-[#f5a623]/80 bg-[#f5a623]/5 hover:bg-[#f5a623]/10 text-[#f5a623] px-6 py-3 text-xs tracking-widest font-mono transition-all disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          EXPORTAR TUDO (JSON)
        </button>
        <p className="text-white/15 text-[10px] font-mono mt-3 tracking-widest">
          Inclui stats, guardian data, eventos, podas — snapshot completo da linha do tempo
        </p>
      </div>
    </div>
  )
}

// ─── Guardian: Painel Principal ───────────────────────────────────────────────

function SectionGuardian({ guardianData, loading, onPrune }: { guardianData: GuardianData | null; loading: boolean; onPrune: (e: TimelineEvent) => void }) {
  const tc = guardianData?.threat_level ?? "green"
  const threatColor = (t: string) => t === "green" ? "#00ff88" : t === "yellow" ? "#f5a623" : t === "red" ? "#ff8c00" : "#ff4040"
  const threatLabel = (t: string) => t === "green" ? "LINHA SAGRADA ESTÁVEL" : t === "yellow" ? "RAMIFICAÇÕES DETECTADAS" : t === "red" ? "EVENTOS NEXUS ATIVOS" : "CRISE TEMPORAL CRÍTICA"
  const col = threatColor(tc)

  const statCards = [
    { label: "Total Eventos", value: guardianData?.total_events ?? 0, color: "text-white/60" },
    { label: "Nexus", value: guardianData?.nexus_count ?? 0, color: "text-[#ff4040]" },
    { label: "Ramos", value: guardianData?.branch_count ?? 0, color: "text-[#f5a623]" },
    { label: "Podados", value: guardianData?.pruned_count ?? 0, color: "text-white/30" },
    { label: "Futuros", value: guardianData?.future_count ?? 0, color: "text-[#ff4040]" },
    { label: "Passado Distante", value: guardianData?.deep_past_count ?? 0, color: "text-[#a78bfa]" },
  ]

  return (
    <div className="space-y-6">
      {/* Health meter + stats */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* SVG health circle */}
        <div className="relative border rounded-sm p-6 flex flex-col items-center justify-center overflow-hidden" style={{ borderColor: `${col}30`, background: `${col}05` }}>
          <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: `${col}60` }} />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: `${col}60` }} />
          <p className="text-[10px] tracking-widest font-mono text-white/30 mb-4">INTEGRIDADE</p>
          <svg viewBox="0 0 120 120" className="w-36 h-36">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke={col} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(guardianData?.timeline_health ?? 100) * 3.14} 314`}
              strokeDashoffset="78.5"
              transform="rotate(-90 60 60)"
              style={{ filter: `drop-shadow(0 0 8px ${col})`, transition: "stroke-dasharray 1s ease" }}
            />
            <text x="60" y="55" textAnchor="middle" fill={col} fontSize="22" fontFamily="monospace" fontWeight="bold">
              {guardianData?.timeline_health ?? 100}
            </text>
            <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">SAÚDE %</text>
          </svg>
          <div className="flex items-center gap-2 mt-3">
            <PulsingDot color={col} />
            <span className="text-[10px] font-mono tracking-widest" style={{ color: col }}>{threatLabel(tc)}</span>
          </div>
        </div>

        {/* Stat cards grid */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-3">
          {statCards.map(s => (
            <div key={s.label} className="relative border border-white/5 rounded-sm p-4 text-center">
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
              <p className={`text-2xl font-bold font-mono mb-1 ${s.color}`}>{loading ? "·" : s.value}</p>
              <p className="text-white/20 text-[9px] tracking-widest font-mono">{s.label.toUpperCase()}</p>
            </div>
          ))}
          {/* Source breakdown */}
          <div className="relative border border-white/5 rounded-sm p-4 text-center">
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#a78bfa]/30" />
            <p className="text-[#a78bfa] text-2xl font-bold font-mono mb-1">{loading ? "·" : guardianData?.cli_count ?? 0}</p>
            <p className="text-white/20 text-[9px] tracking-widest font-mono">CLI</p>
          </div>
          <div className="relative border border-white/5 rounded-sm p-4 text-center">
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#38bdf8]/30" />
            <p className="text-[#38bdf8] text-2xl font-bold font-mono mb-1">{loading ? "·" : guardianData?.flask_count ?? 0}</p>
            <p className="text-white/20 text-[9px] tracking-widest font-mono">FLASK</p>
          </div>
          <div className="relative border border-white/5 rounded-sm p-4 text-center">
            <p className="text-white/40 text-2xl font-bold font-mono mb-1">{loading ? "·" : (guardianData?.total_events ?? 0) - (guardianData?.cli_count ?? 0) - (guardianData?.flask_count ?? 0)}</p>
            <p className="text-white/20 text-[9px] tracking-widest font-mono">OUTROS</p>
          </div>
        </div>
      </div>

      {/* Last 5 events */}
      <div>
        <p className="text-white/30 text-[10px] tracking-widest font-mono mb-3">⟁ ÚLTIMOS EVENTOS</p>
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-20"><div className="w-5 h-5 border border-white/20 border-t-transparent rounded-full animate-spin" /></div>
          ) : !(guardianData?.events ?? []).length ? (
            <p className="text-white/20 text-xs text-center py-8 font-mono tracking-widest">— SEM EVENTOS —</p>
          ) : (
            (guardianData?.events ?? []).slice(0, 5).map(e => (
              <div key={e.id} className={`border p-3 flex items-center gap-3 flex-wrap transition-all ${
                e.timeline_type === "nexus" ? "border-[#ff4040]/20 hover:border-[#ff4040]/40" :
                e.timeline_type === "branched" ? "border-[#f5a623]/15 hover:border-[#f5a623]/30" :
                "border-white/5 hover:border-white/10"
              }`}>
                <span className="text-base">
                  {e.timeline_type === "nexus" ? "⚡" : e.timeline_type === "branched" ? "🌿" : e.is_future ? "🔮" : "◈"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white/70 text-xs font-mono">{e.operator}</span>
                    <span className="text-white/25 text-[10px]">→</span>
                    <span className="text-white/50 text-xs font-mono truncate">{e.repo_name ?? "repo"}</span>
                    {e.is_future && <span className="text-[#ff4040] text-[10px] font-mono border border-[#ff4040]/40 px-1.5 py-0.5">FUTURO</span>}
                  </div>
                  <p className="text-white/20 text-[10px] font-mono mt-0.5">ano: {e.commit_year} · {e.commits_count} commits · {new Date(e.created_at).toLocaleString("pt-BR")}</p>
                </div>
                <button onClick={() => onPrune(e)}
                  className="border border-[#ff4040]/20 hover:border-[#ff4040]/60 text-[#ff4040]/40 hover:text-[#ff4040] px-3 py-1.5 text-[10px] tracking-widest font-mono transition-all flex-shrink-0">
                  PODAR
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Guardian: Mapa Temporal ──────────────────────────────────────────────────

function SectionGuardianMap({ guardianData, loading }: { guardianData: GuardianData | null; loading: boolean }) {
  const [yearFilter, setYearFilter] = useState("all")
  const events = guardianData?.events ?? []
  const years = useMemo(() => Array.from(new Set(events.map(e => e.commit_year))).sort((a,b) => a-b), [events])

  const filtered = useMemo(() =>
    yearFilter === "all" ? events : events.filter(e => String(e.commit_year) === yearFilter),
    [events, yearFilter]
  )

  const typeColor: Record<string, string> = { sacred: "#00ff88", branched: "#f5a623", nexus: "#ff4040", pruned: "#444" }
  const typeLabel: Record<string, string> = { sacred: "Sagrado", branched: "Ramificado", nexus: "Nexus", pruned: "Podado" }

  return (
    <div className="space-y-6">
      {/* SVG */}
      <div className="border border-white/5 rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/30 text-[10px] tracking-widest font-mono">⟁ MAPA TEMPORAL — 2015 ATÉ 2030</p>
          <div className="flex items-center gap-3">
            {[{ color: "#00ff88", label: "Sagrado" }, { color: "#f5a623", label: "Ramo" }, { color: "#ff4040", label: "Nexus" }, { color: "#444", label: "Podado" }].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 4px ${l.color}` }}/>
                <span className="text-white/25 text-[10px] font-mono">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-32 flex items-center justify-center"><div className="w-5 h-5 border border-white/20 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <TimelineSVG events={events} />
        )}
      </div>

      {/* Year filter + table */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          className="border border-white/10 px-3 py-1.5 text-white/50 text-xs font-mono focus:outline-none transition-colors"
          style={{ background: "#040810" }}>
          <option value="all">Todos os anos</option>
          {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        <span className="text-white/20 text-xs font-mono">{filtered.length} eventos</span>
      </div>

      <div className="border border-white/5 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5">
                {["Ano", "Operador", "Repo", "Commits", "Tipo", "Status"].map(h => (
                  <th key={h} className="text-left text-white/20 p-3 font-normal tracking-widest text-[10px] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={6} className="py-10 text-center text-white/20 tracking-widest">— SEM EVENTOS —</td></tr>
              ) : (
                [...filtered].sort((a,b) => b.commit_year - a.commit_year).map(e => (
                  <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="p-3" style={{ color: e.is_future ? "#ff4040" : "rgba(255,255,255,0.6)" }}>{e.commit_year}{e.is_future && " ⚡"}</td>
                    <td className="p-3 text-white/70">{e.operator}</td>
                    <td className="p-3 text-white/40 max-w-32 truncate">{e.repo_name ?? "—"}</td>
                    <td className="p-3 text-[#00ff88]">{e.commits_count}</td>
                    <td className="p-3">
                      <span className="border rounded px-2 py-0.5 text-[10px]" style={{ borderColor: `${typeColor[e.timeline_type]}40`, color: typeColor[e.timeline_type] }}>
                        {typeLabel[e.timeline_type] ?? e.timeline_type}
                      </span>
                    </td>
                    <td className="p-3 text-white/40">{e.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Guardian: Nexus Events ───────────────────────────────────────────────────

function SectionGuardianNexus({ guardianData, loading, onPrune }: { guardianData: GuardianData | null; loading: boolean; onPrune: (e: TimelineEvent) => void }) {
  const nexusEvents = useMemo(() =>
    [...(guardianData?.events ?? [])].filter(e => e.timeline_type === "nexus" || e.nexus_level > 5).sort((a,b) => b.nexus_level - a.nexus_level),
    [guardianData]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <PulsingDot color="#ff4040" />
        <span className="text-[#ff4040] text-[10px] tracking-widest font-mono">{nexusEvents.length} EVENTOS NEXUS DETECTADOS</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border border-[#ff4040] border-t-transparent rounded-full animate-spin" /></div>
      ) : !nexusEvents.length ? (
        <div className="border border-[#00ff88]/20 rounded-sm p-12 text-center">
          <p className="text-[#00ff88] text-sm font-mono mb-2">✓ LINHA DO TEMPO ESTÁVEL</p>
          <p className="text-white/20 text-xs font-mono tracking-widest">Nenhum Evento Nexus Detectado — A Linha do Tempo está Estável</p>
        </div>
      ) : (
        <div className="border border-white/5 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5">
                  {["Operador", "Repo", "Ano Commit", "Nível Nexus", "Tipo", "Status", "Data", "Ação"].map(h => (
                    <th key={h} className="text-left text-white/20 p-3 font-normal tracking-widest text-[10px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nexusEvents.map(e => (
                  <tr key={e.id} className="border-b border-[#ff4040]/5 hover:bg-[#ff4040]/[0.03] transition-colors">
                    <td className="p-3 text-white/70">{e.operator}</td>
                    <td className="p-3 text-white/40 max-w-28 truncate">{e.repo_name ?? "—"}</td>
                    <td className="p-3" style={{ color: e.is_future ? "#ff4040" : "rgba(255,255,255,0.6)" }}>{e.commit_year}{e.is_future && " ⚡"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(e.nexus_level, 10) }).map((_, i) => (
                          <div key={i} className="w-1.5 h-3 rounded-full" style={{ background: `rgba(255,64,64,${0.3 + i * 0.07})` }}/>
                        ))}
                        <span className="text-[#ff4040] ml-1">{e.nexus_level}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="border border-[#ff4040]/40 text-[#ff4040] px-2 py-0.5 text-[10px] rounded">
                        {e.timeline_type}
                      </span>
                    </td>
                    <td className="p-3 text-white/40">{e.status}</td>
                    <td className="p-3 text-white/25">{formatDate(e.created_at)}</td>
                    <td className="p-3">
                      <button onClick={() => onPrune(e)}
                        className="border border-[#ff4040]/30 hover:border-[#ff4040] text-[#ff4040]/50 hover:text-[#ff4040] px-3 py-1 text-[10px] tracking-widest font-mono transition-all">
                        PODAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Guardian: Variants ───────────────────────────────────────────────────────

function SectionGuardianVariants({ guardianData, loading, onPrune }: { guardianData: GuardianData | null; loading: boolean; onPrune: (e: TimelineEvent) => void }) {
  const variants = useMemo(() =>
    (guardianData?.events ?? []).filter(e => e.timeline_type === "branched" || e.timeline_type === "nexus"),
    [guardianData]
  )

  const byOperator = useMemo(() => {
    const map: Record<string, number> = {}
    variants.forEach(e => { map[e.operator] = (map[e.operator] ?? 0) + 1 })
    return Object.entries(map).map(([operator, count]) => ({ operator, count })).sort((a,b) => b.count - a.count)
  }, [variants])

  const tooltipStyle = { background: "#060910", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 0, fontFamily: "monospace", fontSize: 11 }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PulsingDot color="#f5a623" />
        <span className="text-[#f5a623] text-[10px] tracking-widest font-mono">{variants.length} VARIANTES DETECTADAS</span>
      </div>

      {/* Operator bar chart */}
      {byOperator.length > 0 && (
        <div className="border border-[#f5a623]/15 rounded-sm p-5">
          <p className="text-[#f5a623] text-[10px] tracking-widest mb-4 font-mono">⑂ VARIANTES POR OPERADOR</p>
          {loading ? (
            <div className="h-32 flex items-center justify-center"><div className="w-5 h-5 border border-[#f5a623] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byOperator}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(245,166,35,0.05)" />
                <XAxis dataKey="operator" tick={{ fill: "rgba(245,166,35,0.4)", fontSize: 9, fontFamily: "monospace" }} />
                <YAxis tick={{ fill: "rgba(245,166,35,0.4)", fontSize: 9, fontFamily: "monospace" }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#f5a623" }} />
                <Bar dataKey="count" fill="#f5a623" opacity={0.7} radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-white/5 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5">
                {["Operador", "Repo", "Ano", "Tipo", "Nível Nexus", "Status", "Data", "Ação"].map(h => (
                  <th key={h} className="text-left text-white/20 p-3 font-normal tracking-widest text-[10px] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center text-white/20 tracking-widest">CARREGANDO...</td></tr>
              ) : !variants.length ? (
                <tr><td colSpan={8} className="py-10 text-center text-white/20 tracking-widest">— SEM VARIANTES —</td></tr>
              ) : (
                variants.map(e => (
                  <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="p-3 text-white/70">{e.operator}</td>
                    <td className="p-3 text-white/40 max-w-28 truncate">{e.repo_name ?? "—"}</td>
                    <td className="p-3 text-white/60">{e.commit_year}</td>
                    <td className="p-3">
                      <span className={`border rounded px-2 py-0.5 text-[10px] ${e.timeline_type === "nexus" ? "border-[#ff4040]/40 text-[#ff4040]" : "border-[#f5a623]/40 text-[#f5a623]"}`}>
                        {e.timeline_type}
                      </span>
                    </td>
                    <td className="p-3 text-[#ff4040]">{e.nexus_level > 0 ? e.nexus_level : "—"}</td>
                    <td className="p-3 text-white/40">{e.status}</td>
                    <td className="p-3 text-white/25">{formatDate(e.created_at)}</td>
                    <td className="p-3">
                      <button onClick={() => onPrune(e)}
                        className="border border-white/10 hover:border-[#ff4040]/50 text-white/30 hover:text-[#ff4040] px-3 py-1 text-[10px] tracking-widest font-mono transition-all">
                        PODAR
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Guardian: Prunes Archive ─────────────────────────────────────────────────

function SectionGuardianPrunes({ guardianData, loading }: { guardianData: GuardianData | null; loading: boolean }) {
  const prunes = guardianData?.prunes ?? []

  const actionColor = (a: string) =>
    a === "pruned" ? "border-[#ff4040]/40 text-[#ff4040]" :
    a === "warned" ? "border-[#ff8c00]/40 text-[#ff8c00]" :
    "border-[#f5a623]/40 text-[#f5a623]"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-[10px] tracking-widest font-mono">✂ {prunes.length} PODAS REGISTRADAS</span>
        </div>
        <button
          onClick={() => downloadCSV("prunes.csv", prunes as unknown as Record<string, unknown>[])}
          disabled={!prunes.length}
          className="flex items-center gap-1.5 border border-white/10 hover:border-[#f5a623]/40 text-white/40 hover:text-[#f5a623] px-3 py-1.5 text-[10px] tracking-widest font-mono transition-all disabled:opacity-40"
        >
          <Download className="w-3 h-3" /> EXPORTAR CSV
        </button>
      </div>

      <div className="border border-white/5 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5">
                {["Data", "Evento ID", "Ação", "Guardião", "Motivo"].map(h => (
                  <th key={h} className="text-left text-white/20 p-3 font-normal tracking-widest text-[10px] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-white/20 tracking-widest">CARREGANDO...</td></tr>
              ) : !prunes.length ? (
                <tr><td colSpan={5} className="py-10 text-center text-white/20 tracking-widest">— SEM PODAS REGISTRADAS —</td></tr>
              ) : (
                prunes.map(p => (
                  <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="p-3 text-white/30">{formatDate(p.created_at)}</td>
                    <td className="p-3 text-white/40 font-mono">{p.event_id.slice(0,8)}...</td>
                    <td className="p-3">
                      <span className={`border rounded px-2 py-0.5 text-[10px] ${actionColor(p.action)}`}>
                        {p.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-white/60">{p.guardian}</td>
                    <td className="p-3 text-white/30 italic">{p.reason ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Guardian: Alerts ─────────────────────────────────────────────────────────

function SectionGuardianAlerts({ guardianData, loading }: { guardianData: GuardianData | null; loading: boolean }) {
  const [avtAlerts, setAvtAlerts] = useState<typeof AVT_MESSAGES>([])
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    const sample = [...AVT_MESSAGES].sort(() => Math.random() - 0.5).slice(0, 3)
    setAvtAlerts(sample)
  }, [])

  const tc = guardianData?.threat_level ?? "green"

  // Construct alert feed
  const alerts = useMemo(() => {
    const list: { id: string; level: string; title: string; msg: string }[] = []
    const events = guardianData?.events ?? []
    events.filter(e => e.is_future).forEach(e => {
      list.push({ id: e.id + "-future", level: "danger", title: "ANOMALIA TEMPORAL FUTURA", msg: `${e.operator} realizou commit no ano ${e.commit_year} (futuro). Repo: ${e.repo_name ?? "desconhecido"}` })
    })
    events.filter(e => e.nexus_level > 7).forEach(e => {
      list.push({ id: e.id + "-nexus", level: "danger", title: "EVENTO NEXUS CRÍTICO", msg: `Nível ${e.nexus_level}/10 detectado. Operador: ${e.operator}, Repo: ${e.repo_name ?? "?"}` })
    })
    events.filter(e => e.status === "warning").forEach(e => {
      list.push({ id: e.id + "-warn", level: "warning", title: "EVENTO SOB ALERTA", msg: `${e.operator} — ${e.repo_name ?? "repo"} — ano ${e.commit_year}` })
    })
    return list.slice(0, 10)
  }, [guardianData])

  const sendTestEvent = async () => {
    setSendingTest(true)
    try {
      const res = await fetch("/api/guardian/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator: "test-guardiao",
          repo_name: "avt-test-repo",
          repo_url: null,
          commit_year: new Date().getFullYear(),
          commits_count: 1,
          branch_name: "main",
          mode: "test",
          source: "api",
        }),
      })
      const json = await res.json()
      setTestResult(json.ok ? "Evento de teste enviado com sucesso." : "Erro ao enviar evento.")
      setTimeout(() => setTestResult(null), 3000)
    } catch { setTestResult("Falha na conexão com a API."); setTimeout(() => setTestResult(null), 3000) }
    finally { setSendingTest(false) }
  }

  const threatBg = tc === "critical" ? "border-[#ff4040] bg-[#ff4040]/10" : tc === "red" ? "border-[#ff8c00] bg-[#ff8c00]/10" : tc === "yellow" ? "border-[#f5a623] bg-[#f5a623]/10" : "border-[#00ff88] bg-[#00ff88]/10"
  const threatText = tc === "critical" ? "text-[#ff4040]" : tc === "red" ? "text-[#ff8c00]" : tc === "yellow" ? "text-[#f5a623]" : "text-[#00ff88]"
  const threatMsg = tc === "critical" ? "CRISE TEMPORAL CRÍTICA" : tc === "red" ? "EVENTOS NEXUS ATIVOS" : tc === "yellow" ? "RAMIFICAÇÕES DETECTADAS" : "LINHA SAGRADA ESTÁVEL"

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className={`border-2 rounded-sm p-5 ${threatBg} ${tc === "critical" ? "animate-pulse" : ""}`}>
        <div className="flex items-center gap-3">
          <PulsingDot color={tc === "green" ? "#00ff88" : tc === "yellow" ? "#f5a623" : "#ff4040"} />
          <span className={`text-lg font-black tracking-[0.3em] font-mono ${threatText}`} style={{ textShadow: "0 0 20px currentColor" }}>
            {threatMsg}
          </span>
        </div>
        <p className={`text-xs font-mono mt-1 tracking-widest ${threatText} opacity-60`}>
          Nível de ameaça: {tc.toUpperCase()} · Saúde: {guardianData?.timeline_health ?? 100}%
        </p>
      </div>

      {/* Alert feed */}
      <div>
        <p className="text-white/30 text-[10px] tracking-widest font-mono mb-3">⚠ FEED DE ALERTAS</p>
        {loading ? (
          <div className="flex items-center justify-center h-20"><div className="w-5 h-5 border border-white/20 border-t-transparent rounded-full animate-spin" /></div>
        ) : !alerts.length ? (
          <div className="border border-[#00ff88]/20 rounded-sm p-6 text-center">
            <p className="text-[#00ff88] text-xs font-mono tracking-widest">✓ NENHUM ALERTA ATIVO — LINHA DO TEMPO ESTÁVEL</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className={`border rounded-sm p-3 ${a.level === "danger" ? "border-[#ff4040]/30 bg-[#ff4040]/5" : "border-[#ff8c00]/20 bg-[#ff8c00]/5"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono font-bold tracking-widest ${a.level === "danger" ? "text-[#ff4040]" : "text-[#ff8c00]"}`}>{a.title}</span>
                </div>
                <p className="text-white/50 text-xs font-mono">{a.msg}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AVT Transmissions */}
      <div>
        <p className="text-white/30 text-[10px] tracking-widest font-mono mb-3">📡 TRANSMISSÕES AVT</p>
        <div className="space-y-2">
          {avtAlerts.map((a, i) => (
            <AVTAlert key={i} {...a} onDismiss={() => setAvtAlerts(prev => prev.filter((_, j) => j !== i))} />
          ))}
        </div>
      </div>

      {/* Test event button */}
      <div className="border border-white/5 rounded-sm p-5">
        <p className="text-white/30 text-[10px] tracking-widest font-mono mb-3">⚙ FERRAMENTAS DE TESTE</p>
        <button
          onClick={sendTestEvent}
          disabled={sendingTest}
          className="flex items-center gap-2 border border-[#f5a623]/30 hover:border-[#f5a623]/60 text-[#f5a623]/60 hover:text-[#f5a623] px-4 py-2 text-[10px] tracking-widest font-mono transition-all disabled:opacity-40"
        >
          <Shield className={`w-3 h-3 ${sendingTest ? "animate-spin" : ""}`} />
          {sendingTest ? "ENVIANDO..." : "ENVIAR ALERTA TESTE"}
        </button>
        {testResult && (
          <p className="text-[#00ff88] text-xs font-mono mt-2 tracking-widest">{testResult}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [section, setSection] = useState<Section>("overview")
  const [data, setData] = useState<StatsData | null>(null)
  const [guardianData, setGuardianData] = useState<GuardianData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [pruneTarget, setPruneTarget] = useState<TimelineEvent | null>(null)
  const [pruneSuccess, setPruneSuccess] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, guardRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/guardian"),
      ])
      const [stats, guardian] = await Promise.all([statsRes.json(), guardRes.json()])
      if (!stats.error) setData(stats)
      if (!guardian.error) setGuardianData(guardian)
      setLastUpdated(new Date())
    } catch { /* keep old */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, 30000)
    return () => clearInterval(t)
  }, [fetchAll])

  const handlePruneSuccess = () => {
    setPruneSuccess("Evento processado com sucesso.")
    setTimeout(() => { setPruneSuccess(null); fetchAll() }, 2500)
  }

  const renderSection = () => {
    switch (section) {
      case "overview":
        return <SectionOverview data={data} guardianData={guardianData} loading={loading} />
      case "installs":
        return <SectionInstalls data={data} loading={loading} />
      case "commits":
        return <SectionCommits data={data} loading={loading} />
      case "feedbacks":
        return <SectionFeedbacks data={data} loading={loading} />
      case "improvements":
        return <SectionImprovements data={data} loading={loading} />
      case "backups":
        return <SectionBackups data={data} guardianData={guardianData} loading={loading} lastUpdated={lastUpdated} />
      case "guardian":
        return <SectionGuardian guardianData={guardianData} loading={loading} onPrune={setPruneTarget} />
      case "guardian-map":
        return <SectionGuardianMap guardianData={guardianData} loading={loading} />
      case "guardian-nexus":
        return <SectionGuardianNexus guardianData={guardianData} loading={loading} onPrune={setPruneTarget} />
      case "guardian-variants":
        return <SectionGuardianVariants guardianData={guardianData} loading={loading} onPrune={setPruneTarget} />
      case "guardian-prunes":
        return <SectionGuardianPrunes guardianData={guardianData} loading={loading} />
      case "guardian-alerts":
        return <SectionGuardianAlerts guardianData={guardianData} loading={loading} />
      default:
        return null
    }
  }

  return (
    <div style={{ background: "#040810" }} className="min-h-screen flex font-mono text-white">
      <ScanLine />
      <Sidebar activeSection={section} onNavigate={setSection} />

      <main className="flex-1 ml-60 overflow-auto min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-white/5 px-6 py-3 flex items-center justify-between" style={{ background: "rgba(4,8,16,0.95)", backdropFilter: "blur(8px)" }}>
          <div className="flex items-center gap-3">
            <span className="text-white/20 text-[10px] tracking-widest font-mono">AVT HQ</span>
            <span className="text-white/10">/</span>
            <span className="text-white/60 text-xs font-mono tracking-wide">{SECTION_TITLES[section]}</span>
            {loading && <div className="w-3 h-3 border border-[#f5a623]/60 border-t-transparent rounded-full animate-spin" />}
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-white/20 text-[10px] font-mono tracking-widest hidden md:block">
                {lastUpdated.toLocaleTimeString("pt-BR")} TVA
              </span>
            )}
            <button onClick={fetchAll} disabled={loading}
              className="flex items-center gap-1.5 border border-white/10 hover:border-[#f5a623]/40 text-white/30 hover:text-[#f5a623] px-3 py-1.5 text-[10px] tracking-widest font-mono transition-all disabled:opacity-40">
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              SYNC
            </button>
            <span className="text-[#f5a623] text-xs font-black tracking-[0.2em]" style={{ textShadow: "0 0 15px rgba(245,166,35,0.4)" }}>
              <Glitch text="AVT" />
            </span>
          </div>
        </div>

        {/* Prune success */}
        {pruneSuccess && (
          <div className="mx-6 mt-4 border border-[#00ff88]/30 bg-[#00ff88]/5 p-3 flex items-center gap-2 text-[#00ff88] text-xs font-mono tracking-widest">
            <PulsingDot color="#00ff88" /> {pruneSuccess}
          </div>
        )}

        {/* Section content */}
        <div className="p-6">
          {renderSection()}
        </div>

        {/* Footer */}
        <div className="mx-6 mb-6 border-t border-white/5 pt-4 flex items-center justify-between text-[10px] text-white/15 font-mono tracking-widest">
          <span>AVT · COMMITFORGE v3.0.0 · PAINEL CLASSIFICADO</span>
          <span>ÚLTIMA SINC: {lastUpdated?.toLocaleTimeString("pt-BR") ?? "—"}</span>
        </div>
      </main>

      {/* Prune modal */}
      {pruneTarget && (
        <PruneModal
          target={pruneTarget}
          onClose={() => setPruneTarget(null)}
          onSuccess={handlePruneSuccess}
        />
      )}
    </div>
  )
}
