"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSaas, authFetch } from "@/hooks/use-saas"
import { DashNav } from "@/components/saas/dash-nav"
import { Users, CreditCard, GitCommit, Activity, Shield } from "lucide-react"

export default function AdminPage() {
  const { isAdmin, loading } = useSaas()
  const [overview, setOverview] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (!isAdmin) return
    authFetch("/api/admin?view=overview").then((r) => r.json()).then(setOverview).catch(() => {})
    authFetch("/api/admin?view=users").then((r) => r.json()).then((d) => setUsers(d.users || [])).catch(() => {})
  }, [isAdmin])

  if (loading) return <div className="min-h-screen bg-[#040810]" />
  if (!isAdmin) return (
    <div className="min-h-screen bg-[#040810] text-zinc-200">
      <DashNav />
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <Shield className="size-10 text-zinc-700 mx-auto mb-3" />
        <p className="text-white font-medium">Acesso restrito</p>
        <p className="text-sm text-zinc-500 mt-1">Esta área é exclusiva do administrador.</p>
        <Link href="/dashboard" className="inline-block mt-4 text-amber-500 hover:underline text-sm">Voltar ao dashboard</Link>
      </div>
    </div>
  )

  const t = overview?.totals || {}
  const cards = [
    { label: "Usuários", value: t.users ?? "—", icon: Users },
    { label: "Assinantes pagos", value: t.paid ?? "—", icon: CreditCard },
    { label: "Jobs de commit", value: t.jobs ?? "—", icon: GitCommit },
    { label: "Commits totais", value: t.commits ?? "—", icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-[#040810] text-zinc-200">
      <DashNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2"><Shield className="size-6 text-amber-500" /> Painel admin</h1>
          <p className="text-sm text-zinc-500 mt-1">Visão geral do SaaS: usuários, assinaturas e uso.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wide"><c.icon className="size-4" /> {c.label}</div>
              <p className="text-2xl font-semibold text-white mt-2">{c.value}</p>
            </div>
          ))}
        </div>

        {overview?.byPlan && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="font-semibold text-white mb-3">Assinantes por plano</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(overview.byPlan).map(([slug, n]) => (
                <span key={slug} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-zinc-300 capitalize">{slug}: <strong className="text-amber-400">{n as number}</strong></span>
              ))}
              {Object.keys(overview.byPlan).length === 0 && <span className="text-sm text-zinc-500">Nenhum assinante pago ainda.</span>}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white">Usuários</h2>
            <span className="text-xs text-zinc-500">{users.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-600">
                  <th className="text-left font-bold px-5 py-3">Nome</th>
                  <th className="text-left font-bold px-5 py-3">Plano</th>
                  <th className="text-left font-bold px-5 py-3">Status</th>
                  <th className="text-left font-bold px-5 py-3">Trial até</th>
                  <th className="text-left font-bold px-5 py-3">Criado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-white">{u.full_name || "—"}</td>
                    <td className="px-5 py-3 capitalize text-zinc-300">{u.subscription?.plan_slug || "inicial"}</td>
                    <td className="px-5 py-3 text-zinc-400">{u.subscription?.status || "—"}</td>
                    <td className="px-5 py-3 text-zinc-500">{u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="px-5 py-3 text-zinc-500">{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}</td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-zinc-500">Sem usuários ainda.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
