import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest, getAccessForUser, cliToken } from "@/lib/saas"

export const dynamic = "force-dynamic"

// Gerencia tokens de CLI a partir do dashboard (auth Bearer)
export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const { data } = await db.from("cli_tokens").select("id,name,token,last_used_at,revoked,created_at")
    .eq("user_id", user.id).eq("revoked", false).order("created_at", { ascending: false })
  return NextResponse.json({ tokens: data || [] })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const acc = await getAccessForUser(user.id, user.email)
  const db = createAdminClient()
  const limit = acc.limits?.cli_tokens ?? 1
  const { data: tokens } = await db.from("cli_tokens").select("id").eq("user_id", user.id).eq("revoked", false)
  if (limit !== -1 && (tokens?.length || 0) >= limit) {
    return NextResponse.json({ error: `Limite de tokens do plano atingido (${limit}). Faça upgrade ou revogue um token.` }, { status: 402 })
  }
  const { name } = await req.json().catch(() => ({}))
  const token = cliToken()
  const { data, error } = await db.from("cli_tokens").insert({ user_id: user.id, token, name: name || "CLI" }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ token: data })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  await db.from("cli_tokens").update({ revoked: true }).eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
