"use client"

import { useEffect, useRef, useState } from "react"

// ---------------------------------------------------------------------------
// TVA Background — Sacred Timeline visual effect
// Inspired by the Time Variance Authority aesthetic from Loki (Marvel)
// Uses Canvas + CSS animations — no copyrighted assets
// ---------------------------------------------------------------------------

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: "prune" | "spark" | "branch" | "dust"
}

interface Branch {
  x: number
  y: number
  angle: number
  length: number
  speed: number
  width: number
  color: string
  alpha: number
  children: Branch[]
  drawn: number
  maxLength: number
}

const TVA_COLORS = {
  amber:      "#f59e0b",
  amberLight: "#fbbf24",
  amberDim:   "#78350f",
  green:      "#22c55e",
  greenDim:   "#14532d",
  cyan:       "#06b6d4",
  orange:     "#ea580c",
  gold:       "#d97706",
  purple:     "#7c3aed",
}

const TVA_LABELS = [
  "VARIANT DETECTED",
  "TIMELINE BRANCH",
  "NEXUS EVENT",
  "SACRED TIMELINE",
  "TEMPORAL RESET",
  "TVA AUTHORIZED",
  "PRUNING CHARGE",
  "TIME VARIANCE",
  "NEXUS VARIANT",
  "TIMELINE INTACT",
  "RESET CHARGE",
  "ANALYST ON DUTY",
  "MISS MINUTES",
  "HE WHO REMAINS",
  "END OF TIME",
  "git commit --past",
  "GIT_AUTHOR_DATE",
  "RETROACTIVE",
  "PAST RESTORED",
]

// ── Floating label ──────────────────────────────────────────────────────────
interface FloatingLabel {
  id: number
  text: string
  x: number
  y: number
  opacity: number
  speed: number
  fontSize: number
  color: string
  delay: number
  born: number
}

export default function TvaBackground({ className = "" }: { className?: string }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const frameRef     = useRef<number>(0)
  const tickRef      = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const labelsRef    = useRef<FloatingLabel[]>([])
  const labelIdRef   = useRef(0)

  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Resize
    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // ── Spawn particle ──────────────────────────────────────────────────────
    const spawnParticle = (type: Particle["type"]) => {
      const w = canvas.width
      const h = canvas.height
      const colors = [TVA_COLORS.amber, TVA_COLORS.amberLight, TVA_COLORS.green, TVA_COLORS.cyan, TVA_COLORS.gold]
      particlesRef.current.push({
        x: Math.random() * w,
        y: type === "prune" ? -10 : Math.random() * h,
        vx: (Math.random() - 0.5) * 1.2,
        vy: type === "prune" ? Math.random() * 2 + 1 : (Math.random() - 0.5) * 0.8,
        life: 0,
        maxLife: 180 + Math.random() * 120,
        size: type === "spark" ? Math.random() * 2 + 0.5
              : type === "dust"  ? Math.random() * 3 + 1
              : Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        type,
      })
    }

    // ── Spawn floating label ────────────────────────────────────────────────
    const spawnLabel = () => {
      const w = canvas.width
      const h = canvas.height
      const text  = TVA_LABELS[Math.floor(Math.random() * TVA_LABELS.length)]
      const color = Math.random() > 0.5 ? TVA_COLORS.amber : Math.random() > 0.5 ? TVA_COLORS.green : TVA_COLORS.amberLight
      labelsRef.current.push({
        id: labelIdRef.current++,
        text,
        x: Math.random() * (w - 200) + 10,
        y: h + 20,
        opacity: 0,
        speed: 0.2 + Math.random() * 0.4,
        fontSize: 9 + Math.floor(Math.random() * 7),
        color,
        delay: Math.random() * 60,
        born: tickRef.current,
      })
    }

    // ── Draw Sacred Timeline (horizontal branching river) ──────────────────
    const drawTimeline = (t: number) => {
      const w = canvas.width
      const h = canvas.height
      const cy = h * 0.5

      // Main spine
      const gradient = ctx.createLinearGradient(0, cy, w, cy)
      gradient.addColorStop(0,    "rgba(245,158,11,0)")
      gradient.addColorStop(0.15, "rgba(245,158,11,0.5)")
      gradient.addColorStop(0.5,  "rgba(251,191,36,0.8)")
      gradient.addColorStop(0.85, "rgba(245,158,11,0.5)")
      gradient.addColorStop(1,    "rgba(245,158,11,0)")

      ctx.save()
      ctx.lineWidth = 2
      ctx.strokeStyle = gradient
      ctx.shadowColor = TVA_COLORS.amber
      ctx.shadowBlur  = 12
      ctx.beginPath()
      ctx.moveTo(0, cy)

      // Animated sine path
      for (let x = 0; x <= w; x += 4) {
        const y = cy + Math.sin(x * 0.012 + t * 0.5) * 8 + Math.sin(x * 0.025 + t * 0.3) * 4
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()

      // Branch lines spawning off the spine
      const numBranches = 6
      for (let i = 0; i < numBranches; i++) {
        const progress = (i / numBranches + t * 0.015) % 1
        const bx = progress * w
        const by = cy + Math.sin(bx * 0.012 + t * 0.5) * 8
        const angle = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 5 + Math.sin(t * 0.7 + i) * 0.2)
        const len = 40 + Math.sin(t * 0.9 + i * 1.5) * 20
        const alpha = 0.15 + Math.sin(t * 0.4 + i) * 0.1

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.lineWidth = 1
        ctx.strokeStyle = i % 3 === 0 ? TVA_COLORS.cyan : TVA_COLORS.amber
        ctx.shadowColor = i % 3 === 0 ? TVA_COLORS.cyan : TVA_COLORS.amber
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(bx + Math.cos(angle) * len, by + Math.sin(angle) * len)
        ctx.stroke()
        ctx.restore()
      }
    }

    // ── Draw scan lines (CRT retro effect) ─────────────────────────────────
    const drawScanlines = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.save()
      ctx.globalAlpha = 0.035
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = "#000"
        ctx.fillRect(0, y, w, 1)
      }
      ctx.restore()
    }

    // ── Draw vignette ──────────────────────────────────────────────────────
    const drawVignette = () => {
      const w = canvas.width
      const h = canvas.height
      const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85)
      grad.addColorStop(0, "rgba(0,0,0,0)")
      grad.addColorStop(1, "rgba(0,0,0,0.7)")
      ctx.save()
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }

    // ── Draw clock gears (decorative) ─────────────────────────────────────
    const drawGear = (cx: number, cy: number, r: number, teeth: number, t: number, alpha: number, clockwise: boolean) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.strokeStyle = TVA_COLORS.amberDim
      ctx.lineWidth = 1
      ctx.translate(cx, cy)
      ctx.rotate((clockwise ? 1 : -1) * t * 0.3)

      // Outer ring
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.stroke()

      // Inner ring
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2)
      ctx.stroke()

      // Teeth
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2
        const x1 = Math.cos(a) * r
        const y1 = Math.sin(a) * r
        const x2 = Math.cos(a) * (r + 5)
        const y2 = Math.sin(a) * (r + 5)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Spokes
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55)
        ctx.stroke()
      }

      ctx.restore()
    }

    // ── Draw pruning arc (orange bolt) ─────────────────────────────────────
    let pruneTimer = 0
    let pruneActive = false
    let pruneX = 0
    let pruneProgress = 0

    const triggerPrune = () => {
      pruneActive = true
      pruneX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1
      pruneProgress = 0
    }

    const drawPruneEffect = () => {
      if (!pruneActive) return
      const h = canvas.height
      pruneProgress += 0.04

      ctx.save()
      ctx.globalAlpha = Math.sin(pruneProgress * Math.PI) * 0.7
      ctx.strokeStyle = TVA_COLORS.orange
      ctx.lineWidth = 2
      ctx.shadowColor = TVA_COLORS.orange
      ctx.shadowBlur = 20

      // Lightning bolt from top to bottom
      ctx.beginPath()
      ctx.moveTo(pruneX, 0)
      let py = 0
      while (py < h) {
        const step = 15 + Math.random() * 20
        py += step
        const nx = pruneX + (Math.random() - 0.5) * 30
        ctx.lineTo(nx, py)
      }
      ctx.stroke()
      ctx.restore()

      // Spawn sparks
      for (let i = 0; i < 3; i++) spawnParticle("spark")

      if (pruneProgress >= 1) {
        pruneActive = false
        pruneProgress = 0
      }
    }

    // ── Update & draw particles ────────────────────────────────────────────
    const updateParticles = () => {
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife)
      particlesRef.current.forEach(p => {
        p.life++
        p.x += p.vx
        p.y += p.vy
        const alpha = p.life < 30
          ? p.life / 30
          : 1 - (p.life - p.maxLife * 0.7) / (p.maxLife * 0.3)

        ctx.save()
        ctx.globalAlpha = Math.max(0, alpha) * 0.6
        ctx.fillStyle   = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur  = p.type === "prune" ? 6 : 3
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.1, p.size * (1 - p.life / p.maxLife * 0.5)), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
    }

    // ── Update & draw floating labels ──────────────────────────────────────
    const updateLabels = () => {
      const MAX_LABELS = 12
      labelsRef.current = labelsRef.current.filter(l => l.y > -30 && l.opacity >= 0)

      labelsRef.current.forEach(l => {
        const age = tickRef.current - l.born
        if (age < l.delay) return

        l.y -= l.speed
        const lifespan = 300
        const realAge  = age - l.delay
        l.opacity = realAge < 40
          ? realAge / 40
          : realAge > lifespan
            ? 1 - (realAge - lifespan) / 60
            : 0.35 + Math.sin(realAge * 0.05) * 0.05

        if (l.opacity <= 0) return

        ctx.save()
        ctx.globalAlpha = Math.max(0, l.opacity)
        ctx.font        = `${l.fontSize}px monospace`
        ctx.fillStyle   = l.color
        ctx.shadowColor = l.color
        ctx.shadowBlur  = 4
        ctx.fillText(l.text, l.x, l.y)
        ctx.restore()
      })

      if (labelsRef.current.length < MAX_LABELS && Math.random() < 0.015) {
        spawnLabel()
      }
    }

    // ── Corner ornament ────────────────────────────────────────────────────
    const drawCornerOrnament = (x: number, y: number, flip: boolean) => {
      ctx.save()
      ctx.globalAlpha = 0.12
      ctx.strokeStyle = TVA_COLORS.amber
      ctx.lineWidth = 1
      const s = 40
      ctx.translate(x, y)
      if (flip) ctx.scale(-1, -1)
      ctx.beginPath()
      ctx.moveTo(0, s)
      ctx.lineTo(0, 0)
      ctx.lineTo(s, 0)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(10, s - 10)
      ctx.lineTo(10, 10)
      ctx.lineTo(s - 10, 10)
      ctx.stroke()
      ctx.restore()
    }

    // ── Amber ambient glow at center ───────────────────────────────────────
    const drawAmbientGlow = (t: number) => {
      const w = canvas.width
      const h = canvas.height
      const pulse = 0.08 + Math.sin(t * 0.4) * 0.03
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5)
      grad.addColorStop(0,    `rgba(245,158,11,${pulse})`)
      grad.addColorStop(0.4,  `rgba(234,88,12,${pulse * 0.4})`)
      grad.addColorStop(1,    "rgba(0,0,0,0)")
      ctx.save()
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }

    // ── "MISS MINUTES" clock ────────────────────────────────────────────────
    const drawAnalogClock = (t: number) => {
      const w   = canvas.width
      const h   = canvas.height
      const cx  = w - 80
      const cy  = 80
      const r   = 40
      const now = new Date()

      ctx.save()
      ctx.globalAlpha = 0.18

      // Face
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = TVA_COLORS.amber
      ctx.lineWidth = 1.5
      ctx.shadowColor = TVA_COLORS.amber
      ctx.shadowBlur  = 8
      ctx.stroke()

      // Hour hand
      const hAngle = ((now.getHours() % 12) / 12 + now.getMinutes() / 720) * Math.PI * 2 - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(hAngle) * r * 0.5, cy + Math.sin(hAngle) * r * 0.5)
      ctx.lineWidth = 2
      ctx.stroke()

      // Minute hand
      const mAngle = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(mAngle) * r * 0.75, cy + Math.sin(mAngle) * r * 0.75)
      ctx.lineWidth = 1
      ctx.stroke()

      // Second hand (green)
      const sAngle = ((now.getSeconds() + t % 1) / 60) * Math.PI * 2 - Math.PI / 2
      ctx.strokeStyle = TVA_COLORS.green
      ctx.shadowColor = TVA_COLORS.green
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(sAngle) * r * 0.85, cy + Math.sin(sAngle) * r * 0.85)
      ctx.lineWidth = 1
      ctx.stroke()

      // Center dot
      ctx.beginPath()
      ctx.arc(cx, cy, 2, 0, Math.PI * 2)
      ctx.fillStyle = TVA_COLORS.amberLight
      ctx.fill()

      // "TVA" label below clock
      ctx.font = "8px monospace"
      ctx.fillStyle = TVA_COLORS.amber
      ctx.globalAlpha = 0.2
      ctx.textAlign = "center"
      ctx.fillText("TVA", cx, cy + r + 12)
      ctx.restore()
    }

    // ── Hexagonal grid (TVA floor) ──────────────────────────────────────────
    const drawHexGrid = (t: number) => {
      const w  = canvas.width
      const h  = canvas.height
      const s  = 25
      const rows = Math.ceil(h / (s * 1.5)) + 1
      const cols = Math.ceil(w / (s * Math.sqrt(3))) + 1

      ctx.save()
      ctx.globalAlpha = 0.04
      ctx.strokeStyle = TVA_COLORS.amber
      ctx.lineWidth   = 0.5

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const offsetX = row % 2 === 0 ? 0 : s * Math.sqrt(3) / 2
          const cx = col * s * Math.sqrt(3) + offsetX
          const cy = row * s * 1.5
          const pulse = Math.sin(t * 0.5 + cx * 0.05 + cy * 0.05) * 0.5 + 0.5
          ctx.globalAlpha = 0.02 + pulse * 0.04

          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 6
            const px = cx + Math.cos(a) * s
            const py = cy + Math.sin(a) * s
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.stroke()
        }
      }
      ctx.restore()
    }

    // ── Main render loop ──────────────────────────────────────────────────
    const render = (ts: number) => {
      tickRef.current++
      const t = ts / 1000
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      // Layer 0: hex background
      drawHexGrid(t)

      // Layer 1: ambient glow
      drawAmbientGlow(t)

      // Layer 2: sacred timeline
      drawTimeline(t)

      // Layer 3: gears (corners)
      drawGear(60,  60,  30, 12, t, 0.12, true)
      drawGear(w - 60, h - 60, 25, 10, t, 0.10, false)
      drawGear(w - 60, 60,  20, 8,  t, 0.08, true)

      // Layer 4: corner ornaments
      drawCornerOrnament(10, 10, false)
      drawCornerOrnament(w - 10, h - 10, true)

      // Layer 5: clock
      drawAnalogClock(t)

      // Layer 6: prune effect
      pruneTimer++
      if (pruneTimer > 220 + Math.random() * 180) {
        triggerPrune()
        pruneTimer = 0
      }
      drawPruneEffect()

      // Layer 7: particles
      if (Math.random() < 0.12) spawnParticle("dust")
      if (Math.random() < 0.04) spawnParticle("branch")
      updateParticles()

      // Layer 8: floating labels
      updateLabels()

      // Layer 9: scanlines
      drawScanlines()

      // Layer 10: vignette (darkens edges)
      drawVignette()

      frameRef.current = requestAnimationFrame(render)
    }

    frameRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  )
}
