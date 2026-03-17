import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createAdminClient()

    const [totalResult, platformResult, methodResult, last30Result] = await Promise.all([
      supabase.rpc("get_install_count"),
      supabase.rpc("get_installs_by_platform"),
      supabase.rpc("get_installs_by_method"),
      supabase.rpc("get_installs_last_30_days"),
    ])

    const [feedbacksResult, commitsResult, improvementsResult] = await Promise.all([
      supabase.from("feedbacks").select("id, created_at, name, rating, message, category, status"),
      supabase
        .from("commits_log")
        .select("id, created_at, repo_name, commits_count, status, duration_ms, mode")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("cli_improvements")
        .select("*")
        .order("priority", { ascending: false }),
    ])

    return NextResponse.json({
      total_installs: totalResult.data ?? 0,
      by_platform: platformResult.data ?? [],
      by_method: methodResult.data ?? [],
      last_30_days: last30Result.data ?? [],
      feedbacks: feedbacksResult.data ?? [],
      recent_commits: commitsResult.data ?? [],
      improvements: improvementsResult.data ?? [],
    })
  } catch (err) {
    console.error("Stats error:", err)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
