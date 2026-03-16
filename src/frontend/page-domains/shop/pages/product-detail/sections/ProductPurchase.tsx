'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { emitCartOpen, emitCartUpdated, readCart, writeCart } from '@/lib/frontend/cart/storage'
import { readWaitlist, writeWaitlist } from '@/lib/frontend/cart/storage'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n/core'
import { Button } from '@/frontend/components/ui/primitives/button'

type ProductPurchaseProduct = {
  id: string
  title: string
  slug?: string
  price?: number
  currency?: string
  brand?: string
  format?: string
  coverImage?: string | null
}

type ProductPurchaseProps = {
  product: ProductPurchaseProduct
  locale?: string
  className?: string
  buttonLabel?: string
  isOutOfStock?: boolean
}

export function ProductPurchase({
  product,
  locale,
  className,
  buttonLabel,
  isOutOfStock = false,
}: ProductPurchaseProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const resolvedLocale = locale && isLocale(locale) ? locale : defaultLocale
  const copy = getJourneyDictionary(resolvedLocale).shop
  const [pending, setPending] = useState(false)

  const handleAddToCart = () => {
    if (typeof window === 'undefined') return
    const items = readCart()
    const existing = items.find((item) => item.id === product.id)
    if (existing) {
      existing.quantity += 1
      if (!existing.coverImage && product.coverImage) {
        existing.coverImage = product.coverImage
      }
    } else {
      items.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        currency: product.currency,
        brand: product.brand,
        format: product.format,
        coverImage: product.coverImage ?? null,
        quantity: 1,
      })
    }
    writeCart(items)
    emitCartUpdated()
    emitCartOpen()
  }

  const handleAddToWaitlist = async () => {
    setPending(true)
    try {
      const response = await fetch('/api/shop/waitlist', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          locale: resolvedLocale,
        }),
      })

      if (response.status === 401) {
        const search = searchParams?.toString() ?? ''
        const redirectTarget = pathname
          ? `${pathname}${search ? `?${search}` : ''}`
          : `/${resolvedLocale}/shop/${product.slug ?? ''}`.replace(/\/+$/, '')
        router.push(`/${resolvedLocale}/signin?redirect=${encodeURIComponent(redirectTarget)}`)
        return
      }

      const data = (await response.json()) as {
        ok?: boolean
        available?: number
        item?: {
          id: string
          title: string
          slug?: string
          currency?: string
          brand?: string
          format?: string
          coverImage?: string | null
        }
      }

      if (response.status === 409 && typeof data.available === 'number' && data.available > 0) {
        handleAddToCart()
        return
      }

      if (!response.ok || !data.ok || !data.item) {
        return
      }

      const waitlist = readWaitlist()
      const existing = waitlist.find((item) => item.id === data.item?.id)
      if (!existing) {
        waitlist.push({
          ...data.item,
          registeredAt: new Date().toISOString(),
        })
        writeWaitlist(waitlist)
      }
      emitCartUpdated()
      emitCartOpen()
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={isOutOfStock ? handleAddToWaitlist : handleAddToCart}
      interactive
      kind="main"
      size="md"
      className={className ?? 'w-full'}
      disabled={pending}
    >
      {isOutOfStock ? copy.waitlist : buttonLabel ?? copy.addToCart}
    </Button>
  )
}
