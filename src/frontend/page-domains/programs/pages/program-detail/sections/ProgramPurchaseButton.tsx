'use client'

import { Button } from '@/frontend/components/ui/primitives/button'
import { emitCartOpen, emitCartUpdated, readCart, writeCart } from '@/lib/frontend/cart/storage'

type ProgramPurchaseButtonProps = {
  program: {
    id: string
    title: string
    slug?: string
    price?: number
    coverImage?: string | null
  }
  buttonLabel: string
  className?: string
}

export function ProgramPurchaseButton({
  program,
  buttonLabel,
  className,
}: ProgramPurchaseButtonProps) {
  const handleAddToCart = () => {
    if (typeof window === 'undefined') return

    const items = readCart()
    const cartItem = {
      id: `${program.id}:program:default`,
      title: program.title,
      slug: program.slug,
      price: program.price,
      currency: 'EUR',
      coverImage: program.coverImage ?? null,
      quantity: 1,
    }

    const existing = items.find((item) => item.id === cartItem.id)
    if (existing) {
      existing.quantity += 1
      if (!existing.coverImage && cartItem.coverImage) {
        existing.coverImage = cartItem.coverImage
      }
      if (typeof cartItem.price === 'number') existing.price = cartItem.price
      if (!existing.slug && cartItem.slug) existing.slug = cartItem.slug
    } else {
      items.push(cartItem)
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
      size="sm"
      className={className}
    >
      {buttonLabel}
    </Button>
  )
}
