import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createAdminClient()
    const currentYear = new Date().getFullYear()

    const [eventsResult, prunesResult] = await Promise.all([
      supabase
        .from("timeline_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("guardian_prunes")
        .select("*, timeline_events(repo_name, commit_year)")
        .order("created_at", { ascending: false })
        .limit(20),
    ])

    const events = eventsResult.data ?? []
    const prunes = prunesResult.data ?? []

    const nexusCount    = events.filter(e => e.timeline_type === "nexus").length
    const branchCount   = events.filter(e => e.timeline_type === "branched").length
    const prunedCount   = events.filter(e => e.status === "pruned").length
    const futureCount   = events.filter(e => e.is_future).length
    const deepPastCount = events.filter(e => e.is_deep_past).length
    const cliCount      = events.filter(e => e.source === "cli").length
    const flaskCount    = events.filter(e => e.source === "flask").length

    // Health 100 = perfect sacred, decreases with nexus/branches/future
    const health = Math.max(0, Math.min(100,
      100
      - nexusCount * 12
      - branchCount * 5
      - futureCount * 15
      + prunedCount * 3
    ))

    const threatLevel =
      nexusCount > 3 || futureCount > 2 ? "critical" :
      nexusCount > 1 || futureCount > 0 ? "red" :
      branchCount > 3 ? "yellow" : "green"

    // Events by year (for timeline chart)
    const byYear: Record<number, number> = {}
    events.forEach(e => {
      if (e.commit_year) byYear[e.commit_year] = (byYear[e.commit_year] ?? 0) + (e.commits_count ?? 0)
    })
    const timelineChart = Object.entries(byYear)
      .map(([year, count]) => ({ year: parseInt(year), count, isFuture: parseInt(year) > currentYear }))
      .sort((a, b) => a.year - b.year)

    return NextResponse.json({
      events,
      prunes,
      timeline_health: health,
      threat_level: threatLevel,
      total_events: events.length,
      nexus_count: nexusCount,
      branch_count: branchCount,
      pruned_count: prunedCount,
      future_count: futureCount,
      deep_past_count: deepPastCount,
      cli_count: cliCount,
      flask_count: flaskCount,
      timeline_chart: timelineChart,
      current_year: currentYear,
    })
  } catch (err) {
    console.error("Guardian error:", err)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
