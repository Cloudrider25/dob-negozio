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
          fetchJSON<{ docs: Array<any> }>(
            `/api/routine-template-steps?${templateStepsParams.toString()}`,
          ),
          fetchJSON<{ docs: Array<any> }>(`/api/routine-step-rules?${stepRulesParams.toString()}`),
          fetchJSON<{ docs: Array<any> }>(`/api/routine-steps?${stepsParams.toString()}`),
          fetchJSON<{ docs: Array<any> }>(`/api/timing-products?${timingsParams.toString()}`),
          fetchJSON<{ docs: Array<any> }>(`/api/skin-types?${skinTypesParams.toString()}`),
        ])

      if (cancelled) return

      const normalizedSteps: TemplateStep[] = (templateStepsResult.docs ?? []).map((step: any) => ({
        id: String(step.id),
        routineStepId:
          typeof step.routineStep === 'object' && step.routineStep && 'id' in step.routineStep
            ? String(step.routineStep.id)
            : String(step.routineStep),
      }))
      setSteps(normalizedSteps)

      const stepRuleList: StepRule[] = (stepRulesResult.docs ?? [])
        .map((rule: any) => ({
          id: String(rule.id),
          routineStepId:
            typeof rule.routineStep === 'object' && rule.routineStep && 'id' in rule.routineStep
              ? String(rule.routineStep.id)
              : String(rule.routineStep),
          timingId:
            typeof rule.timing === 'object' && rule.timing && 'id' in rule.timing
              ? String(rule.timing.id)
              : rule.timing
                ? String(rule.timing)
                : null,
          skinTypeId:
            typeof rule.skinType === 'object' && rule.skinType && 'id' in rule.skinType
              ? String(rule.skinType.id)
              : rule.skinType
                ? String(rule.skinType)
                : null,
          ruleType: rule.ruleType as 'require' | 'forbid' | 'warn',
        }))
        .filter((rule) => normalizedSteps.some((step) => step.routineStepId === rule.routineStepId))

      const ruleIds = new Set(stepRuleList.map((rule) => rule.id).filter(Boolean) as string[])
      initialRuleIds.current = ruleIds
      setRules(stepRuleList)

      setStepOptions(
        (stepsResult.docs ?? []).map((step: any) => ({
          id: String(step.id),
          label:
            typeof step.name === 'string'
              ? step.name
              : typeof step?.name === 'object' && step.name
                ? (step.name as Record<string, string>)[resolvedLocale || 'it'] ??
                  Object.values(step.name as Record<string, string>)[0]
                : String(step.slug ?? step.id),
          slug: typeof step.slug === 'string' ? step.slug : undefined,
        })),
      )

      setTimings(
        (timingsResult.docs ?? []).map((timing: any) => ({
          id: String(timing.id),
          label:
            typeof timing.name === 'string'
              ? timing.name
              : typeof timing?.name === 'object' && timing.name
                ? (timing.name as Record<string, string>)[resolvedLocale || 'it'] ??
                  Object.values(timing.name as Record<string, string>)[0]
                : String(timing.slug ?? timing.id),
        })),
      )

      setSkinTypes(
        (skinTypesResult.docs ?? []).map((skin: any) => ({
          id: String(skin.id),
          label:
            typeof skin.name === 'string'
              ? skin.name
              : typeof skin?.name === 'object' && skin.name
                ? (skin.name as Record<string, string>)[resolvedLocale || 'it'] ??
                  Object.values(skin.name as Record<string, string>)[0]
                : String(skin.slug ?? skin.id),
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
