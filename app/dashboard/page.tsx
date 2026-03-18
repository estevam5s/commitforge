"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { RefreshCw, Star, Download, GitCommit, MessageSquare, Lightbulb, Database, Activity, ChevronDown, ChevronUp, Filter, Copy, Check, Terminal, Shield, Zap, Server, ExternalLink } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"

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

function formatDate(iso: string) { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) }
function formatDuration(ms: number | null) { if (!ms) return "—"; if (ms < 1000) return `${ms}ms`; if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`; return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s` }
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

function AVTBadge({ value, map }: { value: string; map: Record<string, string> }) {
  const col: Record<string, string> = { pending: "border-yellow-500/40 text-yellow-400", in_progress: "border-blue-500/40 text-blue-400", running: "border-amber-500/40 text-amber-400", completed: "border-green-500/40 text-[#00ff88]", done: "border-green-500/40 text-[#00ff88]", failed: "border-red-500/40 text-red-400", cancelled: "border-white/10 text-white/30", reviewed: "border-purple-500/40 text-purple-400", low: "border-white/10 text-white/30", medium: "border-yellow-500/40 text-yellow-400", high: "border-orange-500/40 text-orange-400", critical: "border-red-500/40 text-red-400" }
  const cls = col[value] ?? "border-white/10 text-white/40"
  return <span className={`inline-flex items-center border rounded px-2 py-0.5 text-[10px] font-mono tracking-wider ${cls}`}>{map[value] ?? value}</span>
}

function ScanLine() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.4) 2px, rgba(0,255,136,0.4) 4px)" }} />
  )
}

function Glitch({ text }: { text: string }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-0 text-[#ff4040] opacity-0 hover:opacity-60 transition-opacity duration-75 select-none" style={{ clipPath: "inset(30% 0 50% 0)", transform: "translateX(-2px)" }} aria-hidden>{text}</span>
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
    amber:  { border: "border-[#f5a623]/30", glow: "shadow-[#f5a623]/10",  text: "text-[#f5a623]",  bg: "from-[#f5a623]/5 to-transparent" },
    green:  { border: "border-[#00ff88]/30", glow: "shadow-[#00ff88]/10",  text: "text-[#00ff88]",  bg: "from-[#00ff88]/5 to-transparent" },
    blue:   { border: "border-[#4aabff]/30", glow: "shadow-[#4aabff]/10",  text: "text-[#4aabff]",  bg: "from-[#4aabff]/5 to-transparent" },
    red:    { border: "border-[#ff4040]/30", glow: "shadow-[#ff4040]/10",  text: "text-[#ff4040]",  bg: "from-[#ff4040]/5 to-transparent" },
  }
  const p = palettes[color] ?? palettes.amber
  return (
    <div className={`relative bg-gradient-to-br ${p.bg} border ${p.border} rounded-sm p-5 shadow-lg ${p.glow} overflow-hidden group`}>
      {/* Corner decorations */}
      <span className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${p.border} opacity-60`} />
      <span className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${p.border} opacity-60`} />
      <span className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${p.border} opacity-60`} />
      <span className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${p.border} opacity-60`} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-white/40 text-xs tracking-widest uppercase font-mono">{title}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-4xl font-bold font-mono mb-1 ${p.text}`} style={{ textShadow: `0 0 20px currentColor` }}>{value}</p>
      {sub && <p className="text-white/20 text-xs font-mono mt-1">{sub}</p>}
    </div>
  )
}

function AVTAlert({ agent, msg, icon, level, onDismiss }: { agent: string; msg: string; icon: string; level: string; onDismiss: () => void }) {
  const colors: Record<string, string> = { info: "border-[#f5a623]/40 bg-[#f5a623]/5", warning: "border-[#ff8c00]/50 bg-[#ff8c00]/8", danger: "border-[#ff4040]/50 bg-[#ff4040]/8" }
  return (
    <div className={`relative border ${colors[level] ?? colors.info} rounded-sm p-3 mb-3 animate-in slide-in-from-right-4 duration-300`}>
      <button onClick={onDismiss} className="absolute top-2 right-2 text-white/20 hover:text-white/60 text-xs">×</button>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-[#f5a623] font-mono text-xs tracking-widest">{agent}</span>
        <PulsingDot color={level === "warning" ? "#ff8c00" : "#f5a623"} />
      </div>
      <p className="text-white/70 text-xs font-mono leading-relaxed italic">"{msg}"</p>
    </div>
  )
}

function GuardianPanel() {
  const [data, setData] = useState<GuardianData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pruneTarget, setPruneTarget] = useState<TimelineEvent | null>(null)
  const [pruneAction, setPruneAction] = useState<"pruned" | "warned" | "monitored">("pruned")
  const [pruneReason, setPruneReason] = useState("")
  const [pruning, setPruning] = useState(false)
  const [pruneSuccess, setPruneSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"stream" | "timeline" | "nexus" | "log">("stream")
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  const fetchGuardian = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/guardian")
      const json = await res.json()
      if (!json.error) setData(json)
    } catch { /* keep old */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchGuardian()
    const t = setInterval(fetchGuardian, 12000)
    return () => clearInterval(t)
  }, [fetchGuardian])

  const doPrune = async () => {
    if (!pruneTarget) return
    setPruning(true)
    try {
      const res = await fetch("/api/guardian/prune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: pruneTarget.id, action: pruneAction, reason: pruneReason, guardian: "Guardião AVT" }),
      })
      const json = await res.json()
      if (json.ok) {
        setPruneSuccess(`Evento ${pruneAction === "pruned" ? "podado" : pruneAction === "warned" ? "alertado" : "monitorado"} com sucesso.`)
        setPruneTarget(null)
        setPruneReason("")
        setTimeout(() => { setPruneSuccess(null); fetchGuardian() }, 2500)
      }
    } catch { /* ignore */ } finally { setPruning(false) }
  }

  // Timeline SVG visualization
  const TimelineSVG = () => {
    if (!data) return null
    const years = Array.from({ length: 16 }, (_, i) => 2015 + i) // 2015-2030
    const W = 700, H = 120, PAD = 40
    const yearX = (y: number) => PAD + ((y - 2015) / 15) * (W - PAD * 2)
    const cy = 70

    const eventsByYear: Record<number, TimelineEvent[]> = {}
    ;(data.events ?? []).forEach(e => {
      if (e.commit_year >= 2015 && e.commit_year <= 2030) {
        if (!eventsByYear[e.commit_year]) eventsByYear[e.commit_year] = []
        eventsByYear[e.commit_year].push(e)
      }
    })

    const typeColor = (t: string) =>
      t === "nexus" ? "#ff4040" : t === "branched" ? "#f5a623" : t === "pruned" ? "#444" : "#00ff88"

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 120 }}>
        <defs>
          <filter id="glow-sacred-g"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00ff88" floodOpacity="0.6"/></filter>
          <filter id="glow-nexus-g"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff4040" floodOpacity="0.8"/></filter>
          <filter id="glow-branch-g"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f5a623" floodOpacity="0.7"/></filter>
        </defs>
        {/* Future zone */}
        <rect x={yearX(new Date().getFullYear())} y={0} width={W - yearX(new Date().getFullYear())} height={H} fill="rgba(255,64,64,0.04)"/>
        {/* Sacred timeline main line */}
        <line x1={PAD} y1={cy} x2={W - PAD} y2={cy} stroke="#00ff88" strokeWidth="1.5" opacity="0.25" filter="url(#glow-sacred-g)"/>
        {/* Current year marker */}
        <line x1={yearX(new Date().getFullYear())} y1={10} x2={yearX(new Date().getFullYear())} y2={H - 10} stroke="#f5a623" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
        <text x={yearX(new Date().getFullYear()) + 3} y={18} fill="#f5a623" fontSize="7" fontFamily="monospace" opacity="0.7">HOJE</text>
        {/* Year ticks */}
        {years.filter((_, i) => i % 3 === 0).map(y => (
          <g key={y}>
            <line x1={yearX(y)} y1={cy - 4} x2={yearX(y)} y2={cy + 4} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            <text x={yearX(y)} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="monospace">{y}</text>
          </g>
        ))}
        {/* Branch arcs */}
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
              filter={col === "#ff4040" ? "url(#glow-nexus-g)" : "url(#glow-branch-g)"}/>
          )
        })}
        {/* Commit nodes */}
        {Object.entries(eventsByYear).map(([yr, evts]) => {
          const x = yearX(parseInt(yr))
          const topType = evts.find(e => e.timeline_type === "nexus")?.timeline_type
            ?? evts.find(e => e.timeline_type === "branched")?.timeline_type
            ?? "sacred"
          const col = typeColor(topType)
          const r = Math.min(8, 3 + Math.log2(evts.reduce((s, e) => s + e.commits_count, 0) + 1))
          const flt = topType === "nexus" ? "url(#glow-nexus-g)" : topType === "branched" ? "url(#glow-branch-g)" : "url(#glow-sacred-g)"
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

  const threatColors = {
    green:    { text: "text-[#00ff88]", border: "border-[#00ff88]", bg: "bg-[#00ff88]/10", label: "LINHA SAGRADA ESTÁVEL" },
    yellow:   { text: "text-[#f5a623]", border: "border-[#f5a623]", bg: "bg-[#f5a623]/10", label: "RAMIFICAÇÕES DETECTADAS" },
    red:      { text: "text-[#ff8c00]", border: "border-[#ff8c00]", bg: "bg-[#ff8c00]/10", label: "EVENTOS NEXUS ATIVOS" },
    critical: { text: "text-[#ff4040]", border: "border-[#ff4040]", bg: "bg-[#ff4040]/10", label: "CRISE TEMPORAL CRÍTICA" },
  }
  const tc = data ? (threatColors[data.threat_level] ?? threatColors.green) : threatColors.green

  const typeLabel: Record<string, string> = { sacred: "Sagrado", branched: "Ramificado", nexus: "Nexus", pruned: "Podado" }
  const typeBadgeColor: Record<string, string> = {
    sacred:   "border-[#00ff88]/40 text-[#00ff88]",
    branched: "border-[#f5a623]/40 text-[#f5a623]",
    nexus:    "border-[#ff4040]/50 text-[#ff4040]",
    pruned:   "border-white/10 text-white/25",
  }
  const sourceLabel: Record<string, string> = { cli: "CLI", flask: "Flask", api: "API", manual: "Manual" }

  return (
    <section className="relative border border-[#ff4040]/20 bg-[#ff4040]/[0.02] rounded-sm overflow-hidden">
      {/* Corner decorations */}
      <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#ff4040]/40" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#ff4040]/40" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#ff4040]/40" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#ff4040]/40" />

      {/* Header */}
      <div className={`border-b border-[#ff4040]/15 p-5 ${tc.bg}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🏛️</span>
              <span className={`text-xl font-black tracking-[0.3em] font-mono ${tc.text}`}
                style={{ textShadow: `0 0 30px currentColor` }}>
                GUARDIÃO DA LINHA DO TEMPO
              </span>
              <PulsingDot color={data?.threat_level === "green" ? "#00ff88" : data?.threat_level === "yellow" ? "#f5a623" : "#ff4040"} />
            </div>
            <p className={`text-xs tracking-widest font-mono ${tc.text} opacity-70`}>{tc.label}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchGuardian} disabled={loading}
              className="flex items-center gap-1.5 border border-[#ff4040]/30 hover:border-[#ff4040]/70 text-[#ff4040]/60 hover:text-[#ff4040] px-4 py-2 text-[10px] tracking-widest transition-all disabled:opacity-40">
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              SINCRONIZAR
            </button>
          </div>
        </div>

        {/* Health bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/30 text-[10px] tracking-widest font-mono">INTEGRIDADE DA LINHA DO TEMPO SAGRADA</span>
            <span className={`text-sm font-bold font-mono ${tc.text}`}>{loading ? "···" : `${data?.timeline_health ?? 0}%`}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${data?.timeline_health ?? 0}%`,
                background: `linear-gradient(90deg, ${
                  (data?.timeline_health ?? 0) > 70 ? "#00ff88" :
                  (data?.timeline_health ?? 0) > 40 ? "#f5a623" : "#ff4040"
                }, ${
                  (data?.timeline_health ?? 0) > 70 ? "#00cc66" :
                  (data?.timeline_health ?? 0) > 40 ? "#ff8c00" : "#cc0000"
                })`,
                boxShadow: `0 0 10px ${(data?.timeline_health ?? 0) > 70 ? "#00ff88" : (data?.timeline_health ?? 0) > 40 ? "#f5a623" : "#ff4040"}`,
              }}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mt-4">
          {[
            { label: "Total",    value: data?.total_events   ?? 0, color: "text-white/50" },
            { label: "Sagrados", value: data ? (data.total_events - data.nexus_count - data.branch_count - data.pruned_count) : 0, color: "text-[#00ff88]" },
            { label: "Ramos",    value: data?.branch_count   ?? 0, color: "text-[#f5a623]" },
            { label: "Nexus",    value: data?.nexus_count    ?? 0, color: "text-[#ff4040]" },
            { label: "Podados",  value: data?.pruned_count   ?? 0, color: "text-white/25" },
            { label: "CLI",      value: data?.cli_count      ?? 0, color: "text-[#a78bfa]" },
            { label: "Flask",    value: data?.flask_count    ?? 0, color: "text-[#38bdf8]" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-lg font-bold font-mono ${s.color}`}>{loading ? "·" : s.value}</p>
              <p className="text-white/20 text-[10px] tracking-widest">{s.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Timeline SVG */}
        <div className="border border-white/5 bg-black/30 p-4 rounded-sm">
          <p className="text-white/20 text-[10px] tracking-widest mb-3 font-mono">◈ MAPA TEMPORAL — 2015 ATÉ 2030</p>
          <TimelineSVG />
          <div className="flex items-center gap-4 mt-2 justify-center">
            {[
              { color: "#00ff88", label: "Sagrado" },
              { color: "#f5a623", label: "Ramificado" },
              { color: "#ff4040", label: "Nexus" },
              { color: "#444",    label: "Podado" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 4px ${l.color}` }}/>
                <span className="text-white/30 text-[10px] font-mono">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prune success notification */}
        {pruneSuccess && (
          <div className="border border-[#00ff88]/30 bg-[#00ff88]/5 p-3 text-[#00ff88] text-xs font-mono tracking-widest flex items-center gap-2">
            <PulsingDot color="#00ff88" /> {pruneSuccess}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/5">
          {(["stream","timeline","nexus","log"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[10px] tracking-widest font-mono border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#ff4040] text-[#ff4040]"
                  : "border-transparent text-white/25 hover:text-white/50"
              }`}>
              {tab === "stream" ? "STREAM AO VIVO" :
               tab === "timeline" ? "GRÁFICO TEMPORAL" :
               tab === "nexus" ? `NEXUS EVENTS ${(data?.nexus_count ?? 0) > 0 ? `(${data?.nexus_count})` : ""}` :
               "LOG DO GUARDIÃO"}
            </button>
          ))}
        </div>

        {/* Tab: Stream */}
        {activeTab === "stream" && (
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center h-20"><div className="w-4 h-4 border border-[#ff4040] border-t-transparent rounded-full animate-spin" /></div>
            ) : !(data?.events ?? []).filter(e => e.status !== "pruned").length ? (
              <p className="text-white/20 text-xs text-center py-8 tracking-widest font-mono">— NENHUM EVENTO ATIVO —</p>
            ) : (
              (data?.events ?? []).filter(e => e.status !== "pruned").slice(0, 30).map(e => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEvent(selectedEvent?.id === e.id ? null : e)}
                  className={`border transition-all cursor-pointer p-3 ${
                    e.timeline_type === "nexus"    ? "border-[#ff4040]/25 hover:border-[#ff4040]/60 hover:bg-[#ff4040]/5" :
                    e.timeline_type === "branched" ? "border-[#f5a623]/20 hover:border-[#f5a623]/50 hover:bg-[#f5a623]/5" :
                    "border-white/5 hover:border-[#00ff88]/20 hover:bg-[#00ff88]/5"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg">
                      {e.timeline_type === "nexus" ? "⚡" : e.timeline_type === "branched" ? "🌿" : e.is_future ? "🔮" : "◈"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white/70 text-xs font-mono font-semibold">{e.operator}</span>
                        <span className="text-white/30 text-[10px]">→</span>
                        <span className="text-white/50 text-xs font-mono truncate max-w-32">{e.repo_name ?? "repo desconhecido"}</span>
                        <span className={`inline-flex items-center border rounded px-2 py-0.5 text-[10px] font-mono ${typeBadgeColor[e.timeline_type] ?? "border-white/10 text-white/30"}`}>
                          {typeLabel[e.timeline_type] ?? e.timeline_type}
                        </span>
                        {e.is_future && <span className="text-[#ff4040] text-[10px] font-mono border border-[#ff4040]/40 px-1.5 py-0.5">FUTURO</span>}
                        {e.status === "monitored" && <span className="text-[#f5a623] text-[10px] font-mono border border-[#f5a623]/40 px-1.5 py-0.5">MONIT.</span>}
                        {e.status === "warning" && <span className="text-[#ff8c00] text-[10px] font-mono border border-[#ff8c00]/40 px-1.5 py-0.5">ALERTA</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-white/25 font-mono">
                        <span>ano: {e.commit_year}</span>
                        <span>{e.commits_count} commits</span>
                        <span>{sourceLabel[e.source] ?? e.source}</span>
                        <span>{new Date(e.created_at).toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {e.nexus_level > 0 && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: Math.min(e.nexus_level, 5) }).map((_, i) => (
                            <div key={i} className="w-1 h-3 rounded-full" style={{ background: `rgba(255,64,64,${0.3 + i * 0.14})` }}/>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={ev => { ev.stopPropagation(); setPruneTarget(e); setPruneAction("pruned") }}
                        className="border border-[#ff4040]/20 hover:border-[#ff4040]/60 text-[#ff4040]/40 hover:text-[#ff4040] px-2 py-1 text-[10px] tracking-widest transition-all"
                      >
                        PODAR
                      </button>
                      <button
                        onClick={ev => { ev.stopPropagation(); setPruneTarget(e); setPruneAction("monitored") }}
                        className="border border-[#f5a623]/20 hover:border-[#f5a623]/60 text-[#f5a623]/40 hover:text-[#f5a623] px-2 py-1 text-[10px] tracking-widest transition-all"
                      >
                        MONIT.
                      </button>
                    </div>
                  </div>
                  {selectedEvent?.id === e.id && (
                    <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                      {[
                        { k: "ID",         v: e.id.slice(0, 8) + "..." },
                        { k: "Operador",   v: e.operator },
                        { k: "Repo",       v: e.repo_name ?? "—" },
                        { k: "Ano Alvo",   v: String(e.commit_year) },
                        { k: "Commits",    v: String(e.commits_count) },
                        { k: "Branch",     v: e.branch_name ?? "—" },
                        { k: "Modo",       v: e.mode ?? "—" },
                        { k: "Nível Nexus",v: String(e.nexus_level) + "/10" },
                        { k: "Origem",     v: sourceLabel[e.source] ?? e.source },
                      ].map(row => (
                        <div key={row.k}>
                          <p className="text-white/20 tracking-widest">{row.k.toUpperCase()}</p>
                          <p className="text-white/60">{row.v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Timeline chart */}
        {activeTab === "timeline" && (
          <div>
            {loading || !data?.timeline_chart.length ? (
              <p className="text-white/20 text-xs text-center py-8 tracking-widest font-mono">— SEM DADOS TEMPORAIS —</p>
            ) : (
              <div className="space-y-2">
                <p className="text-white/20 text-[10px] tracking-widest font-mono mb-4">COMMITS POR ANO — TODOS OS OPERADORES</p>
                {data.timeline_chart.map(row => {
                  const maxVal = Math.max(...data.timeline_chart.map(r => r.count))
                  const pct = maxVal > 0 ? (row.count / maxVal) * 100 : 0
                  const color = row.isFuture ? "#ff4040" :
                    row.year < new Date().getFullYear() - 2 ? "#f5a623" : "#00ff88"
                  return (
                    <div key={row.year} className="flex items-center gap-3">
                      <span className={`text-xs font-mono w-12 ${row.isFuture ? "text-[#ff4040]" : "text-white/40"}`}>{row.year}</span>
                      <div className="flex-1 h-5 bg-white/5 rounded-sm overflow-hidden">
                        <div
                          className="h-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color, opacity: 0.7, boxShadow: `0 0 6px ${color}` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-12 text-right" style={{ color }}>{row.count}</span>
                      {row.isFuture && <span className="text-[#ff4040] text-[10px] font-mono">⚡ NEXUS</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Nexus Events */}
        {activeTab === "nexus" && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-20"><div className="w-4 h-4 border border-[#ff4040] border-t-transparent rounded-full animate-spin" /></div>
            ) : !(data?.events ?? []).filter(e => e.timeline_type === "nexus").length ? (
              <div className="text-center py-8">
                <p className="text-[#00ff88] text-sm font-mono mb-1">✓ LINHA DO TEMPO ESTÁVEL</p>
                <p className="text-white/20 text-xs font-mono tracking-widest">Nenhum Evento Nexus ativo. Mobius aprova.</p>
              </div>
            ) : (
              (data?.events ?? []).filter(e => e.timeline_type === "nexus").map(e => (
                <div key={e.id} className="border border-[#ff4040]/30 bg-[#ff4040]/5 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-[80px] opacity-5 font-black text-[#ff4040] leading-none pointer-events-none select-none">⚡</div>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#ff4040] text-lg">⚡</span>
                        <span className="text-[#ff4040] font-mono font-bold text-sm">NEXUS EVENT</span>
                        <span className="border border-[#ff4040]/40 text-[#ff4040] text-[10px] font-mono px-2 py-0.5">NÍVEL {e.nexus_level}/10</span>
                        {e.is_future && <span className="border border-[#ff4040]/60 text-[#ff4040] text-[10px] font-mono px-2 py-0.5 animate-pulse">⚠ FUTURO</span>}
                      </div>
                      <p className="text-white/70 text-xs font-mono">
                        <span className="text-white/40">Operador:</span> {e.operator} &nbsp;·&nbsp;
                        <span className="text-white/40">Repo:</span> {e.repo_name ?? "desconhecido"} &nbsp;·&nbsp;
                        <span className="text-white/40">Ano:</span> {e.commit_year} &nbsp;·&nbsp;
                        <span className="text-white/40">Commits:</span> {e.commits_count}
                      </p>
                      <p className="text-white/30 text-[10px] font-mono mt-1">
                        Detectado: {new Date(e.created_at).toLocaleString("pt-BR")} · Origem: {sourceLabel[e.source] ?? e.source}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { setPruneTarget(e); setPruneAction("pruned") }}
                        className="border border-[#ff4040]/50 hover:border-[#ff4040] bg-[#ff4040]/10 hover:bg-[#ff4040]/20 text-[#ff4040] px-4 py-2 text-[10px] tracking-widest font-mono transition-all"
                      >
                        ✂ PODAR EVENTO
                      </button>
                      <button
                        onClick={() => { setPruneTarget(e); setPruneAction("monitored") }}
                        className="border border-[#f5a623]/30 hover:border-[#f5a623] text-[#f5a623]/60 hover:text-[#f5a623] px-4 py-2 text-[10px] tracking-widest font-mono transition-all"
                      >
                        👁 MONITORAR
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Guardian Log */}
        {activeTab === "log" && (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center h-20"><div className="w-4 h-4 border border-[#ff4040] border-t-transparent rounded-full animate-spin" /></div>
            ) : !(data?.prunes ?? []).length ? (
              <p className="text-white/20 text-xs text-center py-8 tracking-widest font-mono">— SEM AÇÕES DO GUARDIÃO —</p>
            ) : (
              (data?.prunes ?? []).map(p => (
                <div key={p.id} className="border border-white/5 p-3 text-xs font-mono">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white/25 text-[10px]">{new Date(p.created_at).toLocaleString("pt-BR")}</span>
                    <span className={`border px-2 py-0.5 text-[10px] ${
                      p.action === "pruned" ? "border-[#ff4040]/40 text-[#ff4040]" :
                      p.action === "warned" ? "border-[#ff8c00]/40 text-[#ff8c00]" :
                      p.action === "escalated" ? "border-[#a78bfa]/40 text-[#a78bfa]" :
                      "border-[#f5a623]/40 text-[#f5a623]"
                    }`}>{p.action.toUpperCase()}</span>
                    <span className="text-white/50">{p.guardian}</span>
                    {p.reason && <span className="text-white/30 italic">"{p.reason}"</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Prune modal */}
      {pruneTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative border border-[#ff4040]/40 bg-[#040810] p-6 max-w-md w-full mx-4">
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff4040]/60" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff4040]/60" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ff4040]/60" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ff4040]/60" />
            <h3 className="text-[#ff4040] font-mono font-bold tracking-widest mb-1">AÇÃO DO GUARDIÃO</h3>
            <p className="text-white/30 text-xs font-mono mb-4 tracking-widest">
              {pruneTarget.operator} · {pruneTarget.repo_name} · {pruneTarget.commit_year}
            </p>
            <div className="flex gap-2 mb-4">
              {(["pruned","warned","monitored"] as const).map(a => (
                <button key={a} onClick={() => setPruneAction(a)}
                  className={`flex-1 py-2 text-[10px] tracking-widest font-mono border transition-all ${
                    pruneAction === a
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
              value={pruneReason}
              onChange={e => setPruneReason(e.target.value)}
              placeholder="Motivo (opcional)..."
              rows={2}
              className="w-full bg-black border border-white/10 focus:border-[#ff4040]/40 outline-none p-3 text-xs font-mono text-white/60 placeholder-white/15 resize-none mb-4 transition-colors"
            />
            <div className="flex gap-3">
              <button onClick={() => setPruneTarget(null)}
                className="flex-1 border border-white/10 text-white/30 py-2 text-xs tracking-widest font-mono hover:border-white/30 transition-colors">
                CANCELAR
              </button>
              <button onClick={doPrune} disabled={pruning}
                className="flex-1 border border-[#ff4040]/50 bg-[#ff4040]/15 hover:bg-[#ff4040]/30 text-[#ff4040] py-2 text-xs tracking-widest font-mono disabled:opacity-40 transition-all">
                {pruning ? "EXECUTANDO..." : "CONFIRMAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default function DashboardPage() {
  const [data, setData]               = useState<StatsData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [feedbackFilter, setFeedbackFilter] = useState("all")
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null)
  const [avtAlerts, setAvtAlerts]     = useState<typeof AVT_MESSAGES>([])
  const [clock, setClock]             = useState("")
  const [scanY, setScanY]             = useState(0)
  const alertTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [copiedCmd, setCopiedCmd]     = useState<string | null>(null)
  const [flaskStatus, setFlaskStatus] = useState<"checking" | "online" | "offline" | "idle">("idle")
  const [tokenInput, setTokenInput]   = useState("")
  const [tokenStatus, setTokenStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle")

  // Clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("pt-BR", { hour12: false }) + " TVA"), 1000)
    return () => clearInterval(t)
  }, [])

  // Scan-line animation
  useEffect(() => {
    const t = setInterval(() => setScanY(y => (y + 1) % 100), 30)
    return () => clearInterval(t)
  }, [])

  // Random AVT alerts
  useEffect(() => {
    const fire = () => {
      const alert = AVT_MESSAGES[Math.floor(Math.random() * AVT_MESSAGES.length)]
      setAvtAlerts(prev => [alert, ...prev].slice(0, 5))
    }
    fire()
    alertTimerRef.current = setInterval(fire, 18000)
    return () => { if (alertTimerRef.current) clearInterval(alertTimerRef.current) }
  }, [])

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stats")
      const json = await res.json()
      setData(json)
      setLastRefresh(new Date())
    } catch { /* keep old data */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStats()
    const t = setInterval(fetchStats, 60_000)
    return () => clearInterval(t)
  }, [fetchStats])

  const filteredFeedbacks = data?.feedbacks.filter(f => feedbackFilter === "all" || f.category === feedbackFilter) ?? []
  const avgRating = data?.feedbacks.length ? (data.feedbacks.reduce((a, f) => a + (f.rating ?? 0), 0) / data.feedbacks.filter(f => f.rating).length).toFixed(1) : "—"

  const copyCmd = async (cmd: string) => {
    try { await navigator.clipboard.writeText(cmd) } catch { /* ignore */ }
    setCopiedCmd(cmd)
    setTimeout(() => setCopiedCmd(null), 1500)
  }

  const checkFlask = async () => {
    setFlaskStatus("checking")
    try {
      const res = await fetch("http://localhost:5001/api/health", { signal: AbortSignal.timeout(3000) })
      setFlaskStatus(res.ok ? "online" : "offline")
    } catch { setFlaskStatus("offline") }
  }

  const checkToken = async () => {
    if (!tokenInput.trim()) return
    setTokenStatus("checking")
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: { Authorization: `token ${tokenInput.trim()}` },
      })
      setTokenStatus(res.ok ? "valid" : "invalid")
    } catch { setTokenStatus("invalid") }
  }

  const customTooltipStyle = { background: "#060910", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 0, fontFamily: "monospace", fontSize: 11 }

  return (
    <div className="relative min-h-screen bg-[#040810] font-mono">
      <ScanLine />

      {/* Moving scan beam */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent transition-none" style={{ top: `${scanY}%` }} />
      </div>

      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">

        {/* ── AVT Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[#f5a623]/20 pb-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[#f5a623] text-2xl font-black tracking-[0.3em]" style={{ textShadow: "0 0 30px rgba(245,166,35,0.6)" }}>
                <Glitch text="AVT" />
              </span>
              <span className="text-white/20 text-xs tracking-widest uppercase">Autoridade de Variância Temporal</span>
              <PulsingDot color="#00ff88" />
            </div>
            <p className="text-white/20 text-xs tracking-widest">
              PAINEL DE MONITORAMENTO TEMPORAL · {clock}
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 border border-[#f5a623]/30 hover:border-[#f5a623]/70 text-[#f5a623]/60 hover:text-[#f5a623] px-4 py-2 text-xs tracking-widest transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            SINCRONIZAR
          </button>
        </div>

        {/* ── AVT Alerts sidebar strip ──────────────────────────── */}
        {avtAlerts.length > 0 && (
          <div className="border border-[#f5a623]/15 rounded-sm p-4 bg-[#f5a623]/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#f5a623] text-xs tracking-widest">⚠ TRANSMISSÕES DA AVT</span>
              <span className="text-white/20 text-xs">ao vivo</span>
              <PulsingDot color="#f5a623" />
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {avtAlerts.slice(0, 4).map((a, i) => (
                <AVTAlert key={i} {...a} onDismiss={() => setAvtAlerts(prev => prev.filter((_, j) => j !== i))} />
              ))}
            </div>
          </div>
        )}

        {/* ── Stat Cards ────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AVTStatCard title="Instalações" value={loading ? "···" : (data?.total_installs ?? 0).toLocaleString()} sub="total registrado" icon="⬇" color="amber" />
          <AVTStatCard title="Commits Forjados" value={loading ? "···" : (data?.recent_commits.reduce((a, c) => a + c.commits_count, 0) ?? 0).toLocaleString()} sub="últimos registros" icon="⬡" color="green" />
          <AVTStatCard title="Feedbacks" value={loading ? "···" : (data?.feedbacks.length ?? 0)} sub={`média ${avgRating} ★`} icon="◉" color="blue" />
          <AVTStatCard title="Eventos Abertos" value={loading ? "···" : (data?.improvements.filter(i => i.status === "pending" || i.status === "in_progress").length ?? 0)} sub="pendente + em andamento" icon="◈" color="red" />
        </section>

        {/* ── Charts ────────────────────────────────────────────── */}
        <section className="grid lg:grid-cols-2 gap-5">

          {/* Timeline 30 days */}
          <div className="relative border border-[#00ff88]/15 bg-[#00ff88]/[0.02] rounded-sm p-5 overflow-hidden">
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#00ff88]/30" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00ff88]/30" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#00ff88]/30" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#00ff88]/30" />
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-3.5 h-3.5 text-[#00ff88]" />
              <h2 className="text-[#00ff88] text-xs tracking-widest uppercase">Linha do Tempo — Últimos 30 Dias</h2>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-5 h-5 border border-[#00ff88] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.last_30_days ?? []}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,255,136,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "rgba(0,255,136,0.3)", fontSize: 9, fontFamily: "monospace" }} tickFormatter={d => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} />
                  <YAxis tick={{ fill: "rgba(0,255,136,0.3)", fontSize: 9, fontFamily: "monospace" }} />
                  <Tooltip contentStyle={customTooltipStyle} labelStyle={{ color: "#00ff88" }} itemStyle={{ color: "#00ff88" }} />
                  <Line type="monotone" dataKey="count" stroke="#00ff88" strokeWidth={1.5} dot={{ fill: "#00ff88", r: 2 }} activeDot={{ r: 4, fill: "#00ff88" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* By Platform */}
          <div className="relative border border-[#4aabff]/15 bg-[#4aabff]/[0.02] rounded-sm p-5 overflow-hidden">
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#4aabff]/30" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#4aabff]/30" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#4aabff]/30" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#4aabff]/30" />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#4aabff] text-xs">◈</span>
              <h2 className="text-[#4aabff] text-xs tracking-widest uppercase">Variantes por Plataforma</h2>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-5 h-5 border border-[#4aabff] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.by_platform ?? []}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(74,171,255,0.05)" />
                  <XAxis dataKey="platform" tick={{ fill: "rgba(74,171,255,0.4)", fontSize: 9, fontFamily: "monospace" }} />
                  <YAxis tick={{ fill: "rgba(74,171,255,0.4)", fontSize: 9, fontFamily: "monospace" }} />
                  <Tooltip contentStyle={customTooltipStyle} labelStyle={{ color: "#4aabff" }} />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {(data?.by_platform ?? []).map(e => <Cell key={e.platform} fill={PLATFORM_COLORS[e.platform] ?? "#6b7280"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* ── Method Pie + Commits Log ──────────────────────────── */}
        <section className="grid lg:grid-cols-2 gap-5">

          {/* By Method */}
          <div className="relative border border-[#f5a623]/15 bg-[#f5a623]/[0.02] rounded-sm p-5 overflow-hidden">
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#f5a623]/30" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#f5a623]/30" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#f5a623]/30" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#f5a623]/30" />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#f5a623] text-xs">⬡</span>
              <h2 className="text-[#f5a623] text-xs tracking-widest uppercase">Método de Instalação</h2>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-5 h-5 border border-[#f5a623] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie data={data?.by_method ?? []} dataKey="count" cx="50%" cy="50%" outerRadius={65} innerRadius={35} strokeWidth={0}>
                      {(data?.by_method ?? []).map(e => <Cell key={e.method} fill={METHOD_COLORS[e.method] ?? "#6b7280"} />)}
                    </Pie>
                    <Tooltip contentStyle={customTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {(data?.by_method ?? []).map(e => (
                    <div key={e.method} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: METHOD_COLORS[e.method] ?? "#6b7280", boxShadow: `0 0 6px ${METHOD_COLORS[e.method] ?? "#6b7280"}` }} />
                        <span className="text-white/50 font-mono">{e.method}</span>
                      </div>
                      <span className="text-white/80 font-mono">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Commits Log */}
          <div className="relative border border-[#a78bfa]/15 bg-[#a78bfa]/[0.02] rounded-sm p-5 overflow-hidden">
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#a78bfa]/30" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#a78bfa]/30" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#a78bfa]/30" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#a78bfa]/30" />
            <div className="flex items-center gap-2 mb-4">
              <GitCommit className="w-3.5 h-3.5 text-[#a78bfa]" />
              <h2 className="text-[#a78bfa] text-xs tracking-widest uppercase">Registro de Eventos Temporais</h2>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center h-20"><div className="w-4 h-4 border border-[#a78bfa] border-t-transparent rounded-full animate-spin" /></div>
              ) : !data?.recent_commits.length ? (
                <p className="text-white/20 text-xs text-center py-8 tracking-widest">— SEM REGISTROS —</p>
              ) : (
                data.recent_commits.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2 border border-white/[0.04] hover:border-[#a78bfa]/20 hover:bg-[#a78bfa]/5 transition-all">
                    <span className="text-[#a78bfa]/40 text-xs">▸</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-mono truncate">{c.repo_name ?? "repositório"}</p>
                      <p className="text-white/20 text-[10px]">{formatDate(c.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white/40 text-[10px] font-mono">{c.commits_count}⬡</span>
                      <AVTBadge value={c.status} map={STATUS_LABELS} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── Feedbacks ─────────────────────────────────────────── */}
        <section className="relative border border-[#38bdf8]/15 bg-[#38bdf8]/[0.02] rounded-sm p-5 overflow-hidden">
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#38bdf8]/30" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#38bdf8]/30" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#38bdf8]/30" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#38bdf8]/30" />
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#38bdf8]" />
              <h2 className="text-[#38bdf8] text-xs tracking-widest uppercase">Relatórios dos Agentes</h2>
              <span className="border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-mono px-2 py-0.5 rounded-sm">{data?.feedbacks.length ?? 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-white/20" />
              <select value={feedbackFilter} onChange={e => setFeedbackFilter(e.target.value)} className="bg-[#040810] border border-white/10 px-2 py-1 text-white/50 text-xs font-mono focus:outline-none focus:border-[#38bdf8]/40">
                <option value="all">Todos</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="general">Geral</option>
                <option value="performance">Performance</option>
                <option value="docs">Docs</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center h-20"><div className="w-4 h-4 border border-[#38bdf8] border-t-transparent rounded-full animate-spin" /></div>
            ) : filteredFeedbacks.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-8 tracking-widest">— NENHUM RELATÓRIO —</p>
            ) : (
              filteredFeedbacks.map(f => (
                <div key={f.id} className="border border-white/[0.05] hover:border-[#38bdf8]/20 hover:bg-[#38bdf8]/[0.03] transition-all p-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/70 text-xs font-medium">{f.name ?? "Anônimo"}</span>
                      {f.rating && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${i < f.rating! ? "text-[#f5a623] fill-[#f5a623]" : "text-white/10"}`} />
                          ))}
                        </div>
                      )}
                      <AVTBadge value={f.category} map={{ bug: "bug", feature: "feature", general: "geral", performance: "perf", docs: "docs" }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <AVTBadge value={f.status} map={STATUS_LABELS} />
                      <span className="text-white/20 text-[10px]">{formatDate(f.created_at)}</span>
                      <button onClick={() => setExpandedFeedback(expandedFeedback === f.id ? null : f.id)} className="text-white/20 hover:text-white/60 transition-colors">
                        {expandedFeedback === f.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  {expandedFeedback === f.id && (
                    <p className="text-white/40 text-xs mt-2 leading-relaxed border-t border-white/5 pt-2 font-mono">{f.message}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Improvements / Nexus Events ──────────────────────── */}
        <section className="relative border border-[#ff4040]/15 bg-[#ff4040]/[0.02] rounded-sm p-5 overflow-hidden">
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#ff4040]/30" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#ff4040]/30" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#ff4040]/30" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#ff4040]/30" />
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-3.5 h-3.5 text-[#ff4040]" />
            <h2 className="text-[#ff4040] text-xs tracking-widest uppercase">Eventos Nexus — Melhorias da CLI</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5">
                  {["Título", "Prioridade", "Status", "Versão", "Autor"].map(h => (
                    <th key={h} className="text-left text-white/20 pb-2 pr-4 font-normal tracking-widest uppercase text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-white/20 text-xs tracking-widest">CARREGANDO DADOS TEMPORAIS...</td></tr>
                ) : !(data?.improvements ?? []).length ? (
                  <tr><td colSpan={5} className="py-8 text-center text-white/20 text-xs tracking-widest">— SEM EVENTOS REGISTRADOS —</td></tr>
                ) : (
                  (data?.improvements ?? []).map(item => (
                    <tr key={item.id} className="border-b border-white/[0.03] hover:bg-[#ff4040]/[0.03] transition-colors">
                      <td className="py-2.5 pr-4">
                        <p className="text-white/70">{item.title}</p>
                        {item.description && <p className="text-white/25 text-[10px] mt-0.5 max-w-xs truncate">{item.description}</p>}
                      </td>
                      <td className="py-2.5 pr-4"><AVTBadge value={item.priority} map={PRIORITY_LABELS} /></td>
                      <td className="py-2.5 pr-4"><AVTBadge value={item.status} map={STATUS_LABELS} /></td>
                      <td className="py-2.5 pr-4 text-white/30">{item.version_target ?? "—"}</td>
                      <td className="py-2.5 text-white/30">{item.author ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Export / Backups ──────────────────────────────────── */}
        <section className="relative border border-[#00ff88]/15 bg-[#00ff88]/[0.02] rounded-sm p-5 overflow-hidden">
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#00ff88]/30" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00ff88]/30" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#00ff88]/30" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#00ff88]/30" />
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-3.5 h-3.5 text-[#00ff88]" />
            <h2 className="text-[#00ff88] text-xs tracking-widest uppercase">Exportar Registros Temporais</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Instalações",  desc: "Todos os registros de install",   icon: "⬇", key: "installs"  },
              { label: "Relatórios",   desc: "Feedbacks dos agentes",            icon: "◉", key: "feedbacks" },
              { label: "Commits Log",  desc: "Histórico de eventos temporais",   icon: "⬡", key: "commits"   },
              { label: "Nexus Events", desc: "Melhorias e anomalias",            icon: "◈", key: "nexus"     },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => {
                  if (!data) return
                  if (item.key === "feedbacks") downloadCSV("feedbacks.csv", data.feedbacks as unknown as Record<string, unknown>[])
                  else if (item.key === "commits")   downloadCSV("commits_log.csv", data.recent_commits as unknown as Record<string, unknown>[])
                  else if (item.key === "nexus")     downloadJSON("cli_improvements.json", data.improvements)
                  else if (item.key === "installs")  downloadJSON("installs_summary.json", { by_platform: data.by_platform, by_method: data.by_method, last_30_days: data.last_30_days, total: data.total_installs })
                }}
                className="border border-[#00ff88]/15 hover:border-[#00ff88]/40 hover:bg-[#00ff88]/5 p-4 text-left transition-all group disabled:opacity-40"
                disabled={!data}
              >
                <div className="text-xl mb-2 text-[#00ff88]" style={{ textShadow: "0 0 10px rgba(0,255,136,0.4)" }}>{item.icon}</div>
                <p className="text-white/70 text-xs group-hover:text-white transition-colors">{item.label}</p>
                <p className="text-white/25 text-[10px] mt-0.5">{item.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-[#00ff88]/40 group-hover:text-[#00ff88] transition-colors text-[10px] tracking-widest">
                  <Download className="w-2.5 h-2.5" />
                  {item.key === "installs" || item.key === "nexus" ? "EXPORTAR JSON" : "EXPORTAR CSV"}
                </div>
              </button>
            ))}
          </div>
          <p className="text-white/15 text-[10px] mt-4 tracking-widest">
            CLIQUE PARA BAIXAR O ARQUIVO · DADOS EM TEMPO REAL DO BANCO TEMPORAL
          </p>
        </section>

        {/* ── Ferramentas Rápidas ──────────────────────────────── */}
        <section className="grid lg:grid-cols-3 gap-5">

          {/* CLI Commands */}
          <div className="relative border border-[#f5a623]/15 bg-[#f5a623]/[0.02] rounded-sm p-5 overflow-hidden lg:col-span-1">
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#f5a623]/30" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#f5a623]/30" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#f5a623]/30" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#f5a623]/30" />
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-3.5 h-3.5 text-[#f5a623]" />
              <h2 className="text-[#f5a623] text-xs tracking-widest uppercase">Comandos CLI Rápidos</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: "Iniciar servidor",       cmd: "commitforge servidor --porta 5001 --abrir" },
                { label: "Commit interativo",      cmd: "commitforge commit --interativo" },
                { label: "Preview de grupos",      cmd: "commitforge preview --year 2023" },
                { label: "Ver histórico",          cmd: "commitforge historico" },
                { label: "Atualizar CLI",          cmd: "commitforge atualizar" },
                { label: "Validar token",          cmd: "commitforge validar-token --token $GITHUB_TOKEN" },
              ].map(({ label, cmd }) => (
                <div key={label} className="flex items-center justify-between gap-2 p-2 border border-white/[0.04] hover:border-[#f5a623]/20 group transition-all">
                  <div className="min-w-0">
                    <p className="text-white/40 text-[10px] tracking-widest uppercase">{label}</p>
                    <p className="text-white/60 text-xs font-mono truncate group-hover:text-white/80 transition-colors">{cmd}</p>
                  </div>
                  <button onClick={() => copyCmd(cmd)} className="flex-shrink-0 text-white/20 hover:text-[#f5a623] transition-colors p-1">
                    {copiedCmd === cmd ? <Check className="w-3 h-3 text-[#00ff88]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Flask Health + Token Validator */}
          <div className="lg:col-span-2 grid gap-5">

            {/* Flask Server Status */}
            <div className="relative border border-[#4aabff]/15 bg-[#4aabff]/[0.02] rounded-sm p-5 overflow-hidden">
              <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#4aabff]/30" />
              <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#4aabff]/30" />
              <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#4aabff]/30" />
              <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#4aabff]/30" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#4aabff]" />
                  <h2 className="text-[#4aabff] text-xs tracking-widest uppercase">Status do Servidor Flask</h2>
                </div>
                <button
                  onClick={checkFlask}
                  disabled={flaskStatus === "checking"}
                  className="flex items-center gap-1.5 border border-[#4aabff]/30 hover:border-[#4aabff]/60 text-[#4aabff]/60 hover:text-[#4aabff] px-3 py-1 text-[10px] tracking-widest transition-all disabled:opacity-40"
                >
                  <Zap className={`w-3 h-3 ${flaskStatus === "checking" ? "animate-pulse" : ""}`} />
                  VERIFICAR
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { url: "http://localhost:5001",          label: "Interface",    route: "/" },
                  { url: "http://localhost:5001/timeline", label: "Linha do Tempo", route: "/timeline" },
                  { url: "http://localhost:5001/api/health", label: "Health API", route: "/api/health" },
                ].map(({ url, label, route }) => (
                  <a key={route} href={url} target="_blank" rel="noreferrer"
                    className="border border-[#4aabff]/10 hover:border-[#4aabff]/40 hover:bg-[#4aabff]/5 p-3 transition-all group"
                  >
                    <p className="text-[#4aabff]/60 group-hover:text-[#4aabff] text-[10px] tracking-widest flex items-center gap-1">
                      {label} <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-white/25 text-[10px] font-mono mt-0.5">{route}</p>
                  </a>
                ))}
              </div>
              {flaskStatus !== "idle" && (
                <div className={`mt-3 flex items-center gap-2 text-xs font-mono tracking-widest ${
                  flaskStatus === "online" ? "text-[#00ff88]" :
                  flaskStatus === "offline" ? "text-[#ff4040]" : "text-[#f5a623]"
                }`}>
                  <PulsingDot color={flaskStatus === "online" ? "#00ff88" : flaskStatus === "offline" ? "#ff4040" : "#f5a623"} />
                  {flaskStatus === "checking" ? "VERIFICANDO..." : flaskStatus === "online" ? "SERVIDOR ONLINE — PRONTO PARA OPERAR" : "SERVIDOR OFFLINE — EXECUTE: commitforge servidor"}
                </div>
              )}
            </div>

            {/* GitHub Token Validator */}
            <div className="relative border border-[#00ff88]/15 bg-[#00ff88]/[0.02] rounded-sm p-5 overflow-hidden">
              <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#00ff88]/30" />
              <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00ff88]/30" />
              <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#00ff88]/30" />
              <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#00ff88]/30" />
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-3.5 h-3.5 text-[#00ff88]" />
                <h2 className="text-[#00ff88] text-xs tracking-widest uppercase">Validar Token GitHub</h2>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && checkToken()}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 bg-black border border-[#00ff88]/20 focus:border-[#00ff88]/50 outline-none px-3 py-2 text-xs font-mono text-white/70 placeholder-white/15 transition-colors"
                />
                <button
                  onClick={checkToken}
                  disabled={!tokenInput.trim() || tokenStatus === "checking"}
                  className="border border-[#00ff88]/30 hover:border-[#00ff88]/70 text-[#00ff88]/60 hover:text-[#00ff88] px-4 py-2 text-[10px] tracking-widest transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  {tokenStatus === "checking" ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                  VALIDAR
                </button>
              </div>
              {tokenStatus !== "idle" && tokenStatus !== "checking" && (
                <div className={`mt-3 flex items-center gap-2 text-xs font-mono tracking-widest ${tokenStatus === "valid" ? "text-[#00ff88]" : "text-[#ff4040]"}`}>
                  <PulsingDot color={tokenStatus === "valid" ? "#00ff88" : "#ff4040"} />
                  {tokenStatus === "valid" ? "TOKEN VÁLIDO — AUTENTICAÇÃO CONFIRMADA PELA AVT" : "TOKEN INVÁLIDO — VERIFIQUE AS PERMISSÕES (repo, workflow)"}
                </div>
              )}
              <p className="text-white/10 text-[10px] mt-3 tracking-widest">O TOKEN NÃO É ARMAZENADO. VALIDAÇÃO DIRETO NA API DO GITHUB.</p>
            </div>

          </div>
        </section>

        {/* ── Guardião AVT ──────────────────────────────────────── */}
        <GuardianPanel />

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="border-t border-[#f5a623]/10 pt-4 flex items-center justify-between text-[10px] text-white/15 tracking-widest">
          <span>AVT · COMMITFORGE v1.0.0 · PAINEL CLASSIFICADO</span>
          <span>ÚLTIMA SINC: {lastRefresh.toLocaleTimeString("pt-BR")}</span>
        </div>

      </div>
    </div>
  )
}
