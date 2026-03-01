'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { MediaThumb } from '@/components/shared/MediaThumb'
import { Minus, Plus, Trash } from '@/components/ui/icons'
import { defaultLocale, getJourneyDictionary, isLocale } from '@/lib/i18n'
import { isRemoteThumbnailSrc, normalizeThumbnailSrc } from '@/lib/media/thumbnail'
import {
  CART_UPDATED_EVENT,
  emitCartUpdated,
  readCart,
  writeCart,
  type CartItem,
} from '@/lib/cartStorage'

const formatPrice = (value: number, currency?: string) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency ?? 'EUR',
    minimumFractionDigits: 2,
  }).format(value)

export function CartPageClient({ locale }: { locale: string }) {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const copy = getJourneyDictionary(resolvedLocale).cartPage
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const load = () => {
      setItems(readCart())
    }
    load()
    window.addEventListener(CART_UPDATED_EVENT, load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, load)
      window.removeEventListener('storage', load)
    }
  }, [])

  const updateItems = (next: CartItem[]) => {
    setItems(next)
    if (typeof window !== 'undefined') {
      writeCart(next)
      emitCartUpdated()
    }
  }

  const increment = (id: string) => {
    updateItems(items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)))
  }

  const decrement = (id: string) => {
    updateItems(
      items
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: string) => {
    updateItems(items.filter((item) => item.id !== id))
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    [items],
  )

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between text-sm text-text-muted">
        <div className="flex items-center gap-2 typo-small-upper">
          <span>{copy.home}</span>
          <span>›</span>
          <span>{copy.cart}</span>
        </div>
        <Link
          href={`/${locale}/shop`}
          className="px-4 py-2 rounded-full border border-stroke text-text-primary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
        >
          {copy.returnToShopping}
        </Link>
      </div>

      <section className="space-y-4">
        <div className="grid grid-cols-[2.2fr_0.7fr_0.7fr_0.7fr_40px] typo-small-upper text-text-muted">
          <span>{copy.product}</span>
          <span>{copy.price}</span>
          <span>{copy.quantity}</span>
          <span>{copy.subtotal}</span>
          <span />
        </div>

        <div className="divide-y divide-stroke">
          {items.length === 0 && (
            <div className="py-12 text-center text-text-muted">{copy.empty}</div>
          )}
          {items.map((item) => {
            const rowSubtotal = (item.price ?? 0) * item.quantity
            return (
              <div
                key={item.id}
                className="grid grid-cols-[2.2fr_0.7fr_0.7fr_0.7fr_40px] items-center gap-4 py-6"
              >
                <div className="flex items-center gap-6">
                  <MediaThumb
                    src={normalizeThumbnailSrc(item.coverImage)}
                    alt={item.title}
                    sizes="112px"
                    className="relative h-28 w-28 rounded-lg bg-paper overflow-hidden"
                    imageClassName="object-contain"
                    fallback={<div className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--paper)_50%,transparent)]" />}
                    unoptimized={isRemoteThumbnailSrc(item.coverImage)}
                  />
                  <div>
                    <div className="text-base font-semibold text-text-primary">{item.title}</div>
                    {item.brand && <div className="text-xs text-text-muted">{item.brand}</div>}
                  </div>
                </div>
                <div className="text-sm text-text-primary">
                  {typeof item.price === 'number' ? formatPrice(item.price, item.currency) : '—'}
                </div>
                <div>
                  <div className="inline-flex items-center rounded-lg border border-stroke overflow-hidden">
                    <button
                      type="button"
                      onClick={() => decrement(item.id)}
                      className="px-2 py-2 text-text-primary hover:text-accent-cyan transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="px-4 py-2 text-sm text-text-muted min-w-[36px] text-center">
                      {item.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => increment(item.id)}
                      className="px-2 py-2 text-text-primary hover:text-accent-cyan transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-text-primary">
                  {typeof item.price === 'number' ? formatPrice(rowSubtotal, item.currency) : '—'}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-text-muted hover:text-accent-red transition-colors"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-10">
        <div className="space-y-6">
          <div className="text-center text-2xl font-semibold text-text-primary">
            {copy.completeOrder}
          </div>
          <div className="flex items-center justify-between typo-caption-upper text-text-muted">
            {[
              copy.steps.login,
              copy.steps.addresses,
              copy.steps.shipping,
              copy.steps.payment,
              copy.steps.confirmation,
            ].map((step, index) => (
              <div key={step} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    index === 0 ? 'bg-text-primary' : 'bg-stroke'
                  }`}
                />
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-stroke bg-paper p-6 space-y-4">
            <div className="text-lg font-semibold text-text-primary">
              {copy.guestBox.title}
            </div>
            <p className="text-sm text-text-secondary">
              {copy.guestBox.description}
            </p>
            <div className="text-sm text-text-muted">{copy.guestBox.selectOption}</div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[copy.guestBox.guest, copy.guestBox.login, copy.guestBox.register].map((label) => (
                <label
                  key={label}
                  className="flex items-center gap-3 rounded-lg border border-stroke px-4 py-3 cursor-pointer"
                >
                  <input type="radio" name="checkout" className="accent-black" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-stroke bg-paper p-6 space-y-4">
            <div className="text-lg font-semibold text-text-primary">{copy.discount.title}</div>
            <p className="text-sm text-text-muted">
              {copy.discount.description}
            </p>
            <div className="flex items-center gap-3">
              <input
                className="flex-1 rounded-lg border border-stroke px-3 py-2 bg-transparent"
                placeholder={copy.discount.placeholder}
              />
              <button className="px-4 py-2 rounded-lg bg-text-primary text-text-inverse">
                {copy.discount.apply}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-stroke bg-paper p-6 space-y-4">
            <div className="text-lg font-semibold text-text-primary">{copy.summary.title}</div>
            <div className="flex justify-between text-sm">
              <span>{copy.subtotal}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="text-xs text-text-muted">{copy.summary.taxesIncluded}</div>
            <div className="flex justify-between text-sm">
              <span>{copy.summary.shipping}</span>
              <span>{formatPrice(0)}</span>
            </div>
            <div className="text-xs text-text-muted">{copy.summary.country}</div>
            <div className="border-t border-stroke pt-4 flex justify-between text-base font-semibold">
              <span>{copy.summary.total}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link
              href={`/${locale}/checkout`}
              className="w-full mt-2 px-4 py-3 rounded-lg bg-accent-cyan text-text-inverse text-center block"
            >
              {copy.checkoutCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
