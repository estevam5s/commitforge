import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client (server-side only — never expose in browser)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export type Database = {
  public: {
    Tables: {
      installs: {
        Row: {
          id: string
          created_at: string
          method: string
          platform: string
          version: string
          user_agent: string | null
          ip_hash: string | null
          country: string | null
          arch: string | null
        }
        Insert: Omit<Database["public"]["Tables"]["installs"]["Row"], "id" | "created_at">
      }
      feedbacks: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          name: string | null
          email: string | null
          rating: number | null
          message: string
          category: string
          status: string
          admin_reply: string | null
        }
        Insert: Pick<
          Database["public"]["Tables"]["feedbacks"]["Row"],
          "message" | "name" | "email" | "rating" | "category"
        >
      }
      commits_log: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          repo_url: string
          repo_name: string | null
          branch: string | null
          start_date: string | null
          end_date: string | null
          mode: string | null
          commits_count: number
          status: string
          error_msg: string | null
          duration_ms: number | null
          notes: string | null
        }
      }
      cli_improvements: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          priority: string
          status: string
          author: string | null
          version_target: string | null
          tags: string[]
        }
      }
    }
  }
}
