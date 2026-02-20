'use client'

import { emitCartOpen, emitCartUpdated, readCart, writeCart } from '@/lib/cartStorage'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

type ProductPurchaseProduct = {
  id: string
  title: string
  slug?: string
  price?: number
  currency?: string
  brand?: string
  coverImage?: string | null
}

type ProductPurchaseProps = {
  product: ProductPurchaseProduct
  locale?: string
  className?: string
  buttonLabel?: string
}

export function ProductPurchase({
  product,
  locale,
  className,
  buttonLabel,
}: ProductPurchaseProps) {
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
    <Button
      type="button"
      onClick={handleAddToCart}
      interactive
      kind="main"
      size="md"
      className={className ?? 'w-full'}
    >
      {buttonLabel ?? copy.addToCart}
    </Button>
  )
}
