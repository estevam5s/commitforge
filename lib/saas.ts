import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase"

// ── Admin allowlist ─────────────────────────────────────────────────
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
export const isAdminEmail = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase())

export const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function siteUrl() {
  return (process.env.APP_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")
}

// ── Auth via Bearer (token de sessão Supabase) ──────────────────────
export async function getUserFromRequest(req: Request) {
  const authz = req.headers.get("authorization") || ""
  if (!authz.startsWith("Bearer ")) return null
  const token = authz.slice(7)
  const db = createAdminClient()
  const { data } = await db.auth.getUser(token)
  return data?.user ?? null
}

export type PlanLimits = {
  repos: number; commits_month: number; providers: number; cli_tokens: number
  batch: boolean; schedule: boolean; webhooks: boolean; api: boolean; team: boolean
}

export async function getAccessForUser(userId: string, email?: string | null) {
  const db = createAdminClient()
  const [{ data: sub }, { data: profile }, { data: plans }] = await Promise.all([
    db.from("app_subscriptions").select("*").eq("user_id", userId).maybeSingle(),
    db.from("profiles").select("trial_ends_at").eq("id", userId).maybeSingle(),
    db.from("app_plans").select("*").eq("active", true).order("sort_order"),
  ])
  const admin = isAdminEmail(email)
  const trialEndsAt = profile?.trial_ends_at ?? null
  const trialActive = !!trialEndsAt && new Date(trialEndsAt) > new Date()
  const paidActive = !!sub && sub.plan_slug !== "inicial" && ["active", "trialing"].includes(sub.status)
  // durante o trial o usuário tem acesso nível Pro
  const effectiveSlug = admin ? "enterprise" : paidActive ? sub!.plan_slug : trialActive ? "pro" : sub?.plan_slug || "inicial"
  const plan = (plans || []).find((p) => p.slug === effectiveSlug) || null
  const hasAccess = admin || paidActive || trialActive
  return {
    userId, email: email ?? null, isAdmin: admin,
    subscription: sub ?? null, plan, plans: plans || [],
    trialActive, trialEndsAt, hasAccess,
    limits: (plan?.limits ?? {}) as PlanLimits,
  }
}

// ── Stripe via fetch (sem SDK) ──────────────────────────────────────
const STRIPE_BASE = "https://api.stripe.com/v1"
function stripeKey() {
  const k = process.env.STRIPE_SECRET_KEY
  if (!k) throw new Error("STRIPE_SECRET_KEY ausente")
  return k
}
function toForm(obj: Record<string, any>, prefix = ""): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (typeof v === "object" && !Array.isArray(v)) parts.push(toForm(v, key))
    else if (Array.isArray(v)) v.forEach((item, i) => parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(item)}`))
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
  }
  return parts.filter(Boolean).join("&")
}
export async function stripeReq(path: string, body?: Record<string, any>, method = "POST") {
  const res = await fetch(`${STRIPE_BASE}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? toForm(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || "Stripe error")
  return json
}

// verificação da assinatura do webhook (compatível com Stripe)
export function verifyStripeSignature(payload: string, sigHeader: string | null, secret: string): boolean {
  if (!sigHeader) return false
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")))
  const t = parts["t"], v1 = parts["v1"]
  if (!t || !v1) return false
  const signed = `${t}.${payload}`
  const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))
  } catch {
    return false
  }
}

export function cliToken() {
  return "cf_" + crypto.randomBytes(24).toString("hex")
}
