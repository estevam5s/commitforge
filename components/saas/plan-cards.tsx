"use client"

import { Check } from "lucide-react"

export type Plan = {
  slug: "inicial" | "starter" | "pro" | "enterprise"
  name: string
  description?: string
  price_month: number
  price_year: number
  features: string[]
  highlighted: boolean
}

const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })

export function CycleToggle({ cycle, setCycle }: { cycle: "month" | "year"; setCycle: (c: "month" | "year") => void }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/5">
      <button onClick={() => setCycle("month")} className={`px-4 py-1.5 rounded-full text-sm transition ${cycle === "month" ? "bg-amber-500 text-black font-medium" : "text-zinc-400 hover:text-white"}`}>Mensal</button>
      <button onClick={() => setCycle("year")} className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-1.5 ${cycle === "year" ? "bg-amber-500 text-black font-medium" : "text-zinc-400 hover:text-white"}`}>
        Anual <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">−20%</span>
      </button>
    </div>
  )
}

export function PlanCards({
  plans, cycle, currentSlug, onSelect, busy, ctaLabel,
}: {
  plans: Plan[]
  cycle: "month" | "year"
  currentSlug?: string
  onSelect: (slug: string) => void
  busy?: string | null
  ctaLabel?: (p: Plan) => string
}) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
      {plans.map((p) => {
        const price = cycle === "year" ? p.price_year : p.price_month
        const isCurrent = currentSlug === p.slug
        const free = p.slug === "inicial"
        return (
          <div key={p.slug}
            className={`relative rounded-2xl border p-6 flex flex-col ${p.highlighted ? "border-amber-500/50 bg-gradient-to-b from-amber-500/[0.08] to-transparent shadow-[0_0_40px_-12px_rgba(245,166,35,0.45)]" : "border-white/10 bg-white/[0.02]"}`}>
            {p.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-medium px-3 py-1 rounded-full bg-amber-500 text-black">Mais popular</span>}
            <h3 className="text-lg font-semibold text-white">{p.name}</h3>
            {p.description && <p className="text-xs text-zinc-500 mt-1">{p.description}</p>}
            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-bold text-white">{free ? "R$ 0" : brl(cycle === "year" ? Math.round(price / 12) : price)}</span>
              {!free && <span className="text-zinc-500 text-sm mb-1">/mês</span>}
            </div>
            {!free && cycle === "year" && <p className="text-xs text-zinc-500 mt-1">{brl(price)} cobrado anualmente</p>}
            {free && <p className="text-xs text-zinc-500 mt-1">7 dias grátis no nível Pro</p>}

            <button onClick={() => onSelect(p.slug)} disabled={free || isCurrent || busy === p.slug}
              className={`mt-5 w-full py-2.5 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed ${
                isCurrent ? "bg-white/5 text-zinc-400" :
                p.highlighted ? "bg-amber-500 text-black hover:bg-amber-400" :
                free ? "bg-white/5 text-zinc-500" : "bg-white/10 text-white hover:bg-white/20"
              }`}>
              {busy === p.slug ? "Aguarde…" : isCurrent ? "Plano atual" : ctaLabel ? ctaLabel(p) : free ? "Incluído" : "Assinar"}
            </button>

            <ul className="mt-6 space-y-2.5 text-sm flex-1">
              {p.features.map((f, i) => (
                <li key={i} className="flex gap-2 text-zinc-300">
                  <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
