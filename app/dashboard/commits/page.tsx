"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSaas, authFetch } from "@/hooks/use-saas"
import { DashNav } from "@/components/saas/dash-nav"
import { GitCommit, Terminal, ArrowUpRight, GitBranch, Calendar, AlertTriangle } from "lucide-react"

export default function CommitsPage() {
  const { sub, isAdmin, hasAccess } = useSaas()
  const [jobs, setJobs] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    authFetch("/api/cli/jobs").then((r) => r.json()).then((d) => { setJobs(d.jobs || []); setLoaded(true) }).catch(() => setLoaded(true))
  }, [])

  const limits = sub?.limits || {}
  const reposLimit = limits.repos ?? 1
  const commitsLimit = limits.commits_month ?? 30

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const monthJobs = jobs.filter((j) => new Date(j.created_at) >= monthStart)
  const commitsUsed = monthJobs.reduce((s, j) => s + (j.commits_count || 0), 0)
  const reposUsed = new Set(jobs.map((j) => j.repo_url)).size

  const fmtLimit = (v: number) => (v === -1 ? "∞" : v)

  return (
    <div className="min-h-screen bg-[#040810] text-zinc-200">
      <DashNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Meus commits</h1>
            <p className="text-sm text-zinc-500 mt-1">Histórico e auditoria dos seus jobs de commits retroativos.</p>
          </div>
          <Link href="/dashboard/cli" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium text-sm flex items-center gap-2">
            <Terminal className="size-4" /> Usar a CLI
          </Link>
        </div>

        {!hasAccess && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-medium">Seu período grátis terminou</p>
                <p className="text-sm text-zinc-400 mt-1">As funções estão reduzidas ao nível Inicial. Assine um plano para liberar tudo.</p>
              </div>
            </div>
            <Link href="/dashboard/billing" className="shrink-0 px-4 py-2 rounded-lg bg-amber-500 text-black font-medium text-sm hover:bg-amber-400">Ver planos</Link>
          </div>
        )}

        {/* Uso do plano */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Commits este mês", value: `${commitsUsed}${commitsLimit === -1 ? "" : ` / ${fmtLimit(commitsLimit)}`}`, icon: GitCommit },
            { label: "Repositórios usados", value: `${reposUsed}${reposLimit === -1 ? "" : ` / ${fmtLimit(reposLimit)}`}`, icon: GitBranch },
            { label: "Plano", value: isAdmin ? "Admin" : sub?.plan?.name || "Inicial", icon: Calendar, hint: !isAdmin && sub?.trial_active ? "Teste Pro ativo" : undefined },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wide"><c.icon className="size-4" /> {c.label}</div>
              <p className="text-2xl font-semibold text-white mt-2">{c.value}</p>
              {c.hint && <p className="text-xs text-amber-400 mt-1">{c.hint}</p>}
            </div>
          ))}
        </div>

        {/* Jobs table */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white">Histórico de jobs</h2>
            <span className="text-xs text-zinc-500">{jobs.length} registro(s)</span>
          </div>
          {!loaded ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Carregando…</div>
          ) : jobs.length === 0 ? (
            <div className="p-10 text-center">
              <GitCommit className="size-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">Nenhum job ainda.</p>
              <p className="text-sm text-zinc-600 mt-1">Conecte a CLI e rode seu primeiro commit retroativo.</p>
              <Link href="/dashboard/cli" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-amber-500 text-black font-medium text-sm hover:bg-amber-400">
                <Terminal className="size-4" /> Configurar a CLI
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-zinc-600">
                    <th className="text-left font-bold px-5 py-3">Repositório</th>
                    <th className="text-left font-bold px-5 py-3">Período</th>
                    <th className="text-left font-bold px-5 py-3">Modo</th>
                    <th className="text-left font-bold px-5 py-3">Commits</th>
                    <th className="text-left font-bold px-5 py-3">Status</th>
                    <th className="text-left font-bold px-5 py-3">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{j.repo_name || j.repo_url?.split("/").pop()}</span>
                          {j.repo_url && <a href={j.repo_url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-amber-400"><ArrowUpRight className="size-3.5" /></a>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-zinc-400">{j.start_date ? `${j.start_date} → ${j.end_date || "?"}` : "—"}</td>
                      <td className="px-5 py-3 text-zinc-400">{j.mode || "—"}</td>
                      <td className="px-5 py-3 text-white">{j.commits_count}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${j.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : j.status === "failed" ? "bg-red-500/15 text-red-400" : "bg-zinc-500/15 text-zinc-400"}`}>{j.status}</span>
                      </td>
                      <td className="px-5 py-3 text-zinc-500">{new Date(j.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
