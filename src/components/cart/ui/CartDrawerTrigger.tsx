'use client'

import type { ReactNode } from 'react'
import { emitCartOpen } from '@/lib/cartStorage'

export function CartDrawerTrigger({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel || 'Carrello'}
      onClick={() => {
        emitCartOpen()
      }}
    >
      {children}
    </button>
  )
}
