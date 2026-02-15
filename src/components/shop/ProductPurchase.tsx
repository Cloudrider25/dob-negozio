'use client'

import { emitCartOpen, emitCartUpdated, readCart, writeCart } from '@/lib/cartStorage'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n'

export function ProductPurchase({
  product,
  locale,
  className,
  buttonLabel,
}: {
  product: {
    id: string
    title: string
    slug?: string
    price?: number
    currency?: string
    brand?: string
    coverImage?: string | null
  }
  locale?: string
  className?: string
  buttonLabel?: string
}) {
  const resolvedLocale = locale && isLocale(locale) ? locale : defaultLocale
  const copy = getJourneyDictionary(resolvedLocale).shop

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
        coverImage: product.coverImage ?? null,
        quantity: 1,
      })
    }
    writeCart(items)
    emitCartUpdated()
    emitCartOpen()
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleAddToCart}
        className={
          className ||
          'button-base w-full px-6 py-3 font-medium bg-accent-cyan text-text-inverse border-transparent'
        }
      >
        {buttonLabel || copy.addToCart}
      </button>
    </div>
  )
}
