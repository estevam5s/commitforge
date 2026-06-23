import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getAccessForUser } from "@/lib/saas"

export const dynamic = "force-dynamic"

// resolve token -> usuário/plano. aceita { token } no corpo ou header x-cli-token
async function resolve(token?: string | null) {
  if (!token) return null
  const db = createAdminClient()
  const { data: row } = await db.from("cli_tokens").select("user_id,revoked").eq("token", token).maybeSingle()
  if (!row || row.revoked) return null
  await db.from("cli_tokens").update({ last_used_at: new Date().toISOString() }).eq("token", token)
  const { data: u } = await db.auth.admin.getUserById(row.user_id)
  const email = u?.user?.email
  const acc = await getAccessForUser(row.user_id, email)
  return { acc, email }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const token = body.token || req.headers.get("x-cli-token")
  const r = await resolve(token)
  if (!r) return NextResponse.json({ valid: false, error: "Token inválido ou revogado" }, { status: 401 })
  return NextResponse.json({
    valid: true,
    user: { id: r.acc.userId, email: r.email },
    plan: r.acc.plan?.slug || "inicial",
    plan_name: r.acc.plan?.name || "Inicial",
    has_access: r.acc.hasAccess,
    trial_active: r.acc.trialActive,
    limits: r.acc.limits,
  })
}
