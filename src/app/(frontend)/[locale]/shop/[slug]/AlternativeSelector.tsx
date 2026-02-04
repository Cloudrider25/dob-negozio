'use client'

import { useMemo, useState } from 'react'

import styles from './product-detail.module.css'
import { ProductPurchase } from '@/components/shop/ProductPurchase'

type AlternativeOption = {
  key: string
  productId: string
  slug: string
  title: string
  format: string
  isRefill: boolean
  price: number | null
  currency: string | null
  coverImage: string | null
  brand: string | null
  isCurrent: boolean
}

export function AlternativeSelector({
  options,
  locale,
  fallbackLabel,
  className,
}: {
  options: AlternativeOption[]
  locale: string
  fallbackLabel: string
  className?: string
}) {
  const [selectedKey, setSelectedKey] = useState(
    () => options.find((opt) => opt.isCurrent)?.key,
  )

  const selected = useMemo(() => {
    const active = options.find((opt) => opt.key === selectedKey) || options[0]
    return active || null
  }, [options, selectedKey])

  const labelFor = (option: AlternativeOption) => {
    if (option.format) return option.isRefill ? `${option.format} Refill` : option.format
    return option.isRefill ? 'Refill' : ''
  }

  const hasRefill = options.some((option) => option.isRefill)
  const hasLabels = options.some((option) => labelFor(option))
  const formatPrice = (value?: number | null, currency?: string | null) => {
    if (typeof value !== 'number') return ''
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatter.format(value)
  }

  if (!hasLabels) {
    return (
      <ProductPurchase
        product={{
          id: selected?.productId || '',
          title: selected?.title || fallbackLabel,
          slug: selected?.slug || undefined,
          price: selected?.price ?? undefined,
          currency: selected?.currency ?? undefined,
          brand: selected?.brand ?? undefined,
          coverImage: selected?.coverImage ?? null,
        }}
        className={className}
        buttonLabel={`Acquista ${selected?.title || fallbackLabel}${
          selected?.price != null ? ` - ${formatPrice(selected.price, selected.currency)}` : ''
        }`}
      />
    )
  }

  return (
    <>
      <div className={styles.relatedBlock}>
        <div className={styles.label}>Scegli</div>
        <div className={styles.relatedList}>
          {options.map((option) => {
            const label = labelFor(option)
            const isActive = option.key === selected?.key
            return (
              <button
                key={option.key}
                type="button"
                className={`${styles.relatedItem} ${isActive ? styles.relatedItemActive : ''}`}
                onClick={() => setSelectedKey(option.key)}
                aria-pressed={isActive}
              >
                {label}
              </button>
            )
          })}
        </div>
        {hasRefill && (
          <p className={styles.refillNote}>
            Acquistare il refill è un gesto importante per l&apos;ambiente: riduci gli sprechi e
            contribuisci a un futuro più sostenibile, mantenendo la tua routine di bellezza
            intatta.
          </p>
        )}
      </div>

      <ProductPurchase
        product={{
          id: selected?.productId || '',
          title: selected?.title || fallbackLabel,
          slug: selected?.slug || undefined,
          price: selected?.price ?? undefined,
          currency: selected?.currency ?? undefined,
          brand: selected?.brand ?? undefined,
          coverImage: selected?.coverImage ?? null,
        }}
        className={className}
        buttonLabel={`Acquista ${selected?.title || fallbackLabel}${
          selected?.price != null ? ` - ${formatPrice(selected.price, selected.currency)}` : ''
        }`}
      />
    </>
  )
}
