import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { createHash } from "crypto"

const ALLOWED_METHODS = ["curl", "docker", "pip", "brew", "apt", "pacman", "winget", "powershell", "git", "aur", "dnf", "unknown"]
const ALLOWED_PLATFORMS = ["linux", "macos", "windows", "docker", "arch", "debian", "ubuntu", "fedora", "other"]
const ALLOWED_ARCHES = ["x86_64", "arm64", "arm32", null, undefined]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    const method   = ALLOWED_METHODS.includes(body.method) ? body.method : "unknown"
    const platform = ALLOWED_PLATFORMS.includes(body.platform) ? body.platform : "other"
    const version  = typeof body.version === "string" ? body.version.slice(0, 20) : "3.0.0"
    const arch     = ALLOWED_ARCHES.includes(body.arch) ? (body.arch ?? null) : null

    // Get client IP and hash it for privacy
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"
    const ip_hash = createHash("sha256").update(ip + "commitforge-salt").digest("hex")

    const user_agent = (req.headers.get("user-agent") ?? "").slice(0, 512)

    const supabase = createAdminClient()
    const { error } = await supabase.from("installs").insert({
      method,
      platform,
      version,
      arch,
      ip_hash,
      user_agent,
    })

    if (error) {
      console.error("Install track error:", error)
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Install track exception:", err)
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 })
  }
}

// Public GET: returns total install count (no auth required)
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc("get_install_count")
    if (error) throw error
    return NextResponse.json({ count: data ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
