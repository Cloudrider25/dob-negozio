'use client'

import { useEffect, useState } from 'react'

import { fetchShippingQuote } from '@/components/checkout/client-api/shipping'
import type { CustomerSnapshot, ShippingOption } from '@/components/checkout/shared/contracts'

export const useShippingQuote = ({
  formState,
  requiresShippingAddress,
  isShippingAddressComplete,
  itemsCount,
  productSubtotal,
}: {
  formState: CustomerSnapshot
  requiresShippingAddress: boolean
  isShippingAddressComplete: boolean
  itemsCount: number
  productSubtotal: number
}) => {
  const [shippingAmount, setShippingAmount] = useState<number | null>(null)
  const [shippingCurrency, setShippingCurrency] = useState('EUR')
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShippingOptionID, setSelectedShippingOptionID] = useState<string | null>(null)

  useEffect(() => {
    if (!requiresShippingAddress || !isShippingAddressComplete || itemsCount === 0 || productSubtotal <= 0) {
      setShippingAmount(null)
      setShippingLoading(false)
      setShippingOptions([])
      setSelectedShippingOptionID(null)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        setShippingLoading(true)
        const quote = await fetchShippingQuote({
          shippingAddress: {
            address: formState.address,
            city: formState.city,
            province: formState.province,
            postalCode: formState.postalCode,
          },
          subtotal: productSubtotal,
          signal: controller.signal,
        })

        if (!quote) {
          setShippingAmount(null)
          setShippingOptions([])
          setSelectedShippingOptionID(null)
          return
        }

        setShippingAmount(quote.amount)
        setShippingCurrency(quote.currency)
        const methods = quote.methods
        setShippingOptions(methods)
        setSelectedShippingOptionID((previous) => {
          if (previous && methods.some((method) => method.id === previous)) return previous
          return methods[0]?.id ?? null
        })
      } catch {
        if (!controller.signal.aborted) {
          setShippingAmount(null)
          setShippingOptions([])
          setSelectedShippingOptionID(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setShippingLoading(false)
        }
      }
    }, 400)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [
    formState.address,
    formState.city,
    formState.postalCode,
    formState.province,
    isShippingAddressComplete,
    itemsCount,
    productSubtotal,
    requiresShippingAddress,
  ])

  return {
    shippingAmount,
    shippingCurrency,
    shippingLoading,
    shippingOptions,
    selectedShippingOptionID,
    setSelectedShippingOptionID,
  }
}
