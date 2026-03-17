import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import PwaRegister from '@/components/pwa-register'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

const siteUrl = 'https://commitforge.vercel.app'
const siteName = 'CommitForge'
const siteDescription =
  'CommitForge é uma CLI open-source para criar commits retroativos no Git com datas do passado. Suporta GitHub, GitLab e Bitbucket. Controle total do histórico git — preencha sua grade de contribuições, registre projetos antigos e automatize múltiplos repositórios.'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CommitForge — CLI para Commits Retroativos no Git',
    template: '%s | CommitForge',
  },
  description: siteDescription,
  keywords: [
    'git commits retroativos',
    'backdate git commits',
    'commitforge',
    'preencher grade github',
    'github contribution graph',
    'git histórico',
    'commits passado',
    'cli git python',
    'automatizar commits',
    'github commits antigos',
    'git date override',
    'GIT_AUTHOR_DATE',
    'github activity',
    'estevam souza',
  ],
  authors: [{ name: 'Estevam Souza', url: 'https://github.com/estevam5s' }],
  creator: 'Estevam Souza',
  publisher: 'CommitForge',
  generator: 'Next.js',
  applicationName: siteName,
  referrer: 'origin-when-cross-origin',
  category: 'technology',
  classification: 'Developer Tools',

  // ── Open Graph ──────────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName,
    title: 'CommitForge — CLI para Commits Retroativos no Git',
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'CommitForge — CLI para Commits Retroativos no Git',
        type: 'image/png',
      },
      {
        url: `${siteUrl}/sistema-icon.png`,
        width: 512,
        height: 512,
        alt: 'CommitForge Logo',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter / X Card ───────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'CommitForge — CLI para Commits Retroativos no Git',
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: '@estevam5s',
    site: '@commitforge',
  },

  // ── Icons ──────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/sistema-icon.png', type: 'image/png' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/sistema-icon.png',
    apple: [
      { url: '/sistema-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icon.svg', color: '#22c55e' },
    ],
  },

  // ── PWA Manifest ──────────────────────────────────────────────────
  manifest: '/manifest.json',

  // ── Robots / Indexing ─────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Canonical / Alternates ────────────────────────────────────────
  alternates: {
    canonical: siteUrl,
    languages: {
      'pt-BR': siteUrl,
    },
  },

  // ── Verification ─────────────────────────────────────────────────
  verification: {
    google: 'commitforge-google-site-verification',
  },
}

// ── JSON-LD Structured Data ──────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CommitForge',
  description: siteDescription,
  url: siteUrl,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'macOS, Linux, Windows',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
  },
  author: {
    '@type': 'Person',
    name: 'Estevam Souza',
    url: 'https://github.com/estevam5s',
  },
  softwareVersion: '3.0.0',
  license: 'https://opensource.org/licenses/MIT',
  codeRepository: 'https://github.com/estevam5s/commitforge',
  keywords: 'git, commits, retroativos, github, cli, python, histórico',
  image: `${siteUrl}/sistema-icon.png`,
  screenshot: `${siteUrl}/og-image.png`,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CommitForge" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-TileImage" content="/sistema-icon.png" />
        <link rel="apple-touch-icon" href="/sistema-icon.png" />
        <link rel="apple-touch-startup-image" href="/sistema-icon.png" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <PwaRegister />
      </body>
    </html>
  )
}
