'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import styles from './CartDrawer.module.css'

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
const OPEN_EVENT = 'dob:cart-open'

const formatPrice = (value: number, currency?: string) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency ?? 'EUR',
    minimumFractionDigits: 2,
  }).format(value)

export function CartDrawer({ locale }: { locale: string }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const isRemote = (url?: string | null) => Boolean(url && /^https?:\/\//i.test(url))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const load = () => {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : []
      setItems(parsed)
    }
    const openDrawer = () => {
      load()
      setOpen(true)
    }
    load()
    window.addEventListener('dob:cart-updated', load)
    window.addEventListener('storage', load)
    window.addEventListener(OPEN_EVENT, openDrawer)
    return () => {
      window.removeEventListener('dob:cart-updated', load)
      window.removeEventListener('storage', load)
      window.removeEventListener(OPEN_EVENT, openDrawer)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

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

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  return (
    <div className={`${styles.drawerRoot} ${open ? styles.open : ''}`}>
      <div
        className={styles.backdrop}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />
      <aside className={styles.panel} aria-label="Cart drawer">
        <div className={styles.header}>
          <span>{itemCount} items</span>
          <button className={styles.closeButton} type="button" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <div className={styles.progress}>
          <div className={styles.progressFill} />
        </div>
        <div className={styles.freeNote}>Free standard shipping unlocked</div>

        <div className={styles.list}>
          {items.length === 0 ? (
            <div className={styles.empty}>Il carrello è vuoto.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.thumb}>
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-contain"
                      unoptimized={isRemote(item.coverImage)}
                      sizes="72px"
                    />
                  ) : null}
                </div>
                <div>
                  <p className={styles.itemTitle}>{item.title}</p>
                  {item.brand && <div className={styles.itemMeta}>{item.brand}</div>}
                  <div className={styles.qtyRow}>
                    <button
                      type="button"
                      className={styles.qtyButton}
                      onClick={() => decrement(item.id)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyButton}
                      onClick={() => increment(item.id)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeItem(item.id)}
                  >
                    Rimuovi
                  </button>
                </div>
                <div className={styles.price}>
                  {typeof item.price === 'number'
                    ? formatPrice(item.price * item.quantity, item.currency)
                    : '—'}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.routine}>
          <div className={styles.thumb} />
          <div>
            <p className={styles.routineTitle}>Complete your routine</p>
            <div className={styles.itemMeta}>Selezione consigliata</div>
          </div>
          <button className={styles.routineButton} type="button">
            Add
          </button>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className={styles.itemMeta}>
            *shipping, taxes, and discounts calculated at checkout.
          </div>
          <Link
            className={styles.checkoutButton}
            href={`/${locale}/checkout`}
            onClick={() => setOpen(false)}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  )
}
