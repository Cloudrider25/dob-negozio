'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { Minus, Plus, Trash } from '@/components/shop-navigator/icons'

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

const formatPrice = (value: number, currency?: string) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency ?? 'EUR',
    minimumFractionDigits: 2,
  }).format(value)

export function CartClient({ locale }: { locale: string }) {
  const [items, setItems] = useState<CartItem[]>([])
  const isRemote = (url?: string | null) => Boolean(url && /^https?:\/\//i.test(url))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const load = () => {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : []
      setItems(parsed)
    }
    load()
    window.addEventListener('dob:cart-updated', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('dob:cart-updated', load)
      window.removeEventListener('storage', load)
    }
  }, [])

  const updateItems = (next: CartItem[]) => {
    setItems(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event('dob:cart-updated'))
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
        <div className="flex items-center gap-2 uppercase tracking-[0.18em]">
          <span>Home</span>
          <span>›</span>
          <span>Carrello</span>
        </div>
        <Link
          href={`/${locale}/shop`}
          className="px-4 py-2 rounded-full border border-stroke text-text-primary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
        >
          Torna allo shopping
        </Link>
      </div>

      <section className="space-y-4">
        <div className="grid grid-cols-[2.2fr_0.7fr_0.7fr_0.7fr_40px] text-sm uppercase tracking-[0.16em] text-text-muted">
          <span>Prodotto</span>
          <span>Prezzo</span>
          <span>Quantità</span>
          <span>Subtotale</span>
          <span />
        </div>

        <div className="divide-y divide-stroke">
          {items.length === 0 && (
            <div className="py-12 text-center text-text-muted">Il carrello è vuoto.</div>
          )}
          {items.map((item) => {
            const rowSubtotal = (item.price ?? 0) * item.quantity
            return (
              <div
                key={item.id}
                className="grid grid-cols-[2.2fr_0.7fr_0.7fr_0.7fr_40px] items-center gap-4 py-6"
              >
                <div className="flex items-center gap-6">
                  <div className="relative h-28 w-28 rounded-lg bg-paper overflow-hidden">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="object-contain"
                        unoptimized={isRemote(item.coverImage)}
                        sizes="112px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--paper)_50%,transparent)]" />
                    )}
                  </div>
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
            Completa ordine
          </div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-text-muted">
            {['Login', 'Indirizzi', 'Spedizione', 'Pagamento', 'Conferma'].map((step, index) => (
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
              Accedi, registrati o acquista come ospite
            </div>
            <p className="text-sm text-text-secondary">
              Acquista come ospite, accedi con le tue credenziali, oppure registrati e in seguito
              ti verranno richiesti email e password.
            </p>
            <div className="text-sm text-text-muted">Seleziona un’opzione:</div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {['Acquista come ospite', 'Accedi', 'Registrati'].map((label) => (
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
            <div className="text-lg font-semibold text-text-primary">Codice sconto</div>
            <p className="text-sm text-text-muted">
              Se possiedi un codice sconto inseriscilo nel campo seguente.
            </p>
            <div className="flex items-center gap-3">
              <input
                className="flex-1 rounded-lg border border-stroke px-3 py-2 bg-transparent"
                placeholder="Codice"
              />
              <button className="px-4 py-2 rounded-lg bg-text-primary text-text-inverse">
                Applica
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-stroke bg-paper p-6 space-y-4">
            <div className="text-lg font-semibold text-text-primary">Riepilogo ordine</div>
            <div className="flex justify-between text-sm">
              <span>Subtotale</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="text-xs text-text-muted">Tasse incluse</div>
            <div className="flex justify-between text-sm">
              <span>Spedizione</span>
              <span>{formatPrice(0)}</span>
            </div>
            <div className="text-xs text-text-muted">Italia</div>
            <div className="border-t border-stroke pt-4 flex justify-between text-base font-semibold">
              <span>Totale</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <button className="w-full mt-2 px-4 py-3 rounded-lg bg-accent-cyan text-text-inverse">
              Procedi al checkout
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
