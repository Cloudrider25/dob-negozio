'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useDocumentInfo, useLocale } from '@payloadcms/ui'
import { Input, Select } from '@/components/ui/input'
import styles from './RoutineTemplateBuilder.module.css'

type StepOption = { id: string; label: string; slug?: string }
type TemplateStep = {
  id?: string
  routineStepId: string
  stepOrder: number
  required: boolean
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
  const [stepOptions, setStepOptions] = useState<StepOption[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [newStepId, setNewStepId] = useState('')
  const initialStepIds = useRef<Set<string>>(new Set())

  const stepMap = useMemo(() => new Map(stepOptions.map((step) => [step.id, step])), [stepOptions])

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

      const stepsParams = new URLSearchParams(baseParams)
      stepsParams.set('limit', '500')
      stepsParams.set('sort', 'stepOrderDefault')

      const [templateStepsResult, stepsResult] = await Promise.all([
        fetchJSON<ApiListResponse>(
          `/api/routine-template-steps?${templateStepsParams.toString()}`,
        ),
        fetchJSON<ApiListResponse>(`/api/routine-steps?${stepsParams.toString()}`),
      ])

      if (cancelled) return

      const normalizedSteps: TemplateStep[] = (templateStepsResult.docs ?? []).map((step) => ({
        id: asStringId(step.id),
        routineStepId: asStringId(step.routineStep),
        stepOrder: typeof step.stepOrder === 'number' ? step.stepOrder : 0,
        required: Boolean(step.required),
      }))
      const stepIds = new Set(normalizedSteps.map((step) => step.id).filter(Boolean) as string[])
      initialStepIds.current = stepIds
      setSteps(normalizedSteps)

      setStepOptions(
        (stepsResult.docs ?? []).map((step) => ({
          id: asStringId(step.id),
          label: getLocalizedLabel(step.name, resolvedLocale || 'it', asStringId(step.slug || step.id)),
          slug: typeof step.slug === 'string' ? step.slug : undefined,
        })),
      )

      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [resolvedId, resolvedLocale])

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
        } else {
          await fetchJSON(`/api/routine-template-steps`, {
            method: 'POST',
            body: JSON.stringify({
              routineTemplate: resolvedId,
              routineStep: step.routineStepId,
              stepOrder: step.stepOrder,
              required: step.required,
            }),
          })
        }
      }

      for (const existingId of initialStepIds.current) {
        if (!currentStepIds.has(existingId)) {
          await fetchJSON(`/api/routine-template-steps/${existingId}`, { method: 'DELETE' })
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
    return <div className={styles.wrapper}>Seleziona un template per gestire gli step.</div>
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Routine Builder</p>
          <h2 className={styles.title}>Gestione step</h2>
          <p className={styles.subtitle}>Definisci gli step e l’ordine del template.</p>
        </div>
        <button type="button" className={styles.saveButton} onClick={handleSave} disabled={saving}>
          {saving ? 'Salvataggio…' : 'Salva tutto'}
        </button>
      </div>

      {message ? <p className={styles.message}>{message}</p> : null}
      {loading ? (
        <p className={styles.message}>Caricamento…</p>
      ) : (
        <>
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
                return (
                  <div key={step.id ?? step.routineStepId} className={styles.stepRow}>
                    <div className={styles.stepInfo}>
                      <p className={styles.stepName}>{option?.label ?? step.routineStepId}</p>
                      <span className={styles.stepSlug}>{option?.slug ?? ''}</span>
                    </div>
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
                            prev.map((item, idx) => (idx === index ? { ...item, stepOrder: value } : item)),
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
                            prev.map((item, idx) => (idx === index ? { ...item, required: checked } : item)),
                          )
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.ghostButton}
                      onClick={() => {
                        setSteps((prev) => prev.filter((item) => item !== step))
                      }}
                    >
                      Rimuovi
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default RoutineTemplateBuilderClient
