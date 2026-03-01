'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { CART_UPDATED_EVENT, emitCartOpen, readCart } from '@/lib/cartStorage'

type CartDrawerIconTriggerProps = {
  children: ReactNode
  className?: string
  ariaLabel: string
  badgeClassName?: string
}

export function CartDrawerIconTrigger({
  children,
  className,
  ariaLabel,
  badgeClassName,
}: CartDrawerIconTriggerProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const syncCount = () => {
      const total = readCart().reduce((sum, item) => sum + item.quantity, 0)
      setCount(total)
    }

    syncCount()
    window.addEventListener(CART_UPDATED_EVENT, syncCount)
    window.addEventListener('storage', syncCount)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCount)
      window.removeEventListener('storage', syncCount)
    }
  }, [])

  const badgeLabel = useMemo(() => (count > 99 ? '99+' : String(count)), [count])

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        emitCartOpen()
      }}
    >
      {children}
      {count > 0 ? <span className={badgeClassName}>{badgeLabel}</span> : null}
    </button>
  )
}
