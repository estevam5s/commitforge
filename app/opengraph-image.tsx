import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'CommitForge — CLI para Commits Retroativos no Git'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 300,
            background: 'radial-gradient(ellipse, rgba(34,197,94,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Terminal dots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#facc15' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#22c55e' }} />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-2px',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          CommitForge
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#22c55e',
            marginBottom: 40,
            textAlign: 'center',
            letterSpacing: '1px',
          }}
        >
          CLI para Commits Retroativos no Git
        </div>

        {/* Code snippet */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#111111',
            border: '1px solid #374151',
            borderRadius: 8,
            padding: '14px 28px',
            fontSize: 22,
            color: '#9ca3af',
          }}
        >
          <span style={{ color: '#22c55e' }}>$</span>
          <span>python forge.py commit --repo URL --year 2020</span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            display: 'flex',
            gap: 32,
            fontSize: 18,
            color: '#4b5563',
          }}
        >
          <span>GitHub</span>
          <span>·</span>
          <span>GitLab</span>
          <span>·</span>
          <span>Bitbucket</span>
          <span>·</span>
          <span>commitforge.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
