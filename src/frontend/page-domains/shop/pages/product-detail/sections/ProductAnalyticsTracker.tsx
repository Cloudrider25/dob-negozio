'use client'

import { useEffect, useRef } from 'react'

import { computeAnalyticsValue, toAnalyticsItem } from '@/lib/frontend/analytics/ecommerce'
import { trackEvent } from '@/lib/frontend/analytics/gtag'

type ProductAnalyticsTrackerProps = {
  product: {
    id: string
    title: string
    brand?: string
    format?: string
    price?: number
    currency?: string
  }
}

export function ProductAnalyticsTracker({ product }: ProductAnalyticsTrackerProps) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) return

    const item = toAnalyticsItem(
      {
        id: product.id,
        title: product.title,
        brand: product.brand,
        format: product.format,
        price: product.price,
        quantity: 1,
        currency: product.currency,
      },
      0,
    )

    trackEvent('view_item', {
      currency: product.currency || 'EUR',
      value: computeAnalyticsValue([{ price: product.price, quantity: 1 }], product.price ?? 0),
      items: [item],
    })

    trackedRef.current = true
  }, [product])

  return null
}
