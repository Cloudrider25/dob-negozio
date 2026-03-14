'use client'

import { useEffect, useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'

import {
  EMAIL_DELIVERY_MODE_OPTIONS,
  EMAIL_POLICY_LOCALES,
  type EmailDeliveryMode,
  type EmailPolicyLocale,
} from '@/lib/server/email/deliveryPolicy'
import {
  EMAIL_EVENT_OPTIONS,
  type EmailEventKey,
  getEmailEventMeta,
  getEmailTemplateTypeLabel,
} from '@/lib/server/email/events'

type PolicyRow = {
  eventKey: EmailEventKey
  recipientOverride?: string
  deliveryModeIt: EmailDeliveryMode
  deliveryModeEn: EmailDeliveryMode
  deliveryModeRu: EmailDeliveryMode
}

type CoverageMap = Record<EmailEventKey, Record<EmailPolicyLocale, boolean>>

const emptyCoverage = EMAIL_EVENT_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = { it: false, en: false, ru: false }
    return acc
  },
  {} as CoverageMap,
)

const modeFieldByLocale: Record<EmailPolicyLocale, keyof PolicyRow> = {
  it: 'deliveryModeIt',
  en: 'deliveryModeEn',
  ru: 'deliveryModeRu',
}

const defaultModeByLocale: Record<EmailPolicyLocale, EmailDeliveryMode> = {
  it: 'template',
  en: 'fallback',
  ru: 'fallback',
}

const isValidMode = (value: unknown): value is EmailDeliveryMode =>
  EMAIL_DELIVERY_MODE_OPTIONS.some((option) => option.value === value)

const normalizePolicies = (value: unknown): PolicyRow[] => {
  const source = Array.isArray(value) ? value : []
  const byEvent = new Map<string, PolicyRow>()

  for (const row of source) {
    if (!row || typeof row !== 'object') continue
    const eventKey = 'eventKey' in row && typeof row.eventKey === 'string' ? row.eventKey : ''
    if (!EMAIL_EVENT_OPTIONS.some((option) => option.value === eventKey)) continue

    const legacyMode =
      'deliveryMode' in row && typeof row.deliveryMode === 'string' && isValidMode(row.deliveryMode)
        ? row.deliveryMode
        : undefined

    byEvent.set(eventKey, {
      eventKey: eventKey as EmailEventKey,
      recipientOverride:
        'recipientOverride' in row && typeof row.recipientOverride === 'string'
          ? row.recipientOverride
          : '',
      deliveryModeIt:
        'deliveryModeIt' in row && isValidMode(row.deliveryModeIt)
          ? row.deliveryModeIt
          : legacyMode || defaultModeByLocale.it,
      deliveryModeEn:
        'deliveryModeEn' in row && isValidMode(row.deliveryModeEn)
          ? row.deliveryModeEn
          : legacyMode || defaultModeByLocale.en,
      deliveryModeRu:
        'deliveryModeRu' in row && isValidMode(row.deliveryModeRu)
          ? row.deliveryModeRu
          : legacyMode || defaultModeByLocale.ru,
    })
  }

  return EMAIL_EVENT_OPTIONS.map((option) => (
    byEvent.get(option.value) || {
      eventKey: option.value,
      recipientOverride: '',
      deliveryModeIt: defaultModeByLocale.it,
      deliveryModeEn: defaultModeByLocale.en,
      deliveryModeRu: defaultModeByLocale.ru,
    }
  ))
}

export default function EmailDeliveryPoliciesField(props: { path?: string }) {
  const { value, setValue } = useField<PolicyRow[]>({
    path: props.path || 'emailDeliveryPolicies',
  })
  const policies = useMemo(() => normalizePolicies(value), [value])
  const [coverage, setCoverage] = useState<CoverageMap>(emptyCoverage)
  const [coverageLoaded, setCoverageLoaded] = useState(false)
  const [selectedEventKeys, setSelectedEventKeys] = useState<EmailEventKey[]>([])
  const [bulkRecipient, setBulkRecipient] = useState('')
  const [bulkModeByLocale, setBulkModeByLocale] = useState<Record<EmailPolicyLocale, EmailDeliveryMode>>({
    it: 'template',
    en: 'fallback',
    ru: 'fallback',
  })

  useEffect(() => {
    if (JSON.stringify(value || []) === JSON.stringify(policies)) return
    setValue(policies)
  }, [policies, setValue, value])

  useEffect(() => {
    setSelectedEventKeys((current) =>
      current.filter((eventKey) => policies.some((row) => row.eventKey === eventKey)),
    )
  }, [policies])

  useEffect(() => {
    let cancelled = false

    const loadCoverage = async () => {
      const response = await fetch('/api/email-templates?limit=500&depth=0', {
        credentials: 'same-origin',
      })
      if (!response.ok) {
        if (!cancelled) setCoverageLoaded(true)
        return
      }

      const result = (await response.json()) as {
        docs?: Array<{ eventKey?: string; locale?: string; active?: boolean }>
      }

      const nextCoverage = EMAIL_EVENT_OPTIONS.reduce(
        (acc, option) => {
          acc[option.value] = { it: false, en: false, ru: false }
          return acc
        },
        {} as CoverageMap,
      )

      for (const doc of result.docs || []) {
        if (!doc.active) continue
        if (
          typeof doc.eventKey !== 'string' ||
          !EMAIL_EVENT_OPTIONS.some((option) => option.value === doc.eventKey)
        ) {
          continue
        }
        if (doc.locale !== 'it' && doc.locale !== 'en' && doc.locale !== 'ru') continue
        nextCoverage[doc.eventKey as EmailEventKey] = {
          ...nextCoverage[doc.eventKey as EmailEventKey],
          [doc.locale]: true,
        }
      }

      if (!cancelled) {
        setCoverage(nextCoverage)
        setCoverageLoaded(true)
      }
    }

    void loadCoverage()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!coverageLoaded) return

    const normalizedByCoverage = policies.map((row) => {
      let changed = false
      const nextRow: PolicyRow = { ...row }

      if (nextRow.deliveryModeIt === 'template' && !coverage[row.eventKey].it) {
        nextRow.deliveryModeIt = 'fallback'
        changed = true
      }
      if (nextRow.deliveryModeEn === 'template' && !coverage[row.eventKey].en) {
        nextRow.deliveryModeEn = 'fallback'
        changed = true
      }
      if (nextRow.deliveryModeRu === 'template' && !coverage[row.eventKey].ru) {
        nextRow.deliveryModeRu = 'fallback'
        changed = true
      }

      return changed ? nextRow : row
    })

    if (JSON.stringify(normalizedByCoverage) !== JSON.stringify(policies)) {
      setValue(normalizedByCoverage)
    }
  }, [coverage, coverageLoaded, policies, setValue])

  const setMode = (eventKey: EmailEventKey, locale: EmailPolicyLocale, nextMode: EmailDeliveryMode) => {
    setValue(
      policies.map((row) =>
        row.eventKey === eventKey
          ? {
              ...row,
              [modeFieldByLocale[locale]]: nextMode,
            }
          : row,
      ),
    )
  }

  const setRecipient = (eventKey: EmailEventKey, nextRecipient: string) => {
    setValue(
      policies.map((row) =>
        row.eventKey === eventKey ? { ...row, recipientOverride: nextRecipient } : row,
      ),
    )
  }

  const canOverrideRecipient = (eventKey: EmailEventKey) =>
    getEmailEventMeta(eventKey).supportedChannels.some(
      (channel) => channel === 'admin' || channel === 'internal',
    )

  const toggleRowSelection = (eventKey: EmailEventKey) => {
    setSelectedEventKeys((current) =>
      current.includes(eventKey)
        ? current.filter((value) => value !== eventKey)
        : [...current, eventKey],
    )
  }

  const toggleSelectAll = () => {
    setSelectedEventKeys((current) =>
      current.length === policies.length ? [] : policies.map((row) => row.eventKey),
    )
  }

  const applyBulkRecipient = () => {
    if (!selectedEventKeys.length) return

    setValue(
      policies.map((row) =>
        selectedEventKeys.includes(row.eventKey) && canOverrideRecipient(row.eventKey)
          ? { ...row, recipientOverride: bulkRecipient }
          : row,
      ),
    )
  }

  const applyBulkMode = (locale: EmailPolicyLocale) => {
    if (!selectedEventKeys.length) return

    const nextMode = bulkModeByLocale[locale]

    setValue(
      policies.map((row) => {
        if (!selectedEventKeys.includes(row.eventKey)) return row
        if (nextMode === 'template' && !coverage[row.eventKey][locale]) return row

        if (locale === 'it') {
          return {
            ...row,
            deliveryModeIt: nextMode,
          }
        }
        if (locale === 'en') {
          return {
            ...row,
            deliveryModeEn: nextMode,
          }
        }

        return {
          ...row,
          deliveryModeRu: nextMode,
        }
      }),
    )
  }

  const allSelected = policies.length > 0 && selectedEventKeys.length === policies.length

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-l)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          padding: '12px 14px',
          background: 'var(--theme-elevation-25)',
          borderBottom: '1px solid var(--theme-elevation-150)',
        }}
      >
        <div style={{ fontSize: '0.82rem', color: 'var(--theme-text)' }}>
          {selectedEventKeys.length} righe selezionate
        </div>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'minmax(14rem, 1.4fr) repeat(3, minmax(10rem, 1fr))',
            alignItems: 'end',
          }}
        >
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Bulk Recipient</label>
            <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr auto' }}>
              <input
                type="email"
                value={bulkRecipient}
                onChange={(event) => setBulkRecipient(event.target.value)}
                placeholder="vendite@dobmilano.com"
                style={{
                  width: '100%',
                  minHeight: '40px',
                  borderRadius: 'var(--style-radius-m)',
                  border: '1px solid var(--theme-elevation-200)',
                  background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text)',
                  padding: '0.5rem 0.75rem',
                }}
              />
              <button
                type="button"
                onClick={applyBulkRecipient}
                disabled={!selectedEventKeys.length}
                style={{
                  minHeight: '40px',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--style-radius-m)',
                  border: '1px solid var(--theme-elevation-200)',
                  background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text)',
                  cursor: selectedEventKeys.length ? 'pointer' : 'not-allowed',
                  opacity: selectedEventKeys.length ? 1 : 0.55,
                }}
              >
                Apply
              </button>
            </div>
          </div>
          {EMAIL_POLICY_LOCALES.map((locale) => (
            <div key={locale} style={{ display: 'grid', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Bulk {locale.toUpperCase()}
              </label>
              <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr auto' }}>
                <select
                  value={bulkModeByLocale[locale]}
                  onChange={(event) =>
                    setBulkModeByLocale((current) => ({
                      ...current,
                      [locale]: event.target.value as EmailDeliveryMode,
                    }))
                  }
                  style={{
                    width: '100%',
                    minHeight: '40px',
                    borderRadius: 'var(--style-radius-m)',
                    border: '1px solid var(--theme-elevation-200)',
                    background: 'var(--theme-elevation-0)',
                    color: 'var(--theme-text)',
                    padding: '0.5rem 0.75rem',
                  }}
                >
                  {EMAIL_DELIVERY_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => applyBulkMode(locale)}
                  disabled={!selectedEventKeys.length}
                  style={{
                    minHeight: '40px',
                    padding: '0.5rem 0.9rem',
                    borderRadius: 'var(--style-radius-m)',
                    border: '1px solid var(--theme-elevation-200)',
                    background: 'var(--theme-elevation-0)',
                    color: 'var(--theme-text)',
                    cursor: selectedEventKeys.length ? 'pointer' : 'not-allowed',
                    opacity: selectedEventKeys.length ? 1 : 0.55,
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--theme-elevation-50)' }}>
            <th style={{ textAlign: 'center', padding: '12px 14px', width: '52px' }}>
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
            </th>
            <th style={{ textAlign: 'left', padding: '12px 14px' }}>Event Key</th>
            <th style={{ textAlign: 'left', padding: '12px 14px' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '12px 14px' }}>Recipient</th>
            {EMAIL_POLICY_LOCALES.map((locale) => (
              <th
                key={locale}
                style={{ textAlign: 'left', padding: '12px 14px' }}
              >
                {locale.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {policies.map((row) => (
            <tr key={row.eventKey} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
              <td style={{ textAlign: 'center', padding: '12px 14px' }}>
                <input
                  type="checkbox"
                  checked={selectedEventKeys.includes(row.eventKey)}
                  onChange={() => toggleRowSelection(row.eventKey)}
                />
              </td>
              <td style={{ padding: '12px 14px' }}>
                <code>{row.eventKey}</code>
              </td>
              <td style={{ padding: '12px 14px' }}>
                {getEmailTemplateTypeLabel(getEmailEventMeta(row.eventKey).type)}
              </td>
              <td style={{ padding: '12px 14px' }}>
                {!canOverrideRecipient(row.eventKey) ? (
                  <input
                    type="text"
                    value="Automatic"
                    readOnly
                    tabIndex={-1}
                    style={{
                      width: '100%',
                      minWidth: '11rem',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--theme-elevation-200)',
                      borderRadius: 'var(--style-radius-m)',
                      background: 'var(--theme-elevation-50)',
                      color: 'var(--theme-text)',
                      opacity: 0.8,
                    }}
                  />
                ) : (
                  <input
                    type="email"
                    value={row.recipientOverride || ''}
                    onChange={(event) => setRecipient(row.eventKey, event.target.value)}
                    placeholder="vendite@dobmilano.com"
                    style={{
                      width: '100%',
                      minWidth: '13rem',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--theme-elevation-200)',
                      borderRadius: 'var(--style-radius-m)',
                      background: 'var(--theme-elevation-0)',
                      color: 'var(--theme-text)',
                    }}
                  />
                )}
              </td>
              {EMAIL_POLICY_LOCALES.map((locale) => {
                const currentMode = row[modeFieldByLocale[locale]]
                const hasTemplate = coverageLoaded ? coverage[row.eventKey][locale] : true

                return (
                  <td key={locale} style={{ padding: '12px 14px' }}>
                    <select
                      value={currentMode}
                      onChange={(event) =>
                        setMode(row.eventKey, locale, event.target.value as EmailDeliveryMode)
                      }
                      style={{
                        width: '100%',
                        minWidth: '11rem',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--theme-elevation-200)',
                        borderRadius: 'var(--style-radius-m)',
                        background: 'var(--theme-elevation-0)',
                        color: 'var(--theme-text)',
                      }}
                    >
                      {EMAIL_DELIVERY_MODE_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          disabled={option.value === 'template' && !hasTemplate}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
