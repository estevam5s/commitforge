"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

const ADMINS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)

export type SubData = {
  subscription: any
  plan: any
  plans: any[]
  is_admin: boolean
  trial_active: boolean
  trial_ends_at: string | null
  has_access: boolean
  limits: Record<string, any>
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return fetch(path, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  })
}

export function useSaas() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sub, setSub] = useState<SubData | null>(null)

  const loadSub = useCallback(async () => {
    try {
      const res = await authFetch("/api/subscription")
      if (res.ok) setSub(await res.json())
    } catch { /* noop */ }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) loadSub()
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadSub(); else setSub(null)
    })
    return () => subscription.unsubscribe()
  }, [loadSub])

  const isAdmin = !!user?.email && ADMINS.includes(user.email.toLowerCase())
  const hasAccess = isAdmin || !!sub?.has_access

  return { user, loading, sub, isAdmin, hasAccess, reload: loadSub }
}
