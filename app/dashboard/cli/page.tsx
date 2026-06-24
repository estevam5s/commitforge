"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSaas, authFetch } from "@/hooks/use-saas"
import { DashNav } from "@/components/saas/dash-nav"
import { Terminal, Plus, Copy, Check, Trash2, KeyRound } from "lucide-react"

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <pre className="bg-black/60 border border-white/10 rounded-lg p-3 pr-10 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap">{children}</pre>
      <button onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1200) }}
        className="absolute top-2 right-2 text-zinc-500 hover:text-amber-400">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}</button>
    </div>
  )
}

export default function CliPage() {
  const { sub, isAdmin } = useSaas()
  const [tokens, setTokens] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [err, setErr] = useState("")
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const load = () => authFetch("/api/cli/tokens").then((r) => r.json()).then((d) => { setTokens(d.tokens || []); setLoaded(true) })
  useEffect(() => { load() }, [])

  const create = async () => {
    setCreating(true); setErr("")
    const res = await authFetch("/api/cli/tokens", { method: "POST", body: JSON.stringify({ name: "CLI" }) })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setErr(data.error || "Erro ao criar token"); return }
    setRevealed((r) => ({ ...r, [data.token.id]: true }))
    load()
  }
  const revoke = async (id: string) => {
    if (!confirm("Revogar este token? A CLI que o usa perderá o acesso.")) return
    await authFetch(`/api/cli/tokens?id=${id}`, { method: "DELETE" }); load()
  }

  const tokensLimit = sub?.limits?.cli_tokens ?? 1
  const planName = isAdmin ? "Admin" : sub?.plan?.name || "Inicial"

  return (
    <div className="min-h-screen bg-[#040810] text-zinc-200">
      <DashNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2"><Terminal className="size-6 text-amber-500" /> CLI do CommitForge</h1>
          <p className="text-sm text-zinc-500 mt-1">Conecte o terminal à sua conta ({planName}) e crie commits retroativos com o Git conectado.</p>
        </div>

        {/* Passo 1: instalar */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="font-semibold text-white">1. Instale a CLI</h2>
          <p className="text-sm text-zinc-400">Linux / macOS (instalador automático):</p>
          <CodeBlock>{`curl -fsSL https://commitforge.vercel.app/install.sh | bash`}</CodeBlock>
          <p className="text-sm text-zinc-400">Alternativa (clonando o repositório):</p>
          <CodeBlock>{`git clone https://github.com/estevam5s/commitforge.git
cd commitforge/cli-commit
pip install -r requirements.txt
python forge.py --help`}</CodeBlock>
        </section>

        {/* Passo 2: token */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-white">2. Seus tokens de CLI</h2>
              <p className="text-sm text-zinc-500 mt-1">{tokens.length}{tokensLimit === -1 ? "" : ` / ${tokensLimit}`} token(s) — o token autentica o terminal na sua conta.</p>
            </div>
            <button onClick={create} disabled={creating}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium text-sm flex items-center gap-2 disabled:opacity-60">
              <Plus className="size-4" /> Gerar token
            </button>
          </div>
          {err && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{err}</p>}

          {!loaded ? <p className="text-sm text-zinc-500">Carregando…</p> : tokens.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum token ainda. Gere um para conectar a CLI.</p>
          ) : (
            <div className="space-y-2">
              {tokens.map((t) => (
                <div key={t.id} className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-lg px-3 py-2">
                  <KeyRound className="size-4 text-amber-500 shrink-0" />
                  <code className="font-mono text-xs text-zinc-300 flex-1 truncate">{revealed[t.id] ? t.token : `${t.token.slice(0, 8)}••••••••••••••••`}</code>
                  <button onClick={() => setRevealed((r) => ({ ...r, [t.id]: !r[t.id] }))} className="text-xs text-zinc-500 hover:text-amber-400">{revealed[t.id] ? "ocultar" : "ver"}</button>
                  <button onClick={() => navigator.clipboard.writeText(t.token)} className="text-zinc-500 hover:text-amber-400"><Copy className="size-4" /></button>
                  <button onClick={() => revoke(t.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-zinc-600">Guarde o token com segurança. Você também pode autenticar com e-mail e senha (veja abaixo).</p>
        </section>

        {/* Passo 3: login + usar */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="font-semibold text-white">3. Faça login e crie commits no passado</h2>
          <p className="text-sm text-zinc-400">Login com e-mail e senha (gera e salva um token local):</p>
          <CodeBlock>{`commitforge login --email seu@email.com
# ou com token:
commitforge login --token cf_xxxxxxxxxxxxxxxx`}</CodeBlock>

          <p className="text-sm text-zinc-400">Commitar no passado (modo projeto — intervalo de datas):</p>
          <CodeBlock>{`# dentro do seu repositório git já clonado/conectado
commitforge commit \\
  --repo https://github.com/usuario/projeto.git \\
  --start-date 2021-01-01 --end-date 2021-12-31 \\
  --branch main`}</CodeBlock>

          <p className="text-sm text-zinc-400">Preencher um ano inteiro:</p>
          <CodeBlock>{`commitforge commit --repo https://github.com/usuario/projeto.git --year 2020`}</CodeBlock>

          <p className="text-sm text-zinc-400">Acompanhar e listar:</p>
          <CodeBlock>{`commitforge status        # status do plano + último job
commitforge historico     # seus jobs (sincroniza com o dashboard)`}</CodeBlock>

          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-300/90">
            A CLI respeita os limites do seu plano ({planName}). Jobs e uso aparecem automaticamente em{" "}
            <Link href="/dashboard/commits" className="underline">Meus commits</Link>.
          </div>
        </section>
      </main>
    </div>
  )
}
