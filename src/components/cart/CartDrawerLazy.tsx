'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { CART_OPEN_EVENT, consumeCartOpenRequest } from '@/lib/cartStorage'

const CartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then((module) => module.CartDrawer),
  {
    ssr: false,
  },
)

export function CartDrawerLazy({ locale }: { locale: string }) {
  const [enabled, setEnabled] = useState(false)
  const [openOnMount, setOpenOnMount] = useState(false)

  useEffect(() => {
    if (consumeCartOpenRequest()) {
      setOpenOnMount(true)
      setEnabled(true)
    }

    const handleOpen = () => {
      setOpenOnMount(true)
      setEnabled(true)
    }

    window.addEventListener(CART_OPEN_EVENT, handleOpen)
    return () => {
      window.removeEventListener(CART_OPEN_EVENT, handleOpen)
    }
  }, [])

  if (!enabled) return null

  return <CartDrawer locale={locale} initialOpen={openOnMount} />
}
