// CommitForge Service Worker v3.0.0
const CACHE_NAME = 'commitforge-v3'
const STATIC_ASSETS = [
  '/',
  '/docs',
  '/git',
  '/manifest.json',
  '/sistema-icon.png',
  '/sistema.png',
  '/og-image.png',
]

// ── Install ─────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map((url) => new Request(url, { cache: 'reload' })))
        .catch(() => {
          // Silently fail for assets that don't exist yet
        })
    })
  )
  self.skipWaiting()
})

// ── Activate ────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch — Network First, fallback to Cache ────────────────────────
self.addEventListener('fetch', (event) => {
  // Skip non-GET and cross-origin
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return
  // Skip Next.js dev server hot-reload
  if (event.request.url.includes('_next/webpack-hmr')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        // Offline fallback
        caches.match(event.request).then((cached) => {
          if (cached) return cached
          // Return offline page for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/')
          }
          return new Response('Offline', { status: 503 })
        })
      )
  )
})
