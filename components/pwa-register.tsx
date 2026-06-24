"use client"

import { useEffect } from "react"

export default function PwaRegister() {
  useEffect(() => {
    // O service worker anterior cacheava um bundle antigo (com URL de Supabase
    // inválida). Por isso, em vez de registrar, removemos qualquer SW existente
    // e limpamos todos os caches — garantindo sempre os assets mais novos.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {})
    }
    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {})
    }
  }, [])

  return null
}
