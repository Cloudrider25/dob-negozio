'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useDocumentInfo, useLocale } from '@payloadcms/ui'
import styles from './RoutineTemplateBuilder.module.css'

type StepOption = { id: string; label: string; slug?: string }
type TimingOption = { id: string; label: string }
type SkinTypeOption = { id: string; label: string }

type TemplateStep = {
  id?: string
  routineStepId: string
}

type StepRule = {
  id?: string
  routineStepId: string
  timingId?: string | null
  skinTypeId?: string | null
  ruleType: 'require' | 'forbid' | 'warn'
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

const asOptionalStringId = (value: unknown): string | null => {
  const id = asStringId(value)
  return id || null
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

const parseRuleType = (value: unknown): StepRule['ruleType'] => {
  if (value === 'require' || value === 'forbid' || value === 'warn') return value
  return 'warn'
}

export function RoutineTemplateRulesClient({
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
  const [rules, setRules] = useState<StepRule[]>([])
  const [stepOptions, setStepOptions] = useState<StepOption[]>([])
  const [timings, setTimings] = useState<TimingOption[]>([])
  const [skinTypes, setSkinTypes] = useState<SkinTypeOption[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const initialRuleIds = useRef<Set<string>>(new Set())

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

      const stepRulesParams = new URLSearchParams(baseParams)
      stepRulesParams.set('limit', '2000')

      const stepsParams = new URLSearchParams(baseParams)
      stepsParams.set('limit', '500')
      stepsParams.set('sort', 'stepOrderDefault')

      const timingsParams = new URLSearchParams(baseParams)
      timingsParams.set('limit', '200')

      const skinTypesParams = new URLSearchParams(baseParams)
      skinTypesParams.set('limit', '500')

      const [templateStepsResult, stepRulesResult, stepsResult, timingsResult, skinTypesResult] =
        await Promise.all([
          fetchJSON<ApiListResponse>(
            `/api/routine-template-steps?${templateStepsParams.toString()}`,
          ),
          fetchJSON<ApiListResponse>(`/api/routine-step-rules?${stepRulesParams.toString()}`),
          fetchJSON<ApiListResponse>(`/api/routine-steps?${stepsParams.toString()}`),
          fetchJSON<ApiListResponse>(`/api/timing-products?${timingsParams.toString()}`),
          fetchJSON<ApiListResponse>(`/api/skin-types?${skinTypesParams.toString()}`),
        ])

      if (cancelled) return

      const normalizedSteps: TemplateStep[] = (templateStepsResult.docs ?? []).map((step) => ({
        id: asStringId(step.id),
        routineStepId: asStringId(step.routineStep),
      }))
      setSteps(normalizedSteps)

      const stepRuleList: StepRule[] = (stepRulesResult.docs ?? [])
        .map((rule) => ({
          id: asStringId(rule.id),
          routineStepId: asStringId(rule.routineStep),
          timingId: asOptionalStringId(rule.timing),
          skinTypeId: asOptionalStringId(rule.skinType),
          ruleType: parseRuleType(rule.ruleType),
        }))
        .filter((rule) => normalizedSteps.some((step) => step.routineStepId === rule.routineStepId))

      const ruleIds = new Set(stepRuleList.map((rule) => rule.id).filter(Boolean) as string[])
      initialRuleIds.current = ruleIds
      setRules(stepRuleList)

      setStepOptions(
        (stepsResult.docs ?? []).map((step) => ({
          id: asStringId(step.id),
          label: getLocalizedLabel(step.name, resolvedLocale || 'it', asStringId(step.slug || step.id)),
          slug: typeof step.slug === 'string' ? step.slug : undefined,
        })),
      )

      setTimings(
        (timingsResult.docs ?? []).map((timing) => ({
          id: asStringId(timing.id),
          label: getLocalizedLabel(
            timing.name,
            resolvedLocale || 'it',
            asStringId(timing.slug || timing.id),
          ),
        })),
      )

      setSkinTypes(
        (skinTypesResult.docs ?? []).map((skin) => ({
          id: asStringId(skin.id),
          label: getLocalizedLabel(skin.name, resolvedLocale || 'it', asStringId(skin.slug || skin.id)),
        })),
      )

      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [resolvedId, resolvedLocale])

  const handleSave = async () => {
    if (!resolvedId) return
    setSaving(true)
    setMessage(null)
    try {
      const currentRuleIds = new Set(rules.map((rule) => rule.id).filter(Boolean) as string[])
      for (const rule of rules) {
        if (rule.id) {
          await fetchJSON(`/api/routine-step-rules/${rule.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              routineStep: rule.routineStepId,
              timing: rule.timingId ?? null,
              skinType: rule.skinTypeId ?? null,
              ruleType: rule.ruleType,
            }),
          })
        } else {
          await fetchJSON(`/api/routine-step-rules`, {
            method: 'POST',
            body: JSON.stringify({
              routineStep: rule.routineStepId,
              timing: rule.timingId ?? null,
              skinType: rule.skinTypeId ?? null,
              ruleType: rule.ruleType,
            }),
          })
        }
      }

      for (const existingId of initialRuleIds.current) {
        if (!currentRuleIds.has(existingId)) {
          await fetchJSON(`/api/routine-step-rules/${existingId}`, { method: 'DELETE' })
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

  const ruleTypeOptions: Array<StepRule['ruleType']> = ['require', 'forbid', 'warn']

  if (!resolvedId) {
    return <div className={styles.wrapper}>Seleziona un template per gestire le regole.</div>
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Routine Builder</p>
          <h2 className={styles.title}>Regole per step</h2>
          <p className={styles.subtitle}>
            Imposta vincoli su timing e tipo pelle per ogni step del template.
          </p>
        </div>
        <button type="button" className={styles.saveButton} onClick={handleSave} disabled={saving}>
          {saving ? 'Salvataggio…' : 'Salva regole'}
        </button>
      </div>

      {message ? <p className={styles.message}>{message}</p> : null}
      {loading ? (
        <p className={styles.message}>Caricamento…</p>
      ) : (
        <section className={styles.panel}>
          <h3 className={styles.panelTitle}>Regole per step</h3>
          {steps.map((step) => {
            const stepRules = rules.filter((rule) => rule.routineStepId === step.routineStepId)
            const stepLabel = stepMap.get(step.routineStepId)?.label ?? step.routineStepId
            return (
              <div key={step.routineStepId} className={styles.ruleGroup}>
                <div className={styles.ruleHeader}>
                  <div className={styles.stepInfo}>
                    <p className={styles.ruleTitle}>{stepLabel}</p>
                    <span className={styles.stepSlug}>{stepMap.get(step.routineStepId)?.slug ?? ''}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() =>
                      setRules((prev) => [
                        ...prev,
                        {
                          routineStepId: step.routineStepId,
                          ruleType: 'warn',
                        },
                      ])
                    }
                  >
                    Aggiungi regola
                  </button>
                </div>
                {stepRules.length === 0 ? (
                  <p className={styles.message}>Nessuna regola.</p>
                ) : (
                  stepRules.map((rule, index) => (
                    <div key={rule.id ?? `${rule.routineStepId}-${index}`} className={styles.ruleRow}>
                      <select
                        className={styles.select}
                        value={rule.ruleType}
                        onChange={(event) => {
                          const value = event.target.value as StepRule['ruleType']
                          setRules((prev) =>
                            prev.map((item) => (item === rule ? { ...item, ruleType: value } : item)),
                          )
                        }}
                      >
                        {ruleTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <select
                        className={styles.select}
                        value={rule.timingId ?? ''}
                        onChange={(event) => {
                          const value = event.target.value || null
                          setRules((prev) =>
                            prev.map((item) => (item === rule ? { ...item, timingId: value } : item)),
                          )
                        }}
                      >
                        <option value="">Timing (opzionale)</option>
                        {timings.map((timing) => (
                          <option key={timing.id} value={timing.id}>
                            {timing.label}
                          </option>
                        ))}
                      </select>
                      <select
                        className={styles.select}
                        value={rule.skinTypeId ?? ''}
                        onChange={(event) => {
                          const value = event.target.value || null
                          setRules((prev) =>
                            prev.map((item) => (item === rule ? { ...item, skinTypeId: value } : item)),
                          )
                        }}
                      >
                        <option value="">Tipo pelle (opzionale)</option>
                        {skinTypes.map((skin) => (
                          <option key={skin.id} value={skin.id}>
                            {skin.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className={styles.ghostButton}
                        onClick={() => setRules((prev) => prev.filter((item) => item !== rule))}
                      >
                        Rimuovi
                      </button>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}

export default RoutineTemplateRulesClient
