"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Mail, Lock, User, Loader2, GitBranch, Check } from "lucide-react"

// ── Eye that follows the cursor (+ blink) ───────────────────────────
function EyeBall({ size = 22, pupilSize = 9, maxDistance = 6, isBlinking = false, cover = false }: { size?: number; pupilSize?: number; maxDistance?: number; isBlinking?: boolean; cover?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [m, setM] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setM({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", h)
    return () => window.removeEventListener("mousemove", h)
  }, [])
  let px = 0, py = 0
  if (ref.current && !cover) {
    const r = ref.current.getBoundingClientRect()
    const dx = m.x - (r.left + r.width / 2), dy = m.y - (r.top + r.height / 2)
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance)
    const a = Math.atan2(dy, dx)
    px = Math.cos(a) * dist; py = Math.sin(a) * dist
  }
  const closed = isBlinking || cover
  return (
    <div ref={ref} className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{ width: size, height: closed ? 2 : size, backgroundColor: "white", overflow: "hidden" }}>
      {!closed && <div className="rounded-full" style={{ width: pupilSize, height: pupilSize, backgroundColor: "#2D2D2D", transform: `translate(${px}px, ${py}px)`, transition: "transform 0.1s ease-out" }} />}
    </div>
  )
}

function Character({ color, left, width, height, blink, cover, faceTop = 46 }: { color: string; left: number; width: number; height: number; blink: boolean; cover?: boolean; faceTop?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [m, setM] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setM({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", h)
    return () => window.removeEventListener("mousemove", h)
  }, [])
  let skew = 0, fx = 0, fy = 0
  if (ref.current) {
    const r = ref.current.getBoundingClientRect()
    const dx = m.x - (r.left + r.width / 2), dy = m.y - (r.top + r.height / 3)
    skew = Math.max(-6, Math.min(6, -dx / 120))
    fx = Math.max(-12, Math.min(12, dx / 22)); fy = Math.max(-8, Math.min(8, dy / 32))
  }
  return (
    <div ref={ref} className="absolute bottom-0 transition-all duration-500 ease-in-out"
      style={{ left, width, height, backgroundColor: color, borderRadius: "12px 12px 0 0", transform: `skewX(${skew}deg)`, transformOrigin: "bottom center" }}>
      <div className="absolute flex gap-5 transition-all duration-300" style={{ left: width / 2 - 26 + fx, top: faceTop + fy }}>
        <EyeBall isBlinking={blink} cover={cover} />
        <EyeBall isBlinking={blink} cover={cover} />
      </div>
    </div>
  )
}

function useBlink() {
  const [b, setB] = useState(false)
  useEffect(() => {
    let t: any
    const loop = () => {
      t = setTimeout(() => { setB(true); setTimeout(() => { setB(false); loop() }, 150) }, Math.random() * 4000 + 3000)
    }
    loop()
    return () => clearTimeout(t)
  }, [])
  return b
}

const PERKS = [
  "7 dias grátis com acesso Pro — sem cartão",
  "Dashboard + CLI integrados na mesma conta",
  "Commits retroativos com histórico e auditoria",
  "GitHub, GitLab e Bitbucket",
]

function LoginInner() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") || "/dashboard/commits"
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const blinkA = useBlink(), blinkB = useBlink()
  const coverEyes = password.length > 0 && !showPass

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setMsg(null)
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message.includes("Invalid login") ? "E-mail ou senha incorretos." : error.message); setLoading(false); return }
      router.push(next)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.session) router.push(next)
      else { setMsg("Conta criada! Verifique seu e-mail para confirmar e depois faça login."); setMode("login") }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0a0a]">
      {/* Left: animated characters */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-amber-600/90 via-amber-700 to-[#1a1206]">
        <div className="relative z-20 flex items-center gap-2 text-lg font-semibold text-white">
          <div className="size-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center"><GitBranch className="size-5" /></div>
          <span>CommitForge</span>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[440px]">
          <div className="relative" style={{ width: 480, height: 400 }}>
            <Character color="#1f2937" left={20} width={160} height={360} blink={blinkB} faceTop={50} />
            <Character color="#f5a623" left={200} width={190} height={400} blink={blinkA} cover={coverEyes} faceTop={48} />
          </div>
        </div>

        <div className="relative z-20 text-white/90 max-w-md">
          <h2 className="text-2xl font-semibold text-white">Controle o histórico do seu Git.</h2>
          <ul className="mt-4 space-y-2">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-white/80">
                <Check className="size-4 mt-0.5 shrink-0 text-white" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 text-white font-semibold mb-8">
            <GitBranch className="size-6 text-amber-500" /> CommitForge
          </div>

          <h1 className="text-2xl font-semibold text-white">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
          <p className="text-sm text-zinc-500 mt-1">{mode === "login" ? "Acesse seu painel e a CLI." : "Comece com 7 dias grátis no nível Pro."}</p>

          <div className="mt-6 grid grid-cols-2 gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null); setMsg(null) }}
                className={`py-2 rounded-md text-sm font-medium transition ${mode === m ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"}`}>
                {m === "login" ? "Login" : "Registro"}
              </button>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          {msg && <p className="mt-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">{msg}</p>}

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <Field icon={<User className="size-4" />}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required
                  className="w-full bg-transparent outline-none text-white placeholder-zinc-500 text-sm" />
              </Field>
            )}
            <Field icon={<Mail className="size-4" />}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required autoComplete="email"
                className="w-full bg-transparent outline-none text-white placeholder-zinc-500 text-sm" />
            </Field>
            <Field icon={<Lock className="size-4" />}>
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full bg-transparent outline-none text-white placeholder-zinc-500 text-sm" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-zinc-500 hover:text-white">{showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </Field>

            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={async () => { if (!email) { setError("Informe o e-mail para recuperar a senha."); return } await supabase.auth.resetPasswordForEmail(email); setMsg("Enviamos um link de recuperação para seu e-mail.") }}
                  className="text-xs text-zinc-500 hover:text-amber-400">Esqueci a senha</button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta grátis"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-600">
            Ao continuar você concorda com os termos. <Link href="/" className="text-amber-500 hover:underline">Voltar ao site</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus-within:border-amber-500/50 transition">
      <span className="text-zinc-500">{icon}</span>
      {children}
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] grid place-items-center"><Loader2 className="size-6 text-amber-500 animate-spin" /></div>}><LoginInner /></Suspense>
}
