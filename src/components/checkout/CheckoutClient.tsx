'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import styles from '@/app/(checkout)/[locale]/checkout/checkout.module.css'
import { emitCartUpdated, readCart, writeCart, type CartItem } from '@/lib/cartStorage'

const formatPrice = (value: number, currency?: string) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency ?? 'EUR',
    minimumFractionDigits: 2,
  }).format(value)

export function CheckoutClient({ notice, locale }: { notice?: string | null; locale: string }) {
  const router = useRouter()
  const [formState, setFormState] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    postalCode: '',
    city: '',
    province: '',
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items = useMemo(() => readCart(), [])
  const isRemote = (url?: string | null) => Boolean(url && /^https?:\/\//i.test(url))

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    [items],
  )

  const isFormComplete = useMemo(() => {
    const required = [
      formState.email,
      formState.firstName,
      formState.lastName,
      formState.address,
      formState.postalCode,
      formState.city,
      formState.province,
    ]
    return required.every((value) => value.trim().length > 0)
  }, [formState])

  const onSubmit = async () => {
    if (submitting) return
    if (!isFormComplete) {
      setError('Compila tutti i campi obbligatori prima di continuare.')
      return
    }
    if (items.length === 0) {
      setError('Il carrello è vuoto.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale,
          customer: formState,
          items: items.map((item: CartItem) => ({ id: item.id, quantity: item.quantity })),
        }),
      })

      const data = (await response.json()) as { error?: string; orderNumber?: string; orderId?: string | number }
      if (!response.ok) {
        throw new Error(data.error || 'Checkout non riuscito.')
      }

      writeCart([])
      emitCartUpdated()
      const orderCode = data.orderNumber || String(data.orderId || '')
      router.push(`/${locale}/checkout/success${orderCode ? `?order=${encodeURIComponent(orderCode)}` : ''}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout non riuscito.')
    } finally {
      setSubmitting(false)
    }
  }

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
            <span>Payment</span>
          </div>
        </div>

        {notice ? <div className={styles.notice}>{notice}</div> : null}
        {error ? <div className={styles.notice}>{error}</div> : null}

        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <span>Contatto</span>
          </div>
          <input
            className={styles.input}
            placeholder="Email"
            value={formState.email}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, email: event.target.value }))
            }
          />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <span>Indirizzo di spedizione</span>
          </div>
          <select className={styles.select} defaultValue="Italy">
            <option value="Italy">Italy</option>
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
            <input
              className={styles.input}
              placeholder="Province"
              value={formState.province}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, province: event.target.value }))
              }
            />
          </div>
          <input
            className={styles.input}
            placeholder="Phone (optional)"
            value={formState.phone}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, phone: event.target.value }))
            }
          />
        </div>

        <div className={styles.actionsRow}>
          <Link className={styles.returnLink} href={`/${locale}/cart`}>
            <span className={styles.returnIcon}>‹</span>
            Return to cart
          </Link>
          <button
            className={styles.continueButton}
            type="button"
            disabled={submitting}
            onClick={onSubmit}
          >
            {submitting ? 'Invio ordine...' : 'Conferma ordine'}
          </button>
        </div>

        <div className={styles.footerLinks}>
          <Link href={`/${locale}/refund`} className={styles.footerLink}>
            Refund policy
          </Link>
          <Link href={`/${locale}/shipping`} className={styles.footerLink}>
            Shipping
          </Link>
          <Link href={`/${locale}/privacy`} className={styles.footerLink}>
            Privacy policy
          </Link>
          <Link href={`/${locale}/terms`} className={styles.footerLink}>
            Terms of service
          </Link>
          <Link href={`/${locale}/contact`} className={styles.footerLink}>
            Contact
          </Link>
        </div>
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

        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Shipping</span>
          <span>{formatPrice(0)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
      </aside>
    </div>
  )
}
