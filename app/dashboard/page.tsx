"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Download,
  Users,
  GitCommit,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Lightbulb,
  Database,
  Calendar,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface StatsData {
  total_installs: number
  by_platform: { platform: string; count: number }[]
  by_method: { method: string; count: number }[]
  last_30_days: { date: string; count: number }[]
  feedbacks: {
    id: string
    created_at: string
    name: string | null
    rating: number | null
    message: string
    category: string
    status: string
  }[]
  recent_commits: {
    id: string
    created_at: string
    repo_name: string | null
    commits_count: number
    status: string
    duration_ms: number | null
    mode: string | null
  }[]
  improvements: {
    id: string
    title: string
    description: string | null
    priority: string
    status: string
    author: string | null
    version_target: string | null
    tags: string[]
  }[]
}

const PLATFORM_COLORS: Record<string, string> = {
  linux: "#22c55e",
  macos: "#a78bfa",
  windows: "#60a5fa",
  docker: "#38bdf8",
  arch: "#1d4ed8",
  debian: "#dc2626",
  ubuntu: "#f97316",
  fedora: "#06b6d4",
  other: "#6b7280",
}

const METHOD_COLORS: Record<string, string> = {
  curl: "#fbbf24",
  docker: "#38bdf8",
  brew: "#a78bfa",
  apt: "#f87171",
  pacman: "#60a5fa",
  winget: "#34d399",
  powershell: "#22d3ee",
  pip: "#fb923c",
  git: "#a3e635",
  other: "#6b7280",
  unknown: "#6b7280",
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color = "amber",
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color?: string
}) {
  const colors: Record<string, string> = {
    amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400",
    green: "from-green-500/10 to-green-600/5 border-green-500/20 text-green-400",
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400",
  }
  const cls = colors[color] ?? colors.amber
  return (
    <div className={`bg-gradient-to-br ${cls} border rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-white/50 text-sm">{title}</p>
        <Icon className={`w-5 h-5 ${cls.split(" ").pop()}`} />
      </div>
      <p className="text-3xl font-bold text-white mb-1 font-mono">{value}</p>
      {sub && <p className="text-white/30 text-xs">{sub}</p>}
    </div>
  )
}

function Badge({ value, map }: { value: string; map: Record<string, string> }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    done: "bg-green-500/10 text-green-400 border-green-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    reviewed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    wont_fix: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
  }
  const cls = colors[value] ?? "bg-white/5 text-white/50 border-white/10"
  const label = map[value] ?? value
  return (
    <span className={`inline-flex items-center border rounded-full px-2 py-0.5 text-xs font-mono ${cls}`}>
      {label}
    </span>
  )
}

const STATUS_LABELS: Record<string, string> = {
  pending: "pendente",
  in_progress: "em andamento",
  running: "executando",
  completed: "concluído",
  done: "feito",
  failed: "falhou",
  cancelled: "cancelado",
  reviewed: "revisado",
  rejected: "rejeitado",
  wont_fix: "não vai corrigir",
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "baixa",
  medium: "média",
  high: "alta",
  critical: "crítica",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDuration(ms: number | null) {
  if (!ms) return "—"
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export default function DashboardPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [feedbackFilter, setFeedbackFilter] = useState("all")
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stats")
      const json = await res.json()
      setData(json)
      setLastRefresh(new Date())
    } catch {
      // keep old data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60_000) // auto-refresh every minute
    return () => clearInterval(interval)
  }, [fetchStats])

  const filteredFeedbacks = data?.feedbacks.filter(
    (f) => feedbackFilter === "all" || f.category === feedbackFilter
  ) ?? []

  const avgRating = data?.feedbacks.length
    ? (
        data.feedbacks.reduce((acc, f) => acc + (f.rating ?? 0), 0) /
        data.feedbacks.filter((f) => f.rating).length
      ).toFixed(1)
    : "—"

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono">Dashboard</h1>
          <p className="text-white/30 text-sm mt-0.5">
            Atualizado: {lastRefresh.toLocaleTimeString("pt-BR")}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white/60 hover:text-white transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Stat cards */}
      <section id="overview" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Instalações"
          value={loading ? "..." : (data?.total_installs ?? 0).toLocaleString()}
          sub="todos os métodos"
          icon={Download}
          color="amber"
        />
        <StatCard
          title="Commits Realizados"
          value={loading ? "..." : data?.recent_commits.reduce((a, c) => a + c.commits_count, 0).toLocaleString() ?? 0}
          sub="últimos registros"
          icon={GitCommit}
          color="green"
        />
        <StatCard
          title="Feedbacks"
          value={loading ? "..." : (data?.feedbacks.length ?? 0)}
          sub={`média ${avgRating} ★`}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="Melhorias Abertas"
          value={loading ? "..." : (data?.improvements.filter((i) => i.status === "pending" || i.status === "in_progress").length ?? 0)}
          sub="pendentes + em andamento"
          icon={Lightbulb}
          color="purple"
        />
      </section>

      {/* Charts row */}
      <section id="installs" className="grid lg:grid-cols-2 gap-6">
        {/* Last 30 days */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Instalações — Últimos 30 Dias</h2>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data?.last_30_days ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                  }
                />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                  itemStyle={{ color: "#fbbf24" }}
                />
                <Line type="monotone" dataKey="count" stroke="#fbbf24" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By Platform */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h2 className="text-white font-semibold text-sm">Por Plataforma</h2>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.by_platform ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="platform" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(data?.by_platform ?? []).map((entry) => (
                    <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] ?? "#6b7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* By Method Pie + table */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <h2 className="text-white font-semibold text-sm">Por Método de Instalação</h2>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={data?.by_method ?? []} dataKey="count" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {(data?.by_method ?? []).map((entry) => (
                      <Cell key={entry.method} fill={METHOD_COLORS[entry.method] ?? "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {(data?.by_method ?? []).map((entry) => (
                  <div key={entry.method} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: METHOD_COLORS[entry.method] ?? "#6b7280" }}
                      />
                      <span className="text-white/60 font-mono">{entry.method}</span>
                    </div>
                    <span className="text-white font-mono">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Commits Log */}
        <div id="commits" className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <GitCommit className="w-4 h-4 text-purple-400" />
            <h2 className="text-white font-semibold text-sm">Commits Log Recentes</h2>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data?.recent_commits.length === 0 ? (
              <p className="text-white/20 text-sm text-center py-8">Nenhum registro ainda</p>
            ) : (
              data?.recent_commits.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs font-mono truncate">{c.repo_name ?? "repo"}</p>
                    <p className="text-white/30 text-xs">{formatDate(c.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-white/50 text-xs font-mono">{c.commits_count} commits</span>
                    <Badge value={c.status} map={STATUS_LABELS} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Feedbacks */}
      <section id="feedbacks" className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h2 className="text-white font-semibold text-sm">Feedbacks dos Usuários</h2>
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono px-2 py-0.5 rounded-full">
              {data?.feedbacks.length ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-white/30" />
            <select
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/60 text-xs focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="general">Geral</option>
              <option value="performance">Performance</option>
              <option value="docs">Docs</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">Nenhum feedback ainda</p>
          ) : (
            filteredFeedbacks.map((f) => (
              <div key={f.id} className="border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white/70 text-sm font-medium">{f.name ?? "Anônimo"}</span>
                    {f.rating && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < f.rating! ? "text-amber-400 fill-amber-400" : "text-white/15"}`}
                          />
                        ))}
                      </div>
                    )}
                    <Badge value={f.category} map={{ bug: "bug", feature: "feature", general: "geral", performance: "performance", docs: "docs" }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge value={f.status} map={STATUS_LABELS} />
                    <span className="text-white/20 text-xs">{formatDate(f.created_at)}</span>
                    <button
                      onClick={() => setExpandedFeedback(expandedFeedback === f.id ? null : f.id)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      {expandedFeedback === f.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {expandedFeedback === f.id && (
                  <p className="text-white/50 text-sm mt-3 leading-relaxed border-t border-white/5 pt-3">{f.message}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* CLI Improvements */}
      <section id="improvements" className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <h2 className="text-white font-semibold text-sm">Melhorias da CLI</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-white/30 pb-3 font-medium text-xs pr-4">Título</th>
                <th className="text-left text-white/30 pb-3 font-medium text-xs pr-4">Prioridade</th>
                <th className="text-left text-white/30 pb-3 font-medium text-xs pr-4">Status</th>
                <th className="text-left text-white/30 pb-3 font-medium text-xs pr-4">Versão</th>
                <th className="text-left text-white/30 pb-3 font-medium text-xs">Autor</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/20 text-xs">
                    Carregando...
                  </td>
                </tr>
              ) : (data?.improvements ?? []).map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4">
                    <div>
                      <p className="text-white/80 font-medium">{item.title}</p>
                      {item.description && (
                        <p className="text-white/30 text-xs mt-0.5 max-w-xs truncate">{item.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge value={item.priority} map={PRIORITY_LABELS} />
                  </td>
                  <td className="py-3 pr-4">
                    <Badge value={item.status} map={STATUS_LABELS} />
                  </td>
                  <td className="py-3 pr-4 text-white/40 font-mono text-xs">{item.version_target ?? "—"}</td>
                  <td className="py-3 text-white/40 text-xs">{item.author ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Backups */}
      <section id="backups" className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-green-400" />
            <h2 className="text-white font-semibold text-sm">Exportar Dados</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Instalações", desc: "Todos os registros de install", table: "installs" },
            { label: "Feedbacks", desc: "Todos os feedbacks", table: "feedbacks" },
            { label: "Commits Log", desc: "Histórico de commits", table: "commits_log" },
            { label: "Melhorias CLI", desc: "Lista de improvements", table: "cli_improvements" },
          ].map((item) => (
            <button
              key={item.table}
              onClick={() => alert(`Exportação de ${item.label} via Supabase Dashboard → Table Editor → Export`)}
              className="bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl p-4 text-left transition-all group"
            >
              <p className="text-white/80 font-medium text-sm group-hover:text-white transition-colors">{item.label}</p>
              <p className="text-white/30 text-xs mt-1">{item.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-green-400/60 group-hover:text-green-400 transition-colors text-xs">
                <Download className="w-3 h-3" />
                Exportar CSV
              </div>
            </button>
          ))}
        </div>
        <p className="text-white/20 text-xs mt-4">
          Para backups completos, use o Supabase Dashboard → Storage → Backups ou a CLI do Supabase.
        </p>
      </section>
    </div>
  )
}
