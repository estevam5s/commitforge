import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()
    const currentYear = new Date().getFullYear()

    const commitYear = body.commit_year ?? body.year ?? currentYear
    const isFuture   = commitYear > currentYear
    const isDeepPast = commitYear < currentYear - 2

    // Determine timeline type based on heuristics
    let timelineType = "sacred"
    let nexusLevel   = 0
    if (isFuture) {
      timelineType = "nexus"
      nexusLevel = Math.min(10, 5 + (commitYear - currentYear))
    } else if (isDeepPast && body.commits_count > 20) {
      timelineType = "branched"
      nexusLevel = 3
    } else if (body.branch_name && !["main","master","historico"].some(b => body.branch_name?.includes(b))) {
      timelineType = "branched"
      nexusLevel = 2
    }

    const { data, error } = await supabase
      .from("timeline_events")
      .insert({
        operator:      body.operator ?? body.user ?? "anonymous",
        repo_name:     body.repo_name ?? body.repo ?? null,
        repo_url:      body.repo_url  ?? null,
        commit_year:   commitYear,
        commits_count: body.commits_count ?? body.commits ?? 0,
        branch_name:   body.branch_name ?? body.branch ?? null,
        mode:          body.mode ?? "unknown",
        timeline_type: timelineType,
        nexus_level:   nexusLevel,
        is_future:     isFuture,
        is_deep_past:  isDeepPast,
        status:        "active",
        source:        body.source ?? "api",
        ip_hash:       body.ip_hash ?? null,
        session_id:    body.session_id ?? null,
        metadata:      body.metadata ?? {},
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, event: data })
  } catch (err) {
    console.error("Guardian event error:", err)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
