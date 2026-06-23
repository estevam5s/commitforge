import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getAccessForUser, getUserFromRequest } from "@/lib/saas"

export const dynamic = "force-dynamic"

// resolve usuário por x-cli-token (CLI) ou Bearer (dashboard)
async function resolveUser(req: Request) {
  const db = createAdminClient()
  const cli = req.headers.get("x-cli-token")
  if (cli) {
    const { data: row } = await db.from("cli_tokens").select("user_id,revoked").eq("token", cli).maybeSingle()
    if (!row || row.revoked) return null
    const { data: u } = await db.auth.admin.getUserById(row.user_id)
    return { id: row.user_id, email: u?.user?.email }
  }
  const user = await getUserFromRequest(req)
  return user ? { id: user.id, email: user.email } : null
}

export async function GET(req: Request) {
  const u = await resolveUser(req)
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const { data } = await db.from("commits_log").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(100)
  return NextResponse.json({ jobs: data || [] })
}

export async function POST(req: Request) {
  const u = await resolveUser(req)
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const acc = await getAccessForUser(u.id, u.email)
  const limits = acc.limits
  const db = createAdminClient()
  const b = await req.json().catch(() => ({}))
  if (!b.repo_url) return NextResponse.json({ error: "repo_url obrigatório" }, { status: 400 })

  const commitsCount = Number(b.commits_count || 0)

  // gating: commits no mês
  if (limits.commits_month !== -1) {
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0)
    const { data: monthJobs } = await db.from("commits_log").select("commits_count").eq("user_id", u.id).gte("created_at", start.toISOString())
    const used = (monthJobs || []).reduce((s, j) => s + (j.commits_count || 0), 0)
    if (used + commitsCount > limits.commits_month) {
      return NextResponse.json({ error: `Limite mensal de commits do plano atingido (${limits.commits_month}). Faça upgrade.`, code: "LIMIT_COMMITS" }, { status: 402 })
    }
  }

  // gating: repositórios distintos
  if (limits.repos !== -1) {
    const { data: repos } = await db.from("commits_log").select("repo_url").eq("user_id", u.id)
    const distinct = new Set((repos || []).map((r) => r.repo_url))
    if (!distinct.has(b.repo_url) && distinct.size >= limits.repos) {
      return NextResponse.json({ error: `Limite de repositórios do plano atingido (${limits.repos}). Faça upgrade.`, code: "LIMIT_REPOS" }, { status: 402 })
    }
  }

  // gating: modo projeto / lote exigem plano
  if (b.mode === "projeto" && limits.commits_month !== -1 && !limits.batch && !acc.trialActive && !acc.isAdmin) {
    // modo projeto liberado a partir do Starter; inicial só arquivo
    if (acc.plan?.slug === "inicial") {
      return NextResponse.json({ error: "Modo projeto disponível a partir do plano Starter.", code: "LIMIT_MODE" }, { status: 402 })
    }
  }

  const { data, error } = await db.from("commits_log").insert({
    user_id: u.id,
    repo_url: b.repo_url,
    repo_name: b.repo_name || null,
    branch: b.branch || "main",
    start_date: b.start_date || null,
    end_date: b.end_date || null,
    mode: b.mode || "arquivo",
    commits_count: commitsCount,
    status: b.status || "completed",
    duration_ms: b.duration_ms || null,
    notes: b.notes || null,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, job: data })
}
