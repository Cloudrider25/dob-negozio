'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { ProductCard } from '@/components/navigators/shop-navigator/types/navigator'
import styles from './RoutineBuilderSection.module.css'

type RoutineNeed = {
  id: string
  label: string
  slug?: string
}

type RoutineTiming = {
  id: string
  label: string
  slug?: string
}

type RoutineBrand = {
  id: string
  label: string
  slug?: string
}

type RoutineStep = {
  id: string
  label: string
  slug?: string
  required: boolean
  order: number
  products: ProductCard[]
}

type RoutineTemplateView = {
  id: string
  name: string
  description?: string
  need: RoutineNeed
  timing: RoutineTiming
  productArea?: { id: string; label: string; slug?: string }
  isMultibrand: boolean
  brand?: RoutineBrand
  steps: RoutineStep[]
}

type RoutineBuilderSectionProps = {
  templates: RoutineTemplateView[]
  productBasePath: string
}

const timingOrder = (slug?: string) => {
  if (slug === 'mattutina') return 0
  if (slug === 'serale') return 1
  if (slug === 'trattamento-mirato') return 2
  if (slug === 'solare') return 3
  return 4
}

export function RoutineBuilderSection({ templates, productBasePath }: RoutineBuilderSectionProps) {
  const needs = useMemo(() => {
    const map = new Map<string, RoutineNeed>()
    for (const template of templates) {
      map.set(template.need.id, template.need)
    }
    return Array.from(map.values())
  }, [templates])

  const timings = useMemo(() => {
    const map = new Map<string, RoutineTiming>()
    for (const template of templates) {
      map.set(template.timing.id, template.timing)
    }
    return Array.from(map.values()).sort((a, b) => timingOrder(a.slug) - timingOrder(b.slug))
  }, [templates])

  const brands = useMemo(() => {
    const map = new Map<string, RoutineBrand>()
    map.set('multibrand', { id: 'multibrand', label: 'Multibrand', slug: 'multibrand' })
    for (const template of templates) {
      if (!template.isMultibrand && template.brand) {
        map.set(template.brand.id, template.brand)
      }
    }
    return Array.from(map.values())
  }, [templates])

  const [selectedNeed, setSelectedNeed] = useState(needs[0]?.id ?? '')
  const [selectedTiming, setSelectedTiming] = useState(timings[0]?.id ?? '')
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.id ?? 'multibrand')

  const activeTemplate = useMemo(() => {
    return templates.find((template) => {
      if (template.need.id !== selectedNeed) return false
      if (template.timing.id !== selectedTiming) return false
      if (selectedBrand === 'multibrand') return template.isMultibrand
      return template.brand?.id === selectedBrand
    })
  }, [templates, selectedNeed, selectedTiming, selectedBrand])

  const steps = activeTemplate?.steps ?? []

  return (
    <section className={styles.section} id="routine-builder">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Routine builder</p>
          <h2 className={styles.title}>Routine consigliata</h2>
          <p className={styles.subtitle}>
            Seleziona esigenza e timing per visualizzare una proposta completa.
          </p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <p className={styles.filterLabel}>Esigenza</p>
          <div className={styles.chips}>
            {needs.map((need) => (
              <button
                key={need.id}
                type="button"
                className={`${styles.chip} ${need.id === selectedNeed ? styles.chipActive : ''}`}
                onClick={() => setSelectedNeed(need.id)}
              >
                {need.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <p className={styles.filterLabel}>Timing</p>
          <div className={styles.chips}>
            {timings.map((timing) => (
              <button
                key={timing.id}
                type="button"
                className={`${styles.chip} ${timing.id === selectedTiming ? styles.chipActive : ''}`}
                onClick={() => setSelectedTiming(timing.id)}
              >
                {timing.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <p className={styles.filterLabel}>Brand</p>
          <div className={styles.chips}>
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                className={`${styles.chip} ${brand.id === selectedBrand ? styles.chipActive : ''}`}
                onClick={() => setSelectedBrand(brand.id)}
              >
                {brand.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTemplate ? (
        <div className={styles.steps}>
          {steps.map((step) => (
            <div key={step.id} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div>
                  <p className={styles.stepEyebrow}>Step</p>
                  <h3 className={styles.stepTitle}>{step.label}</h3>
                </div>
                {!step.required && <span className={styles.optional}>Opzionale</span>}
              </div>
              <div className={styles.productGrid}>
                {step.products.length > 0 ? (
                  step.products.map((product) => (
                    <Link
                      key={product.id}
                      className={styles.productCard}
                      href={`${productBasePath}/${product.slug ?? product.id}`}
                    >
                      <div className={styles.productMeta}>
                        <span className={styles.productTitle}>{product.title}</span>
                        {product.brand && <span className={styles.productBrand}>{product.brand}</span>}
                      </div>
                      {typeof product.price === 'number' && (
                        <span className={styles.productPrice}>€ {product.price}</span>
                      )}
                    </Link>
                  ))
                ) : (
                  <p className={styles.empty}>Nessun prodotto suggerito per questo step.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>Nessuna routine disponibile per questa combinazione.</div>
      )}
    </section>
  )
}
