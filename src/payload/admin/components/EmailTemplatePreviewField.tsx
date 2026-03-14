'use client'

import { useFormFields } from '@payloadcms/ui'

const normalizeText = (value: unknown) => (typeof value === 'string' ? value : '')

const normalizeScalar = (value: unknown): string => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map((item) => normalizeScalar(item)).filter(Boolean).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return ''
}

const flattenData = (value: Record<string, unknown>, prefix = ''): Record<string, string> => {
  const flat: Record<string, string> = {}

  for (const [key, currentValue] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${key}` : key

    if (
      currentValue &&
      typeof currentValue === 'object' &&
      !Array.isArray(currentValue) &&
      !(currentValue instanceof Date)
    ) {
      Object.assign(flat, flattenData(currentValue as Record<string, unknown>, nextKey))
      continue
    }

    flat[nextKey] = normalizeScalar(currentValue)
  }

  return flat
}

const renderTemplate = (template: string, data: Record<string, unknown>) => {
  const flat = flattenData(data)

  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, key) => {
    const normalizedKey = typeof key === 'string' ? key.trim() : ''
    return flat[normalizedKey] ?? ''
  })
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

export default function EmailTemplatePreviewField() {
  const values = useFormFields(([fields]) => ({
    subject: fields.subject?.value,
    html: fields.html?.value,
    testDataExample: fields.testDataExample?.value,
  }))

  const subject = normalizeText(values.subject)
  const html = normalizeText(values.html)
  const testData = asRecord(values.testDataExample)

  if (!html.trim()) {
    return (
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-m)',
          padding: '16px',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-text)',
        }}
      >
        Nessun HTML da mostrare.
      </div>
    )
  }

  const renderedSubject = subject ? renderTemplate(subject, testData) : ''
  const renderedHtml = renderTemplate(html, testData)

  return (
    <div
      style={{
        display: 'grid',
        gap: '12px',
      }}
    >
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-m)',
          padding: '16px',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-text)',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '8px',
          }}
        >
          Subject Preview
        </div>
        <div>{renderedSubject || 'Nessun subject disponibile.'}</div>
      </div>

      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-m)',
          padding: '16px',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-text)',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--theme-elevation-500)',
            marginBottom: '12px',
          }}
        >
          HTML Preview
        </div>
        <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      </div>
    </div>
  )
}
