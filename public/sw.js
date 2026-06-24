// CommitForge Service Worker v4 — cache buster
// Versões anteriores cacheavam o bundle antigo (com URL de Supabase inválida).
// Este SW limpa TODOS os caches e deixa de interceptar requisições, garantindo
// que todo cliente recebe sempre os assets mais novos da rede.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // apaga qualquer cache antigo
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
      await self.clients.claim()
      // recarrega as abas abertas para pegar o bundle novo
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) {
        try { client.navigate(client.url) } catch (_) { /* noop */ }
      }
    })()
  )
})

// Sem handler de 'fetch': o navegador busca tudo direto da rede (sem cache do SW).
