import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    const name    = typeof body.name === "string" ? body.name.slice(0, 100) : null
    const email   = typeof body.email === "string" ? body.email.slice(0, 200) : null
    const message = typeof body.message === "string" ? body.message.slice(0, 2000) : ""
    const rating  = typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5 ? body.rating : null
    const allowedCategories = ["bug", "feature", "general", "performance", "docs"]
    const category = allowedCategories.includes(body.category) ? body.category : "general"

    if (!message.trim()) {
      return NextResponse.json({ ok: false, error: "message_required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("feedbacks").insert({ name, email, message, rating, category })

    if (error) {
      console.error("Feedback insert error:", error)
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Feedback exception:", err)
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 })
  }
}
