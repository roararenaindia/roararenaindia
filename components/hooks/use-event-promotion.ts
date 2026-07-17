'use client'

import { useEffect, useState } from 'react'
import { EVENT_PROMOTION_END_ISO, isEventPromotionActive } from '@/lib/config/event-promotion'

export function useEventPromotionActive() {
  const [isActive, setIsActive] = useState(() => isEventPromotionActive())

  useEffect(() => {
    const refreshPromotion = () => setIsActive(isEventPromotionActive())
    const cutoffDelay = Math.max(0, Date.parse(EVENT_PROMOTION_END_ISO) - Date.now()) + 1000
    const cutoffTimer = window.setTimeout(refreshPromotion, cutoffDelay)
    const interval = window.setInterval(refreshPromotion, 60_000)

    refreshPromotion()

    return () => {
      window.clearTimeout(cutoffTimer)
      window.clearInterval(interval)
    }
  }, [])

  return isActive
}
