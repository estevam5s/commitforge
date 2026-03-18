import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { event_id, action, reason, notes, guardian } = await req.json()
    const supabase = createAdminClient()

    // Record the prune action
    await supabase.from("guardian_prunes").insert({
      event_id,
      action:   action ?? "pruned",
      reason:   reason ?? null,
      notes:    notes  ?? null,
      guardian: guardian ?? "Guardião AVT",
    })

    // Update the event status
    const newStatus = action === "pruned" ? "pruned" : action === "warned" ? "warning" : "monitored"
    await supabase
      .from("timeline_events")
      .update({ status: newStatus, timeline_type: action === "pruned" ? "pruned" : undefined })
      .eq("id", event_id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Guardian prune error:", err)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
