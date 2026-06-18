'use client'

import { useEffect, useState } from 'react'
import { getHomePayload, type ArenaMatch, type ArenaSocialPost } from '@/lib/data/arena-live-data'
import type { ArenaPost } from '@/lib/config/site-data'

type PublicHomePayload = {
  generatedAt: string
  source: string
  database?: string
  heroMatch?: ArenaMatch
  matches?: ArenaMatch[]
  posts?: ArenaPost[] | ArenaSocialPost[]
  automationStatus?: ReadonlyArray<{ title: string; status: string; detail: string }>
}

const publicHomeRefreshIntervalMs = 5 * 60_000

export function usePublicHome() {
  const [data, setData] = useState<PublicHomePayload>(() => getHomePayload())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      if (document.visibilityState === 'hidden') return

      try {
        const response = await fetch('/api/public/home', { cache: 'no-store' })
        if (!response.ok) return
        const payload = await response.json()
        if (active) setData(payload)
      } catch {
        // Keep static fallback silently. The site should never break because automation is offline.
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    const interval = window.setInterval(load, publicHomeRefreshIntervalMs)
    document.addEventListener('visibilitychange', load)

    return () => {
      active = false
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', load)
    }
  }, [])

  return { data, isLoading }
}
