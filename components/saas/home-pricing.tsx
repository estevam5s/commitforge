"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"

type Plan = {
  slug: string; name: string; description?: string
  price_month: number; price_year: number; features: string[]; highlighted: boolean
}

const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })

export function HomePricing() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [cycle, setCycle] = useState<"month" | "year">("month")

  useEffect(() => {
    fetch("/api/plans").then((r) => r.json()).then((d) => setPlans(d.plans || [])).catch(() => {})
  }, [])

  return (
    <section id="pricing" className="relative px-6 py-24 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-green-400">Planos</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">Preço justo, escala com você</h2>
          <p className="mt-4 text-gray-400">Comece com <strong className="text-white">7 dias grátis no nível Pro</strong>, sem cartão. Cancele quando quiser — garantia de reembolso de 7 dias. Sem cobrança por armazenamento.</p>

          <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full border border-gray-700 bg-gray-900">
            <button onClick={() => setCycle("month")} className={`px-5 py-1.5 rounded-full text-sm transition ${cycle === "month" ? "bg-green-500 text-black font-medium" : "text-gray-400 hover:text-white"}`}>Mensal</button>
            <button onClick={() => setCycle("year")} className={`px-5 py-1.5 rounded-full text-sm transition flex items-center gap-1.5 ${cycle === "year" ? "bg-green-500 text-black font-medium" : "text-gray-400 hover:text-white"}`}>
              Anual <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">−20%</span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => {
            const price = cycle === "year" ? p.price_year : p.price_month
            const free = p.slug === "inicial"
            return (
              <div key={p.slug}
                className={`relative rounded-2xl border p-6 flex flex-col ${p.highlighted ? "border-green-500/50 bg-gradient-to-b from-green-500/[0.07] to-transparent shadow-[0_0_50px_-12px_rgba(34,197,94,0.4)]" : "border-gray-800 bg-gray-950"}`}>
                {p.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-medium px-3 py-1 rounded-full bg-green-500 text-black">Mais popular</span>}
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-bold text-white">{free ? "R$ 0" : brl(cycle === "year" ? Math.round(price / 12) : price)}</span>
                  {!free && <span className="text-gray-500 text-sm mb-1">/mês</span>}
                </div>
                {!free && cycle === "year" && <p className="text-xs text-gray-500 mt-1">{brl(price)}/ano</p>}
                {free && <p className="text-xs text-gray-500 mt-1">7 dias grátis no nível Pro</p>}
                <a href="/login" className={`mt-5 w-full py-2.5 rounded-lg text-sm font-medium transition text-center ${p.highlighted ? "bg-green-500 text-black hover:bg-green-400" : "bg-white/10 text-white hover:bg-white/20"}`}>
                  {free ? "Começar grátis" : "Assinar"}
                </a>
                <ul className="mt-6 space-y-2.5 text-sm flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-gray-300">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-600">Pagamento seguro via Stripe · Nota fiscal automática · Garantia de reembolso de 7 dias</p>
      </div>
    </section>
  )
}
