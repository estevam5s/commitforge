"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useSaas } from "@/hooks/use-saas"
import { GitBranch, Activity, GitCommit, CreditCard, Terminal, Shield, LogOut, Home } from "lucide-react"

// itens visíveis para todos os usuários autenticados
const ITEMS = [
  { href: "/dashboard/commits", label: "Meus commits", icon: GitCommit },
  { href: "/dashboard/cli", label: "CLI", icon: Terminal },
  { href: "/dashboard/billing", label: "Assinatura", icon: CreditCard },
]

export function DashNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin, sub } = useSaas()
  const planName = isAdmin ? "Admin" : sub?.plan?.name || "Inicial"
  const showTrial = !isAdmin && sub?.trial_active

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#040810]/85 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 h-14">
        <Link href="/dashboard" className="flex items-center gap-2 text-white font-semibold shrink-0">
          <GitBranch className="size-5 text-amber-500" />
          <span className="hidden sm:inline">CommitForge</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto flex-1">
          {ITEMS.map((it) => {
            const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/")
            return (
              <Link key={it.href} href={it.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${active ? "bg-amber-500/10 text-amber-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
                <it.icon className="size-4" /> {it.label}
              </Link>
            )
          })}
          {isAdmin && (
            <>
              <Link href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${pathname === "/dashboard" ? "bg-amber-500/10 text-amber-400" : "text-amber-500/80 hover:text-amber-300 hover:bg-white/5"}`}>
                <Activity className="size-4" /> AVT HQ
              </Link>
              <Link href="/dashboard/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${pathname.startsWith("/dashboard/admin") ? "bg-amber-500/10 text-amber-400" : "text-amber-500/80 hover:text-amber-300 hover:bg-white/5"}`}>
                <Shield className="size-4" /> Admin
              </Link>
            </>
          )}
        </nav>
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">{planName}{showTrial ? " · Teste Pro" : ""}</span>
          <span className="text-xs text-zinc-500 max-w-[160px] truncate">{user?.email}</span>
          <Link href="/" className="p-1.5 text-zinc-500 hover:text-white" title="Site"><Home className="size-4" /></Link>
          <button onClick={async () => { await supabase.auth.signOut(); router.replace("/") }} className="p-1.5 text-zinc-500 hover:text-red-400" title="Sair"><LogOut className="size-4" /></button>
        </div>
      </div>
    </header>
  )
}
