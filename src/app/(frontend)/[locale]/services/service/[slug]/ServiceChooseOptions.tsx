'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { StateCircleButton } from '@/components/ui/StateCircleButton'
import { emitCartOpen, emitCartUpdated, readCart, writeCart } from '@/lib/cartStorage'
import styles from '@/components/pages/frontend/service-detail/ServiceDetailPage.module.css'

type ChooseOption = {
  id: string
  name: string
  durationMinutes: number | null
  price: number | null
}

type ServicePackage = {
  id: string
  name: string
  sessions: number | null
  packagePrice: number | null
  packageValue: number | null
  linkedTo: string
}

type ServiceChooseOptionsProps = {
  serviceId: string
  serviceSlug?: string
  options: ChooseOption[]
  packages?: ServicePackage[]
  serviceName: string
  locale: string
  coverImage?: string | null
}

export function ServiceChooseOptions({
  serviceId,
  serviceSlug,
  options,
  packages = [],
  serviceName,
  locale,
  coverImage,
}: ServiceChooseOptionsProps) {
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? '')
  const [isPackagesOpen, setIsPackagesOpen] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedId) ?? options[0] ?? null,
    [options, selectedId],
  )
  const selectedVariantValue = selectedOption?.id || 'default'

  const formatPrice = (value: number | null) => {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) return null
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const ctaText = [
    'prenota',
    serviceName,
    selectedOption?.durationMinutes ? `${selectedOption.durationMinutes} min` : null,
    formatPrice(selectedOption?.price ?? null),
  ]
    .filter(Boolean)
    .join(' ')

  const filteredPackages = useMemo(() => {
    return packages.filter((item) => item.linkedTo === selectedVariantValue)
  }, [packages, selectedVariantValue])

  const selectedPackage = useMemo(
    () => filteredPackages.find((item) => item.id === selectedPackageId) ?? null,
    [filteredPackages, selectedPackageId],
  )

  useEffect(() => {
    if (!selectedPackageId) return
    if (!filteredPackages.some((item) => item.id === selectedPackageId)) {
      setSelectedPackageId(null)
    }
  }, [filteredPackages, selectedPackageId])

  const resolvedCtaText = selectedPackage
    ? ['prenota', selectedPackage.name, formatPrice(selectedPackage.packagePrice)]
        .filter(Boolean)
        .join(' ')
    : ctaText

  const packagesToggleLabel = selectedPackage
    ? `rimuovi pacchetto ${selectedPackage.name}`
    : 'visualizza pacchetti'

  const handleAddToCart = () => {
    if (typeof window === 'undefined') return

    const items = readCart()

    const cartItem = selectedPackage
      ? {
          id: `${serviceId}:package:${selectedPackage.id}`,
          title: selectedPackage.name,
          slug: serviceSlug,
          price: selectedPackage.packagePrice ?? undefined,
          currency: 'EUR',
          coverImage: coverImage ?? null,
          quantity: 1,
        }
      : {
          id: `${serviceId}:service:${selectedOption?.id || 'default'}`,
          title: selectedOption ? `${serviceName} ${selectedOption.name}` : serviceName,
          slug: serviceSlug,
          price: selectedOption?.price ?? undefined,
          currency: 'EUR',
          coverImage: coverImage ?? null,
          quantity: 1,
        }

    const existing = items.find((item) => item.id === cartItem.id)
    if (existing) {
      existing.quantity += 1
      if (!existing.coverImage && cartItem.coverImage) {
        existing.coverImage = cartItem.coverImage
      }
      if (typeof cartItem.price === 'number') existing.price = cartItem.price
      if (!existing.slug && cartItem.slug) existing.slug = cartItem.slug
    } else {
      items.push(cartItem)
    }

    writeCart(items)
    emitCartUpdated()
    emitCartOpen()
  }

  return (
    <>
      <div className={styles.relatedList}>
        {options.map((option) => (
          <StateCircleButton
            key={option.id}
            baseClassName={styles.relatedItem}
            selected={option.id === selectedId}
            selectedClassName={styles.relatedItemActive}
            typographyClassName="typo-caption-upper"
            type="button"
            aria-pressed={option.id === selectedId}
            onClick={() => {
              setSelectedId(option.id)
              setSelectedPackageId(null)
            }}
          >
            {option.durationMinutes ? `${option.name} (${option.durationMinutes} min)` : option.name}
          </StateCircleButton>
        ))}
      </div>
      {filteredPackages.length > 0 ? (
        <div className={styles.packagesBlock}>
          <button
            type="button"
            className={`${styles.packagesToggle} typo-caption-upper`}
            onClick={() => {
              if (selectedPackage) {
                setSelectedPackageId(null)
                return
              }
              setIsPackagesOpen((value) => !value)
            }}
            aria-expanded={selectedPackage ? false : isPackagesOpen}
          >
            {packagesToggleLabel}
          </button>
          {isPackagesOpen && !selectedPackage ? (
            <div className={styles.packagesList}>
              {filteredPackages.map((item) => (
                <div key={item.id} className={styles.packageItem}>
                  <button
                    type="button"
                    className={`${styles.packageItemButton} ${
                      item.id === selectedPackageId ? styles.packageItemButtonActive : ''
                    }`}
                    onClick={() => {
                      setSelectedPackageId(item.id)
                      setIsPackagesOpen(false)
                    }}
                    aria-pressed={item.id === selectedPackageId}
                  >
                    <div className={`${styles.packageName} typo-caption-upper`}>{item.name}</div>
                    <div className={`${styles.packageMeta} typo-small`}>
                      {[
                        item.sessions ? `${item.sessions} sedute` : null,
                        formatPrice(item.packagePrice),
                        item.packageValue ? `valore ${formatPrice(item.packageValue)}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <Button
        className={`${styles.buyButton} typo-caption-upper`}
        type="button"
        kind="main"
        interactive
        onClick={handleAddToCart}
      >
        {resolvedCtaText}
      </Button>
    </>
  )
}
