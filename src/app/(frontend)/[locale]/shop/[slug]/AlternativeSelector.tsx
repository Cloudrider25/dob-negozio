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
  baseProduct,
  locale,
  fallbackLabel,
  className,
}: {
  options: AlternativeOption[]
  baseProduct: {
    id: string
    title: string
    slug?: string
    price?: number | null
    currency?: string | null
    brand?: string | null
    coverImage?: string | null
  }
  locale: string
  fallbackLabel: string
  className?: string
}) {
  const [selectedKey, setSelectedKey] = useState(
    () => options.find((opt) => opt.isCurrent)?.key ?? options[0]?.key,
  )

  const selected = useMemo(() => {
    const active = options.find((opt) => opt.key === selectedKey) || options[0]
    return active || null
  }, [options, selectedKey])

  const resolvedProduct = {
    id: selected?.productId || baseProduct.id,
    title: selected?.title || baseProduct.title || fallbackLabel,
    slug: selected?.slug || baseProduct.slug,
    price: selected?.price ?? baseProduct.price ?? undefined,
    currency: selected?.currency ?? baseProduct.currency ?? undefined,
    brand: selected?.brand ?? baseProduct.brand ?? undefined,
    coverImage: selected?.coverImage ?? baseProduct.coverImage ?? null,
  }

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
        product={resolvedProduct}
        locale={locale}
        className={className}
        buttonLabel={`Acquista ${resolvedProduct.title}${
          typeof resolvedProduct.price === 'number'
            ? ` - ${formatPrice(resolvedProduct.price, resolvedProduct.currency ?? null)}`
            : ''
        }`}
      />
    )
  }

  return (
    <>
      <div className={styles.relatedBlock}>
        <div className={`${styles.label} typo-caption-upper`}>Scegli</div>
        <div className={styles.relatedList}>
          {options.map((option) => {
            const label = labelFor(option)
            const isActive = option.key === selected?.key
            return (
              <button
                key={option.key}
                type="button"
                className={`${styles.relatedItem} typo-caption-upper ${isActive ? styles.relatedItemActive : ''}`}
                onClick={() => setSelectedKey(option.key)}
                aria-pressed={isActive}
              >
                {label}
              </button>
            )
          })}
        </div>
        {hasRefill && (
          <p className={`${styles.refillNote} typo-body`}>
            Acquistare il refill è un gesto importante per l&apos;ambiente: riduci gli sprechi e
            contribuisci a un futuro più sostenibile, mantenendo la tua routine di bellezza
            intatta.
          </p>
        )}
      </div>

      <ProductPurchase
        product={resolvedProduct}
        locale={locale}
        className={className}
        buttonLabel={`Acquista ${resolvedProduct.title}${
          typeof resolvedProduct.price === 'number'
            ? ` - ${formatPrice(resolvedProduct.price, resolvedProduct.currency ?? null)}`
            : ''
        }`}
      />
    </>
  )
}
