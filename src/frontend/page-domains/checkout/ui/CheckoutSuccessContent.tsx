'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { Locale } from '@/lib/i18n/core'
import { getJourneyDictionary } from '@/lib/i18n/core'
import { consumePendingPurchase } from '@/lib/frontend/analytics/ecommerce'
import { trackEvent } from '@/lib/frontend/analytics/gtag'

type CheckoutSuccessContentProps = {
  locale: Locale
  initialOrder: string
  attemptId: string
  paymentIntentId: string
}

export function CheckoutSuccessContent({
  locale,
  initialOrder,
  attemptId,
  paymentIntentId,
}: CheckoutSuccessContentProps) {
  const copy = getJourneyDictionary(locale).checkoutSuccess
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    if (order || !attemptId) return

    let cancelled = false
    let retryTimeout: ReturnType<typeof setTimeout> | null = null

    const resolveAttempt = async () => {
      setResolving(true)

      try {
        const response = await fetch('/api/shop/checkout/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attemptId,
            ...(paymentIntentId ? { paymentIntentId } : {}),
            locale,
          }),
        })

        if (!response.ok) {
          if (response.status !== 409) return
          retryTimeout = setTimeout(() => {
            if (!cancelled) {
              void resolveAttempt()
            }
          }, 3000)
          return
        }

        const data = (await response.json()) as {
          orderNumber?: string
          orderId?: string | number
        }

        if (cancelled) return

        const resolvedOrder =
          (typeof data.orderNumber === 'string' && data.orderNumber) ||
          (data.orderId ? String(data.orderId) : '')

        if (!resolvedOrder) return

        setOrder(resolvedOrder)
        router.replace(`/${locale}/checkout/success?order=${encodeURIComponent(resolvedOrder)}`)
      } finally {
        if (!cancelled) {
          setResolving(false)
        }
      }
    }

    void resolveAttempt()

    return () => {
      cancelled = true
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [attemptId, locale, order, paymentIntentId, router])

  useEffect(() => {
    const matchId = order || paymentIntentId || attemptId
    if (!matchId) return

    const pendingPurchase = consumePendingPurchase(matchId)
    if (!pendingPurchase) return

    trackEvent('purchase', {
      transaction_id: pendingPurchase.transactionId,
      value: pendingPurchase.value,
      currency: pendingPurchase.currency,
      items: pendingPurchase.items,
    })
  }, [attemptId, order, paymentIntentId])

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 py-20">
      <div className="rounded-2xl border border-stroke bg-white p-8 text-center shadow-sm">
        <p className="typo-caption-upper text-text-muted">{copy.orderCompleted}</p>
        <h1 className="mt-3 typo-h1 text-text-primary">{copy.thankYou}</h1>
        <p className="mt-4 text-text-secondary">{copy.processingOrder}</p>
        {order ? (
          <p className="mt-2 text-sm text-text-muted">
            {copy.orderReference}: <strong>{order}</strong>
          </p>
        ) : resolving ? (
          <p className="mt-2 text-sm text-text-muted">Stiamo finalizzando il tuo ordine...</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/shop`}
            className="rounded-full border border-stroke px-5 py-2 text-sm text-text-primary"
          >
            {copy.backToShop}
          </Link>
          <Link
            href={`/${locale}`}
            className="rounded-full bg-accent-cyan px-5 py-2 text-sm text-text-inverse"
          >
            {copy.goHome}
          </Link>
        </div>
      </div>
    </main>
  )
}
