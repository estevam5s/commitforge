import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest, isAdminEmail } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: "forbidden" }, { status: 403 })
  const db = createAdminClient()
  const view = new URL(req.url).searchParams.get("view") || "overview"

  if (view === "users") {
    const [{ data: profiles }, { data: subs }] = await Promise.all([
      db.from("profiles").select("id,full_name,trial_ends_at,is_demo,created_at").order("created_at", { ascending: false }).limit(500),
      db.from("app_subscriptions").select("*"),
    ])
    const subByUser = new Map((subs || []).map((s) => [s.user_id, s]))
    const users = (profiles || []).map((p) => ({ ...p, subscription: subByUser.get(p.id) || null }))
    return NextResponse.json({ users })
  }

  const [profiles, paid, events, jobs, plansAgg] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("app_subscriptions").select("plan_slug", { count: "exact" }).neq("plan_slug", "inicial").in("status", ["active", "trialing"]),
    db.from("app_payment_events").select("id", { count: "exact", head: true }),
    db.from("commits_log").select("commits_count"),
    db.from("app_subscriptions").select("plan_slug").neq("plan_slug", "inicial").in("status", ["active", "trialing"]),
  ])
  const byPlan: Record<string, number> = {}
  for (const s of plansAgg.data || []) byPlan[s.plan_slug] = (byPlan[s.plan_slug] || 0) + 1
  const totalCommits = (jobs.data || []).reduce((s, j) => s + (j.commits_count || 0), 0)
  return NextResponse.json({
    totals: {
      users: profiles.count || 0,
      paid: paid.count || 0,
      events: events.count || 0,
      jobs: (jobs.data || []).length,
      commits: totalCommits,
    },
    byPlan,
  })
}
