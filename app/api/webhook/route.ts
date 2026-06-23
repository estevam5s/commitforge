import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { stripeReq, verifyStripeSignature } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const body = await req.text()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const sig = req.headers.get("stripe-signature")
  if (secret && !verifyStripeSignature(body, sig, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 })
  }
  let event: any
  try { event = JSON.parse(body) } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }) }

  const db = createAdminClient()
  const { data: seen } = await db.from("app_payment_events").select("id").eq("id", event.id).maybeSingle()
  if (seen) return NextResponse.json({ received: true, duplicate: true })

  const REFUND_DAYS = Number(process.env.REFUND_DAYS || 7)
  const slugFromPrice = async (priceId?: string) => {
    if (!priceId) return undefined
    const { data } = await db.from("app_plans").select("slug")
      .or(`stripe_price_month.eq.${priceId},stripe_price_year.eq.${priceId}`).maybeSingle()
    return data?.slug as string | undefined
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object
      const userId = s.metadata?.user_id, slug = s.metadata?.slug, cycle = s.metadata?.cycle || "month"
      if (userId && slug) {
        let periodEnd: string | null = null
        const subId = (s.subscription as string) || null
        if (subId) {
          const f: any = await stripeReq(`subscriptions/${subId}`, undefined, "GET")
          if (f?.current_period_end) periodEnd = new Date(f.current_period_end * 1000).toISOString()
        }
        await db.from("app_subscriptions").upsert({
          user_id: userId, plan_slug: slug, status: "active", cycle,
          stripe_customer_id: s.customer, stripe_subscription_id: subId,
          current_period_end: periodEnd, cancel_at_period_end: false,
          refund_eligible_until: new Date(Date.now() + REFUND_DAYS * 864e5).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        await db.from("profiles").update({ is_demo: false }).eq("id", userId)
      }
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object, customer = sub.customer, priceId = sub.items?.data?.[0]?.price?.id
      const updates: any = {
        status: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end || false,
        stripe_subscription_id: sub.id, updated_at: new Date().toISOString(),
      }
      if (event.type === "customer.subscription.deleted") updates.plan_slug = "inicial"
      else { const slug = await slugFromPrice(priceId); if (slug) updates.plan_slug = slug }
      await db.from("app_subscriptions").update(updates).eq("stripe_customer_id", customer)
    }
    await db.from("app_payment_events").insert({ id: event.id, type: event.type, payload: event })
  } catch (e) {
    console.error("webhook", e)
    return NextResponse.json({ error: "handler" }, { status: 500 })
  }
  return NextResponse.json({ received: true })
}
