import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase"
import { getAccessForUser, cliToken } from "@/lib/saas"

export const dynamic = "force-dynamic"

// POST { email, password, name? } -> autentica e devolve um token de CLI
export async function POST(req: Request) {
  const { email, password, name } = await req.json().catch(() => ({}))
  if (!email || !password) return NextResponse.json({ error: "Informe e-mail e senha" }, { status: 400 })

  // login com a anon key (valida credenciais)
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: signIn, error } = await anon.auth.signInWithPassword({ email, password })
  if (error || !signIn.user) return NextResponse.json({ error: "E-mail ou senha incorretos" }, { status: 401 })

  const user = signIn.user
  const acc = await getAccessForUser(user.id, user.email)
  const db = createAdminClient()

  // respeita o limite de tokens do plano
  const limit = acc.limits?.cli_tokens ?? 1
  const { data: tokens } = await db.from("cli_tokens").select("id").eq("user_id", user.id).eq("revoked", false)
  if (limit !== -1 && (tokens?.length || 0) >= limit) {
    // reaproveita: revoga o mais antigo para não travar o usuário
    const { data: oldest } = await db.from("cli_tokens").select("id").eq("user_id", user.id).eq("revoked", false).order("created_at").limit(1).maybeSingle()
    if (oldest) await db.from("cli_tokens").update({ revoked: true }).eq("id", oldest.id)
  }

  const token = cliToken()
  await db.from("cli_tokens").insert({ user_id: user.id, token, name: name || "CLI", last_used_at: new Date().toISOString() })

  return NextResponse.json({
    ok: true,
    token,
    user: { id: user.id, email: user.email, name: user.user_metadata?.full_name || null },
    plan: acc.plan?.slug || "inicial",
    plan_name: acc.plan?.name || "Inicial",
    has_access: acc.hasAccess,
    trial_active: acc.trialActive,
    limits: acc.limits,
  })
}
