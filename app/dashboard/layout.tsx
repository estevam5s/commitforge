"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  LayoutDashboard,
  Download,
  MessageSquare,
  GitCommit,
  Lightbulb,
  Database,
  LogOut,
  GitBranch,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { id: "overview",      label: "Visão Geral",     icon: LayoutDashboard, href: "/dashboard" },
  { id: "installs",      label: "Instalações",      icon: Download,        href: "/dashboard#installs" },
  { id: "commits",       label: "Commits Log",      icon: GitCommit,       href: "/dashboard#commits" },
  { id: "feedbacks",     label: "Feedbacks",        icon: MessageSquare,   href: "/dashboard#feedbacks" },
  { id: "improvements",  label: "Melhorias CLI",    icon: Lightbulb,       href: "/dashboard#improvements" },
  { id: "backups",       label: "Backups",          icon: Database,        href: "/dashboard#backups" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login")
      } else {
        setUser(data.session.user)
      }
    })
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm font-mono">CommitForge</div>
              <div className="text-white/30 text-xs">Dashboard</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === "/dashboard" && item.id === "overview"
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-black text-xs font-bold">
              {(user.email?.[0] ?? "A").toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{user.email}</div>
              <div className="text-white/30 text-xs">Admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 flex items-center px-4 gap-3 sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/50 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="text-white/20 text-xs font-mono">v1.0.0</div>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs">Online</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
