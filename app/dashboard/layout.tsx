"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)

// Rotas exclusivas do admin (analytics global / Guardião AVT / painel admin).
// Usuários normais NÃO acessam estas — são redirecionados para os seus commits.
const ADMIN_ONLY = ["/dashboard", "/dashboard/timeline", "/dashboard/admin"]

function isAdminOnlyPath(pathname: string) {
  return ADMIN_ONLY.some((p) => pathname === p || pathname.startsWith(p + "/"))
    && !pathname.startsWith("/dashboard/commits")
    && !pathname.startsWith("/dashboard/cli")
    && !pathname.startsWith("/dashboard/billing")
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session
      if (!session) {
        router.replace("/login?next=/dashboard/commits")
        return
      }
      const email = (session.user?.email || "").toLowerCase()
      const isAdmin = ADMIN_EMAILS.includes(email)
      // bloqueia rotas de admin para usuários normais
      if (!isAdmin && isAdminOnlyPath(pathname)) {
        router.replace("/dashboard/commits")
        return
      }
      setReady(true)
    })
  }, [router, pathname])

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#040810] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
