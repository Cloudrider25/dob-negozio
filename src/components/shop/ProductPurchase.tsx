'use client'

import { useMemo, useState } from 'react'

type CartItem = {
  id: string
  title: string
  slug?: string
  price?: number
  currency?: string
  brand?: string
  coverImage?: string | null
  quantity: number
}

const CART_STORAGE_KEY = 'dob:cart'

export function ProductPurchase({
  product,
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
  className?: string
  buttonLabel?: string
}) {
  const [qty, setQty] = useState(1)

  const priceLabel = useMemo(() => {
    if (typeof product.price !== 'number') return null
    return `${product.currency ?? '€'} ${product.price.toFixed(2)}`
  }, [product.currency, product.price])

  const handleAddToCart = () => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    const items: CartItem[] = raw ? (JSON.parse(raw) as CartItem[]) : []
    const existing = items.find((item) => item.id === product.id)
    if (existing) {
      existing.quantity += qty
    } else {
      items.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        currency: product.currency,
        brand: product.brand,
        coverImage: product.coverImage ?? null,
        quantity: qty,
      })
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event('dob:cart-updated'))
    window.dispatchEvent(new Event('dob:cart-open'))
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
        {buttonLabel || 'Aggiungi al carrello'}
      </button>
    </div>
  )
}
