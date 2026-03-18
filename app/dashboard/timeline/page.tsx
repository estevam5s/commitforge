"use client"

import { useEffect, useState, useCallback } from "react"
import { ArrowLeft, RefreshCw, Home } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

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
  timeline_type: "sacred" | "branched" | "nexus" | "pruned"
  nexus_level: number
  is_future: boolean
  is_deep_past: boolean
  status: "active" | "pruned" | "monitored" | "warning"
  source: string
}

interface GuardianData {
  events: TimelineEvent[]
  timeline_health: number
  threat_level: "green" | "yellow" | "red" | "critical"
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
  prunes: {
    id: string
    created_at: string
    event_id: string
    action: string
    reason: string | null
    guardian: string
  }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typeColor(t: string) {
  if (t === "nexus") return "#ff4040"
  if (t === "branched") return "#f5a623"
  if (t === "pruned") return "#555"
  return "#00ff88"
}

function typeLabel(t: string) {
  if (t === "nexus") return "NEXUS"
  if (t === "branched") return "VARIANTE"
  if (t === "pruned") return "PODADO"
  return "SAGRADO"
}

function threatColor(tl: string) {
  if (tl === "green") return "#00ff88"
  if (tl === "yellow") return "#f5a623"
  if (tl === "red") return "#ff8c00"
  return "#ff4040"
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ─── Main Timeline SVG ────────────────────────────────────────────────────────

function TimelineVisualization({
  events,
  currentYear,
}: {
  events: TimelineEvent[]
  currentYear: number
}) {
  const YEARS = Array.from({ length: 18 }, (_, i) => 2013 + i) // 2013–2030
  const W = 900
  const H = 260
  const PAD_X = 50
  const MAIN_Y = 130
  const yearX = (y: number) => PAD_X + ((y - 2013) / 17) * (W - PAD_X * 2)

  // Group events by year
  const byYear: Record<number, TimelineEvent[]> = {}
  events.forEach((e) => {
    if (e.commit_year >= 2013 && e.commit_year <= 2030) {
      if (!byYear[e.commit_year]) byYear[e.commit_year] = []
      byYear[e.commit_year].push(e)
    }
  })

  // Compute branch offsets per year
  const branchOffsets: Record<number, { col: string; lift: number; events: TimelineEvent[] }[]> = {}
  Object.entries(byYear).forEach(([yr, evts]) => {
    const year = parseInt(yr)
    const branches = evts.filter(
      (e) => e.timeline_type === "branched" || e.timeline_type === "nexus"
    )
    if (!branches.length) return
    branchOffsets[year] = branches.map((e, idx) => ({
      col: typeColor(e.timeline_type),
      lift: 35 + idx * 22 + e.nexus_level * 4,
      events: [e],
    }))
  })

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ maxHeight: 260, fontFamily: "monospace" }}
    >
      <defs>
        <filter id="glow-sacred">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00ff88" floodOpacity="0.7" />
        </filter>
        <filter id="glow-nexus">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ff4040" floodOpacity="0.9" />
        </filter>
        <filter id="glow-branch">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f5a623" floodOpacity="0.8" />
        </filter>
        <filter id="glow-amber">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f5a623" floodOpacity="0.6" />
        </filter>
        <linearGradient id="timeline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#00ff88" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff4040" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Future zone background */}
      <rect
        x={yearX(currentYear)}
        y={0}
        width={W - yearX(currentYear)}
        height={H}
        fill="rgba(255,64,64,0.04)"
      />

      {/* Main sacred timeline */}
      <line
        x1={PAD_X}
        y1={MAIN_Y}
        x2={W - PAD_X}
        y2={MAIN_Y}
        stroke="url(#timeline-grad)"
        strokeWidth="2"
        opacity="0.6"
      />
      <line
        x1={PAD_X}
        y1={MAIN_Y}
        x2={W - PAD_X}
        y2={MAIN_Y}
        stroke="#00ff88"
        strokeWidth="1.5"
        opacity="0.25"
        filter="url(#glow-sacred)"
      />

      {/* "TODAY" marker */}
      <line
        x1={yearX(currentYear)}
        y1={10}
        x2={yearX(currentYear)}
        y2={H - 10}
        stroke="#f5a623"
        strokeWidth="1"
        strokeDasharray="4,3"
        opacity="0.6"
        filter="url(#glow-amber)"
      />
      <rect
        x={yearX(currentYear) - 16}
        y={4}
        width={32}
        height={14}
        rx="2"
        fill="rgba(245,166,35,0.15)"
        stroke="rgba(245,166,35,0.4)"
        strokeWidth="0.5"
      />
      <text
        x={yearX(currentYear)}
        y={14}
        textAnchor="middle"
        fill="#f5a623"
        fontSize="7"
        fontWeight="bold"
        opacity="0.9"
      >
        HOJE
      </text>

      {/* Year labels */}
      {YEARS.filter((_, i) => i % 2 === 0).map((y) => (
        <g key={y}>
          <line
            x1={yearX(y)}
            y1={MAIN_Y - 5}
            x2={yearX(y)}
            y2={MAIN_Y + 5}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          <text
            x={yearX(y)}
            y={MAIN_Y + 18}
            textAnchor="middle"
            fill="rgba(255,255,255,0.25)"
            fontSize="8"
          >
            {y}
          </text>
        </g>
      ))}

      {/* Branch arcs */}
      {Object.entries(branchOffsets).map(([yr, branches]) => {
        const x = yearX(parseInt(yr))
        return branches.map((b, i) => {
          const ctrl = b.lift
          const endX = x + 40 + i * 10
          return (
            <path
              key={`arc-${yr}-${i}`}
              d={`M${x},${MAIN_Y} C${x},${MAIN_Y - ctrl} ${endX},${MAIN_Y - ctrl} ${endX},${MAIN_Y}`}
              fill="none"
              stroke={b.col}
              strokeWidth="1.5"
              opacity="0.55"
              filter={b.col === "#ff4040" ? "url(#glow-nexus)" : "url(#glow-branch)"}
            />
          )
        })
      })}

      {/* Event dots */}
      {Object.entries(byYear).map(([yr, evts]) => {
        const x = yearX(parseInt(yr))
        const topEvent =
          evts.find((e) => e.timeline_type === "nexus") ??
          evts.find((e) => e.timeline_type === "branched") ??
          evts[0]
        const col = typeColor(topEvent.timeline_type)
        const totalCommits = evts.reduce((s, e) => s + e.commits_count, 0)
        const r = Math.min(9, 3 + Math.log2(totalCommits + 1))
        const flt =
          topEvent.timeline_type === "nexus"
            ? "url(#glow-nexus)"
            : topEvent.timeline_type === "branched"
            ? "url(#glow-branch)"
            : "url(#glow-sacred)"

        return (
          <g key={yr}>
            <circle cx={x} cy={MAIN_Y} r={r + 4} fill={col} opacity="0.08" />
            <circle cx={x} cy={MAIN_Y} r={r} fill={col} opacity="0.9" filter={flt} />
            <text
              x={x}
              y={MAIN_Y - r - 5}
              textAnchor="middle"
              fill={col}
              fontSize="8"
              opacity="0.85"
            >
              {evts.length > 1 ? `×${evts.length}` : totalCommits}
            </text>
          </g>
        )
      })}

      {/* Legend */}
      {[
        { col: "#00ff88", label: "Sagrado" },
        { col: "#f5a623", label: "Variante" },
        { col: "#ff4040", label: "Nexus" },
        { col: "#555", label: "Podado" },
      ].map((leg, i) => (
        <g key={leg.label} transform={`translate(${PAD_X + i * 110}, ${H - 20})`}>
          <circle cx={5} cy={4} r={4} fill={leg.col} opacity="0.85" />
          <text x={14} y={8} fill="rgba(255,255,255,0.35)" fontSize="8">
            {leg.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ─── Event Row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: TimelineEvent }) {
  const col = typeColor(event.timeline_type)
  const label = typeLabel(event.timeline_type)

  return (
    <div
      className="grid grid-cols-[80px_1fr_90px_80px_80px] gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-all text-xs font-mono items-center"
    >
      <span className="font-bold tabular-nums" style={{ color: col }}>
        {event.commit_year}
      </span>
      <span className="text-white/60 truncate">
        {event.repo_name ?? <span className="text-white/20">—</span>}
      </span>
      <span
        className="border rounded px-2 py-0.5 text-[10px] tracking-wider text-center"
        style={{ borderColor: `${col}40`, color: col }}
      >
        {label}
      </span>
      <span className="text-white/30 text-right tabular-nums">
        {event.commits_count.toLocaleString()} commits
      </span>
      <span className="text-white/20 text-right">{formatDate(event.created_at)}</span>
    </div>
  )
}

// ─── Nexus Detail Card ────────────────────────────────────────────────────────

function NexusCard({ event }: { event: TimelineEvent }) {
  return (
    <div className="border border-[#ff4040]/20 bg-[#ff4040]/5 rounded-sm p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[#ff4040] text-[10px] tracking-widest font-mono font-bold">
          ⚡ NEXUS — {event.commit_year}
        </span>
        <span className="text-[#ff4040]/50 text-[10px] font-mono">
          nível {event.nexus_level}/10
        </span>
      </div>
      <p className="text-white/60 text-xs font-mono">{event.repo_name ?? "Repositório desconhecido"}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {event.branch_name && (
          <span className="text-white/30 text-[10px] font-mono border border-white/10 px-2 py-0.5 rounded">
            branch: {event.branch_name}
          </span>
        )}
        <span className="text-white/30 text-[10px] font-mono border border-white/10 px-2 py-0.5 rounded">
          {event.commits_count} commits
        </span>
        <span className="text-white/30 text-[10px] font-mono border border-white/10 px-2 py-0.5 rounded">
          src: {event.source}
        </span>
      </div>
      {/* Nexus level bar */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${(event.nexus_level / 10) * 100}%`,
            background: "#ff4040",
            boxShadow: "0 0 8px #ff4040",
          }}
        />
      </div>
    </div>
  )
}

// ─── Branch Card ──────────────────────────────────────────────────────────────

function BranchCard({ events }: { events: TimelineEvent[] }) {
  const year = events[0].commit_year
  return (
    <div className="border border-[#f5a623]/20 bg-[#f5a623]/5 rounded-sm p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[#f5a623] text-[10px] tracking-widest font-mono font-bold">
          ⑂ VARIANTE — {year}
        </span>
        <span className="text-[#f5a623]/50 text-[10px] font-mono">
          {events.length} ramificação{events.length !== 1 ? "ões" : ""}
        </span>
      </div>
      {events.map((e) => (
        <div key={e.id} className="text-xs font-mono text-white/50 flex items-center gap-2">
          <span className="text-[#f5a623]/60">⑂</span>
          <span>{e.repo_name ?? "—"}</span>
          <span className="text-white/20">•</span>
          <span>{e.commits_count} commits</span>
          {e.branch_name && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-white/30">{e.branch_name}</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const [guardianData, setGuardianData] = useState<GuardianData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/guardian")
      const data = await res.json()
      if (!data.error) setGuardianData(data)
      setLastUpdated(new Date())
    } catch {
      /* keep old */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 30000)
    return () => clearInterval(t)
  }, [fetchData])

  const events = guardianData?.events ?? []
  const currentYear = guardianData?.current_year ?? new Date().getFullYear()
  const tc = guardianData?.threat_level ?? "green"
  const tCol = threatColor(tc)

  const nexusEvents = events.filter((e) => e.timeline_type === "nexus")
  const branchEventsByYear: Record<number, TimelineEvent[]> = {}
  events
    .filter((e) => e.timeline_type === "branched")
    .forEach((e) => {
      if (!branchEventsByYear[e.commit_year]) branchEventsByYear[e.commit_year] = []
      branchEventsByYear[e.commit_year].push(e)
    })

  const filteredEvents =
    typeFilter === "all" ? events : events.filter((e) => e.timeline_type === typeFilter)

  return (
    <div
      className="min-h-screen font-mono text-white"
      style={{
        background: "#040810",
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.01) 2px, rgba(0,255,136,0.01) 4px)",
      }}
    >
      {/* Topbar */}
      <div
        className="sticky top-0 z-20 border-b border-white/5 px-6 py-3 flex items-center justify-between"
        style={{ background: "rgba(4,8,16,0.97)", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 text-white/30 hover:text-[#f5a623] transition-colors text-[10px] tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            AVT HQ
          </a>
          <span className="text-white/10">/</span>
          <span className="text-white/60 text-xs tracking-wide">Linha do Tempo</span>
          {loading && (
            <div className="w-3 h-3 border border-[#f5a623]/60 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-white/20 text-[10px] tracking-widest hidden md:block">
              {lastUpdated.toLocaleTimeString("pt-BR")} TVA
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 border border-white/10 hover:border-[#f5a623]/40 text-white/30 hover:text-[#f5a623] px-3 py-1.5 text-[10px] tracking-widest transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            SYNC
          </button>
          <a
            href="/"
            className="flex items-center gap-1.5 text-white/20 hover:text-white/50 transition-colors text-[10px] tracking-widest"
          >
            <Home className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⟁</span>
            <h1
              className="text-2xl font-black tracking-[0.2em]"
              style={{ color: "#f5a623", textShadow: "0 0 30px rgba(245,166,35,0.4)" }}
            >
              LINHA DO TEMPO
            </h1>
            <div
              className="flex items-center gap-1.5 border px-3 py-1 rounded-full text-[10px] tracking-widest ml-2"
              style={{ borderColor: `${tCol}40`, color: tCol, background: `${tCol}10` }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: tCol }}
              />
              {tc.toUpperCase()}
            </div>
          </div>
          <p className="text-white/25 text-xs tracking-widest">
            Autoridade de Variância Temporal · Mapeamento de ramificações e eventos nexus
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Eventos", value: guardianData?.total_events ?? 0, col: "#f5a623" },
            {
              label: "Saúde",
              value: `${guardianData?.timeline_health ?? 100}%`,
              col: tCol,
            },
            { label: "Nexus", value: guardianData?.nexus_count ?? 0, col: "#ff4040" },
            { label: "Variantes", value: guardianData?.branch_count ?? 0, col: "#f5a623" },
            { label: "Podados", value: guardianData?.pruned_count ?? 0, col: "#555" },
          ].map((s) => (
            <div
              key={s.label}
              className="border border-white/5 rounded-sm p-4 text-center"
              style={{ background: "rgba(255,255,255,0.01)" }}
            >
              <p
                className="text-2xl font-bold font-mono tabular-nums"
                style={{ color: s.col, textShadow: `0 0 15px ${s.col}` }}
              >
                {loading ? "···" : s.value}
              </p>
              <p className="text-white/25 text-[10px] tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main timeline visualization */}
        <div
          className="border border-white/5 rounded-sm p-6 overflow-x-auto"
          style={{ background: "rgba(0,255,136,0.01)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: tCol, boxShadow: `0 0 8px ${tCol}` }}
            />
            <p className="text-white/30 text-[10px] tracking-widest">
              ⟁ VISUALIZAÇÃO DA LINHA SAGRADA · 2013–2030
            </p>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border border-[#f5a623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <TimelineVisualization events={events} currentYear={currentYear} />
          )}
        </div>

        {/* Nexus events */}
        {nexusEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ background: "#ff4040" }}
              />
              <h2 className="text-[#ff4040] text-xs tracking-widest font-bold">
                ⚡ EVENTOS NEXUS — ANOMALIAS TEMPORAIS DETECTADAS
              </h2>
              <span className="border border-[#ff4040]/30 text-[#ff4040] text-[9px] px-2 py-0.5">
                {nexusEvents.length}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {nexusEvents.map((e) => (
                <NexusCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        )}

        {/* Branch variants */}
        {Object.keys(branchEventsByYear).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[#f5a623] text-xs tracking-widest font-bold">
                ⑂ LINHAS ALTERNATIVAS — RAMIFICAÇÕES DETECTADAS
              </h2>
              <span className="border border-[#f5a623]/30 text-[#f5a623] text-[9px] px-2 py-0.5">
                {Object.keys(branchEventsByYear).length} anos
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(branchEventsByYear)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([yr, evts]) => (
                  <BranchCard key={yr} events={evts} />
                ))}
            </div>
          </div>
        )}

        {/* All events table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-white/50 text-xs tracking-widest font-bold">
              ◈ TODOS OS EVENTOS
            </h2>
            <div className="flex items-center gap-2">
              {["all", "sacred", "branched", "nexus", "pruned"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`text-[10px] tracking-widest px-3 py-1 border transition-all font-mono ${
                    typeFilter === t
                      ? "border-[#f5a623]/50 text-[#f5a623] bg-[#f5a623]/10"
                      : "border-white/10 text-white/30 hover:border-white/20"
                  }`}
                >
                  {t === "all"
                    ? "TODOS"
                    : t === "sacred"
                    ? "SAGRADO"
                    : t === "branched"
                    ? "VARIANTE"
                    : t === "nexus"
                    ? "NEXUS"
                    : "PODADO"}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-white/5 rounded-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[80px_1fr_90px_80px_80px] gap-3 px-4 py-2 border-b border-white/5 text-[10px] text-white/25 tracking-widest">
              <span>ANO</span>
              <span>REPOSITÓRIO</span>
              <span>TIPO</span>
              <span className="text-right">COMMITS</span>
              <span className="text-right">DATA</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <div className="w-5 h-5 border border-[#f5a623] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !filteredEvents.length ? (
              <p className="text-white/20 text-xs text-center py-12 tracking-widest">
                — NENHUM EVENTO —
              </p>
            ) : (
              filteredEvents
                .sort((a, b) => b.commit_year - a.commit_year)
                .map((e) => <EventRow key={e.id} event={e} />)
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-4 flex items-center justify-between text-[10px] text-white/15 tracking-widest">
          <span>AVT · LINHA DO TEMPO · COMMITFORGE v1.0.0</span>
          <span>ÚLTIMA SINC: {lastUpdated?.toLocaleTimeString("pt-BR") ?? "—"}</span>
        </div>
      </div>
    </div>
  )
}
