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

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="border-t border-[#f5a623]/10 pt-4 flex items-center justify-between text-[10px] text-white/15 tracking-widest">
          <span>AVT · COMMITFORGE v1.0.0 · PAINEL CLASSIFICADO</span>
          <span>ÚLTIMA SINC: {lastRefresh.toLocaleTimeString("pt-BR")}</span>
        </div>

      </div>
    </div>
  )
}
