'use client'

import type { ReactNode } from 'react'

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
        if (typeof window === 'undefined') return
        window.dispatchEvent(new Event('dob:cart-open'))
      }}
    >
      {children}
    </button>
  )
}
