'use client'

import { useEffect, useState } from 'react'

import { fetchCheckoutRecommendations } from '@/components/checkout/client-api/recommendations'
import type { RecommendedProduct } from '@/components/checkout/shared/contracts'
import type { CartItem } from '@/lib/cartStorage'

export const useCheckoutRecommendations = ({
  items,
  locale,
}: {
  items: CartItem[]
  locale: string
}) => {
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      setRecommended([])
      setRecommendedLoading(false)
      return
    }

    const seedId = Number(items[0]?.id)
    if (!Number.isFinite(seedId)) {
      setRecommended([])
      return
    }

    const controller = new AbortController()

    const run = async () => {
      try {
        setRecommendedLoading(true)
        const next = await fetchCheckoutRecommendations({
          seedProductId: seedId,
          locale,
          excludeIds: items.map((item) => item.id),
          signal: controller.signal,
        })
        setRecommended(next)
      } catch {
        if (!controller.signal.aborted) {
          setRecommended([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setRecommendedLoading(false)
        }
      }
    }

    void run()
    return () => controller.abort()
  }, [items, locale])

  return {
    recommended,
    recommendedLoading,
  }
}
