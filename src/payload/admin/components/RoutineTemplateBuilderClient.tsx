'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useDocumentInfo, useFormFields, useLocale } from '@payloadcms/ui'
import { Input, Select } from '@/frontend/components/ui/primitives/input'
import styles from './RoutineTemplateBuilder.module.css'

type StepOption = { id: string; label: string; slug?: string }
type TemplateStep = {
  id?: string
  routineStepId: string
  stepOrder: number
  required: boolean
}
type StepProductAssignment = {
  id?: string
  routineStepId: string
  productId: string
  rank: number
}
type ProductCandidate = {
  id: string
  label: string
  format?: string
  brandId?: string
  brandLineId?: string
  productAreaIds: string[]
  needIds: string[]
  timingIds: string[]
  skinTypeIds: string[]
  routineStepIds: string[]
}
type ApiDoc = Record<string, unknown>
type ApiListResponse = { docs?: ApiDoc[] }

const asStringId = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return ''
}

const asBoolean = (value: unknown): boolean => value === true

const toIdArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.map(asStringId).filter(Boolean)
}

const getLocalizedLabel = (value: unknown, locale: string, fallback: string): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const localized = value as Record<string, unknown>
    const preferred = localized[locale]
    if (typeof preferred === 'string') return preferred
    const first = Object.values(localized).find((entry) => typeof entry === 'string')
    if (typeof first === 'string') return first
  }
  return fallback
}

const getFieldValue = (
  fields: Record<string, { value?: unknown }> | undefined,
  path: string,
) => {
  if (!fields || typeof fields !== 'object') return undefined
  if (path in fields) return fields[path]?.value
  const suffix = `.${path}`
  for (const [key, field] of Object.entries(fields)) {
    if (key.endsWith(suffix)) return field?.value
  }
  return undefined
}

export function RoutineTemplateBuilderClient({
  id,
  locale,
}: {
  id?: string
  locale?: string
}) {
  const documentInfo = useDocumentInfo()
  const activeLocale = useLocale()
  const resolvedId = id ?? (documentInfo?.id ? String(documentInfo.id) : undefined)
  const resolvedLocale = locale ?? (activeLocale ? String(activeLocale) : undefined)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [steps, setSteps] = useState<TemplateStep[]>([])
  const [stepProducts, setStepProducts] = useState<StepProductAssignment[]>([])
  const [stepOptions, setStepOptions] = useState<StepOption[]>([])
  const [products, setProducts] = useState<ProductCandidate[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [newStepId, setNewStepId] = useState('')
  const initialStepIds = useRef<Set<string>>(new Set())
  const initialStepProductIds = useRef<Set<string>>(new Set())
  const fields = useFormFields(([formFields]) => formFields) as Record<string, { value?: unknown }>

  const stepMap = useMemo(() => new Map(stepOptions.map((step) => [step.id, step])), [stepOptions])

  const templateFilters = useMemo(() => {
    const productAreaId = asStringId(getFieldValue(fields, 'productArea'))
    const timingId = asStringId(getFieldValue(fields, 'timing'))
    const needId = asStringId(getFieldValue(fields, 'need'))
    const skinTypeId = asStringId(getFieldValue(fields, 'skinType'))
    const brandId = asStringId(getFieldValue(fields, 'brand'))
    const brandLineId = asStringId(getFieldValue(fields, 'brandLine'))
    const isMultibrand = asBoolean(getFieldValue(fields, 'isMultibrand'))

    return {
      productAreaId,
      timingId,
      needId,
      skinTypeId,
      brandId,
      brandLineId,
      isMultibrand,
    }
  }, [fields])

  const fetchJSON = async <T,>(path: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`)
    }
    return (await res.json()) as T
  }

  useEffect(() => {
    if (!resolvedId) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setMessage(null)

      const baseParams = new URLSearchParams()
      baseParams.set('depth', '0')
      if (resolvedLocale) baseParams.set('locale', resolvedLocale)

      const templateStepsParams = new URLSearchParams(baseParams)
      templateStepsParams.set('limit', '2000')
      templateStepsParams.append('where[routineTemplate][equals]', resolvedId)

      const stepProductsParams = new URLSearchParams(baseParams)
      stepProductsParams.set('limit', '2000')
      stepProductsParams.append('where[routineTemplate][equals]', resolvedId)

      const stepsParams = new URLSearchParams(baseParams)
      stepsParams.set('limit', '500')
      stepsParams.set('sort', 'stepOrderDefault')

      const productsParams = new URLSearchParams(baseParams)
      productsParams.set('limit', '2000')
      productsParams.append('where[active][equals]', 'true')

      const [templateStepsResult, stepProductsResult, stepsResult, productsResult] =
        await Promise.all([
          fetchJSON<ApiListResponse>(`/api/routine-template-steps?${templateStepsParams.toString()}`),
          fetchJSON<ApiListResponse>(
            `/api/routine-template-step-products?${stepProductsParams.toString()}`,
          ),
          fetchJSON<ApiListResponse>(`/api/routine-steps?${stepsParams.toString()}`),
          fetchJSON<ApiListResponse>(`/api/products?${productsParams.toString()}`),
        ])

      if (cancelled) return

      const normalizedSteps: TemplateStep[] = (templateStepsResult.docs ?? []).map((step) => ({
        id: asStringId(step.id),
        routineStepId: asStringId(step.routineStep),
        stepOrder: typeof step.stepOrder === 'number' ? step.stepOrder : 0,
        required: Boolean(step.required),
      }))
      initialStepIds.current = new Set(
        normalizedSteps.map((step) => step.id).filter(Boolean) as string[],
      )
      setSteps(normalizedSteps)

      const normalizedStepProducts = (stepProductsResult.docs ?? [])
        .map((entry) => ({
          id: asStringId(entry.id),
          routineStepId: asStringId(entry.routineStep),
          productId: asStringId(entry.product),
          rank: typeof entry.rank === 'number' ? entry.rank : 0,
        }))
        .filter((entry) => entry.routineStepId && entry.productId)
        .sort((a, b) => a.rank - b.rank)

      initialStepProductIds.current = new Set(
        normalizedStepProducts.map((entry) => entry.id).filter(Boolean) as string[],
      )

      const firstAssignmentPerStep = new Map<string, StepProductAssignment>()
      for (const entry of normalizedStepProducts) {
        if (!firstAssignmentPerStep.has(entry.routineStepId)) {
          firstAssignmentPerStep.set(entry.routineStepId, entry)
        }
      }
      setStepProducts(Array.from(firstAssignmentPerStep.values()))

      setStepOptions(
        (stepsResult.docs ?? []).map((step) => ({
          id: asStringId(step.id),
          label: getLocalizedLabel(step.name, resolvedLocale || 'it', asStringId(step.slug || step.id)),
          slug: typeof step.slug === 'string' ? step.slug : undefined,
        })),
      )

      setProducts(
        (productsResult.docs ?? []).map((product) => ({
          id: asStringId(product.id),
          label: getLocalizedLabel(
            product.title,
            resolvedLocale || 'it',
            asStringId(product.slug || product.id),
          ),
          format: typeof product.format === 'string' ? product.format : undefined,
          brandId: asStringId(product.brand) || undefined,
          brandLineId: asStringId(product.brandLine) || undefined,
          productAreaIds: toIdArray(product.productAreas),
          needIds: toIdArray(product.needs),
          timingIds: toIdArray(product.timingProducts),
          skinTypeIds: [
            asStringId(product.skinTypePrimary),
            ...toIdArray(product.skinTypeSecondary),
          ].filter(Boolean),
          routineStepIds: toIdArray(product.routineSteps),
        })),
      )

      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [resolvedId, resolvedLocale])

  const productOptionsByStep = useMemo(() => {
    const map = new Map<string, Array<{ id: string; label: string }>>()

    for (const step of steps) {
      const options = products
        .filter((product) => {
          if (!product.routineStepIds.includes(step.routineStepId)) return false
          if (
            templateFilters.productAreaId &&
            !product.productAreaIds.includes(templateFilters.productAreaId)
          ) {
            return false
          }
          if (templateFilters.timingId && !product.timingIds.includes(templateFilters.timingId)) {
            return false
          }
          if (templateFilters.needId && !product.needIds.includes(templateFilters.needId)) {
            return false
          }
          if (
            templateFilters.skinTypeId &&
            !product.skinTypeIds.includes(templateFilters.skinTypeId)
          ) {
            return false
          }
          if (!templateFilters.isMultibrand && templateFilters.brandId) {
            if (product.brandId !== templateFilters.brandId) return false
          }
          if (!templateFilters.isMultibrand && templateFilters.brandLineId) {
            if (product.brandLineId !== templateFilters.brandLineId) return false
          }
          return true
        })
        .map((product) => ({
          id: product.id,
          label: product.format ? `${product.label} · ${product.format}` : product.label,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, resolvedLocale || 'it'))

      map.set(step.routineStepId, options)
    }

    return map
  }, [products, resolvedLocale, steps, templateFilters])

  useEffect(() => {
    setStepProducts((prev) =>
      prev.filter((entry) => {
        const validStep = steps.some((step) => step.routineStepId === entry.routineStepId)
        if (!validStep) return false
        const options = productOptionsByStep.get(entry.routineStepId) ?? []
        return options.some((option) => option.id === entry.productId)
      }),
    )
  }, [productOptionsByStep, steps])

  const handleAddStep = () => {
    if (!newStepId) return
    if (steps.some((step) => step.routineStepId === newStepId)) return
    setSteps((prev) => [
      ...prev,
      {
        routineStepId: newStepId,
        stepOrder: prev.length,
        required: true,
      },
    ])
    setNewStepId('')
  }

  const handleSave = async () => {
    if (!resolvedId) return
    setSaving(true)
    setMessage(null)

    try {
      const currentStepIds = new Set(steps.map((step) => step.id).filter(Boolean) as string[])

      for (const step of steps) {
        if (step.id) {
          await fetchJSON(`/api/routine-template-steps/${step.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              routineTemplate: resolvedId,
              routineStep: step.routineStepId,
              stepOrder: step.stepOrder,
              required: step.required,
            }),
          })
          continue
        }

        await fetchJSON<ApiDoc>(`/api/routine-template-steps`, {
          method: 'POST',
          body: JSON.stringify({
            routineTemplate: resolvedId,
            routineStep: step.routineStepId,
            stepOrder: step.stepOrder,
            required: step.required,
          }),
        })
      }

      for (const existingId of initialStepIds.current) {
        if (!currentStepIds.has(existingId)) {
          await fetchJSON(`/api/routine-template-steps/${existingId}`, { method: 'DELETE' })
        }
      }

      const currentAssignmentIds = new Set(
        stepProducts.map((entry) => entry.id).filter(Boolean) as string[],
      )

      for (const assignment of stepProducts) {
        const payload = {
          routineTemplate: resolvedId,
          routineStep: assignment.routineStepId,
          product: assignment.productId,
          rank: assignment.rank,
        }

        if (assignment.id) {
          await fetchJSON(`/api/routine-template-step-products/${assignment.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        } else {
          await fetchJSON(`/api/routine-template-step-products`, {
            method: 'POST',
            body: JSON.stringify(payload),
          })
        }
      }

      for (const existingId of initialStepProductIds.current) {
        if (!currentAssignmentIds.has(existingId)) {
          await fetchJSON(`/api/routine-template-step-products/${existingId}`, {
            method: 'DELETE',
          })
        }
      }

      setMessage('Aggiornato.')
    } catch (err) {
      console.error(err)
      setMessage('Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  if (!resolvedId) {
    return <div className={styles.wrapper}>Salva prima il template per gestire step e prodotti.</div>
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Routine Builder</p>
          <h2 className={styles.title}>Gestione step e prodotti</h2>
          <p className={styles.subtitle}>
            Definisci gli step del template e assegna un prodotto compatibile per ciascuno.
          </p>
        </div>
        <button type="button" className={styles.saveButton} onClick={handleSave} disabled={saving}>
          {saving ? 'Salvataggio…' : 'Salva tutto'}
        </button>
      </div>

      {message ? <p className={styles.message}>{message}</p> : null}
      {loading ? (
        <p className={styles.message}>Caricamento…</p>
      ) : (
        <section className={styles.panel}>
          <h3 className={styles.panelTitle}>Step del template</h3>
          <div className={styles.stepAddRow}>
            <Select
              kind="admin"
              size="compact"
              value={newStepId}
              onChange={(event) => setNewStepId(event.target.value)}
            >
              <option value="">Seleziona step</option>
              {stepOptions.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.label}
                </option>
              ))}
            </Select>
            <button type="button" className={styles.secondaryButton} onClick={handleAddStep}>
              Aggiungi
            </button>
          </div>

          <div className={styles.stepList}>
            {steps.map((step, index) => {
              const option = stepMap.get(step.routineStepId)
              const selectedAssignment = stepProducts.find(
                (entry) => entry.routineStepId === step.routineStepId,
              )
              const productOptions = productOptionsByStep.get(step.routineStepId) ?? []

              return (
                <div key={step.id ?? step.routineStepId} className={styles.stepRow}>
                  <div className={styles.stepInfo}>
                    <p className={styles.stepName}>{option?.label ?? step.routineStepId}</p>
                    <span className={styles.stepSlug}>{option?.slug ?? ''}</span>
                  </div>

                  <label className={styles.inlineField}>
                    Prodotto
                    <Select
                      kind="admin"
                      size="compact"
                      value={selectedAssignment?.productId ?? ''}
                      onChange={(event) => {
                        const productId = event.target.value
                        setStepProducts((prev) => {
                          const current = prev.find(
                            (entry) => entry.routineStepId === step.routineStepId,
                          )
                          if (!productId) {
                            return prev.filter((entry) => entry.routineStepId !== step.routineStepId)
                          }
                          if (current) {
                            return prev.map((entry) =>
                              entry.routineStepId === step.routineStepId
                                ? { ...entry, productId }
                                : entry,
                            )
                          }
                          return [
                            ...prev,
                            {
                              routineStepId: step.routineStepId,
                              productId,
                              rank: 0,
                            },
                          ]
                        })
                      }}
                    >
                      <option value="">
                        {productOptions.length > 0
                          ? 'Seleziona prodotto'
                          : 'Nessun prodotto compatibile'}
                      </option>
                      {productOptions.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.label}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <label className={styles.inlineField}>
                    Ordine
                    <Input
                      kind="admin"
                      type="number"
                      size="compact"
                      value={step.stepOrder}
                      onChange={(event) => {
                        const value = Number.parseInt(event.target.value, 10)
                        setSteps((prev) =>
                          prev.map((item, idx) =>
                            idx === index
                              ? { ...item, stepOrder: Number.isFinite(value) ? value : 0 }
                              : item,
                          ),
                        )
                      }}
                    />
                  </label>

                  <label className={styles.inlineField}>
                    Required
                    <input
                      type="checkbox"
                      checked={step.required}
                      onChange={(event) => {
                        const checked = event.target.checked
                        setSteps((prev) =>
                          prev.map((item, idx) =>
                            idx === index ? { ...item, required: checked } : item,
                          ),
                        )
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={() => {
                      setSteps((prev) => prev.filter((item) => item !== step))
                      setStepProducts((prev) =>
                        prev.filter((entry) => entry.routineStepId !== step.routineStepId),
                      )
                    }}
                  >
                    Rimuovi
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default RoutineTemplateBuilderClient
