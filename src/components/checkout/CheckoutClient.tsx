'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'


import styles from '@/app/(checkout)/[locale]/checkout/checkout.module.css'

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

export function CheckoutClient({ notice, locale }: { notice?: string | null; locale: string }) {
  const [items, setItems] = useState<CartItem[]>([])
  const isRemote = (url?: string | null) => Boolean(url && /^https?:\/\//i.test(url))
  const [formState, setFormState] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    postalCode: '',
    city: '',
    province: '',
  })

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

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    [items],
  )

  const isFormComplete = Object.values(formState).every((value) => value.trim().length > 0)

  return (
    <div className={styles.page}>
      <section className={styles.form}>
        <div className={styles.brand}>
          <h1 className={styles.brandTitle}>dob</h1>
          <div className={styles.steps}>
            <span>Cart</span>
            <span>›</span>
            <span>Information</span>
            <span>›</span>
            <span>Shipping</span>
            <span>›</span>
            <span>Payment</span>
          </div>
        </div>

        {notice ? <div className={styles.notice}>{notice}</div> : null}

        <div className={styles.express}>
          <div className={styles.expressTitle}>Express checkout</div>
          <div className={styles.expressRow}>
            <div className={styles.expressButton}>Shop Pay</div>
            <div className={styles.expressButton}>PayPal</div>
            <div className={styles.expressButton}>G Pay</div>
          </div>
        </div>

        <div className={styles.orDivider}>OR</div>

        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <span>Contact</span>
            <span>Sign in</span>
          </div>
          <input
            className={styles.input}
            placeholder="Email"
            value={formState.email}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, email: event.target.value }))
            }
          />
          <label className={styles.checkboxRow}>
            <input type="checkbox" />
            Email me with news and offers
          </label>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <span>Shipping address</span>
          </div>
          <select className={styles.select}>
            <option>Italy</option>
          </select>
          <div className={styles.splitRow}>
            <input
              className={styles.input}
              placeholder="First name"
              value={formState.firstName}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, firstName: event.target.value }))
              }
            />
            <input
              className={styles.input}
              placeholder="Last name"
              value={formState.lastName}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, lastName: event.target.value }))
              }
            />
          </div>
          <input
            className={styles.input}
            placeholder="Address"
            value={formState.address}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, address: event.target.value }))
            }
          />
          <input className={styles.input} placeholder="Apartment, suite, etc. (optional)" />
          <div className={styles.splitRowThree}>
            <input
              className={styles.input}
              placeholder="Postal code"
              value={formState.postalCode}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, postalCode: event.target.value }))
              }
            />
            <input
              className={styles.input}
              placeholder="City"
              value={formState.city}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, city: event.target.value }))
              }
            />
            <select
              className={styles.select}
              value={formState.province}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, province: event.target.value }))
              }
            >
              <option value="">Province</option>
              <option>Milano</option>
              <option>Roma</option>
              <option>Torino</option>
            </select>
          </div>
          <input className={styles.input} placeholder="Phone" />
          <label className={styles.checkboxRow}>
            <input type="checkbox" />
            Text me with news and offers (US &amp; CA only)
          </label>
        </div>

        <div className={styles.actionsRow}>
          {isFormComplete ? (
            <>
              <Link className={styles.returnLink} href={`/${locale}/cart`}>
                <span className={styles.returnIcon}>‹</span>
                Return to cart
              </Link>
              <button className={styles.continueButton} type="button">
                Continue to shipping
              </button>
            </>
          ) : (
            <button
              className={styles.returnLink}
              type="button"
              onClick={() => window.history.back()}
            >
              <span className={styles.returnIcon}>‹</span>
              Ritorna allo shopping
            </button>
          )}
        </div>

        <div className={styles.footerLinks}>
          <Link href="#" className={styles.footerLink}>
            Refund policy
          </Link>
          <Link href="#" className={styles.footerLink}>
            Shipping
          </Link>
          <Link href="#" className={styles.footerLink}>
            Privacy policy
          </Link>
          <Link href="#" className={styles.footerLink}>
            Terms of service
          </Link>
          <Link href="#" className={styles.footerLink}>
            Contact
          </Link>
        </div>
        <div className={styles.cookieLink}>Cookie Preferences</div>
      </section>

      <aside className={styles.summary}>
        {items.length === 0 ? (
          <div className={styles.summaryMeta}>Il carrello è vuoto.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={styles.summaryItem}>
              <div className={styles.summaryThumb}>
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-contain"
                    unoptimized={isRemote(item.coverImage)}
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div>
                <p className={styles.summaryTitle}>{item.title}</p>
                <div className={styles.summaryMeta}>{item.brand || 'Prodotto'}</div>
              </div>
              <div className={styles.summaryPrice}>
                {typeof item.price === 'number'
                  ? formatPrice(item.price * item.quantity, item.currency)
                  : '—'}
              </div>
            </div>
          ))
        )}

        <div className={styles.codeRow}>
          <input className={styles.input} placeholder="Discount code or gift card" />
          <button className={styles.applyButton} type="button">
            Apply
          </button>
        </div>

        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>Calculated at next step</span>
        </div>
        <div className={styles.totalRow}>
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
      </aside>
    </div>
  )
}
