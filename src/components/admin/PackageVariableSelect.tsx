'use client'

import { useEffect, useMemo } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

type VariableRow = {
  varNome?: string | null
}

type PackageVariableSelectProps = {
  path?: string
  field?: {
    label?: string
  }
}

const readVariables = (value: unknown): VariableRow[] => {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is VariableRow => Boolean(item) && typeof item === 'object')
}

const findVariablesInFormFields = (
  fields: Record<string, { value?: unknown }> | undefined,
  path?: string,
) => {
  if (!fields || typeof fields !== 'object') return []

  const direct = readVariables(fields?.variabili?.value)
  if (direct.length > 0) return direct

  for (const [key, field] of Object.entries(fields)) {
    if (!key.endsWith('variabili')) continue
    const parsed = readVariables(field?.value)
    if (parsed.length > 0) return parsed
  }

  const rootPrefix = (() => {
    if (!path) return ''
    const match = path.match(/^(.*?)(?:\.)?pacchetti\.\d+\.collegaAVariabile$/)
    return match?.[1] ? `${match[1]}.` : ''
  })()

  const map = new Map<number, VariableRow>()
  const expr = new RegExp(
    `^${rootPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}variabili\\.(\\d+)\\.varNome$`,
  )

  for (const [key, field] of Object.entries(fields)) {
    const match = key.match(expr)
    if (!match) continue
    const index = Number(match[1])
    if (!Number.isFinite(index)) continue
    const current = map.get(index) ?? {}
    const value = field?.value
    map.set(index, {
      ...current,
      varNome: typeof value === 'string' ? value : null,
    })
  }

  if (map.size > 0) {
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value)
  }

  return []
}

const findDefaultNameInFormFields = (fields: Record<string, { value?: unknown }> | undefined) => {
  if (!fields || typeof fields !== 'object') return ''

  const direct = fields?.nomeVariabile?.value
  if (typeof direct === 'string' && direct.trim()) return direct.trim()

  for (const [key, field] of Object.entries(fields)) {
    if (!key.endsWith('nomeVariabile')) continue
    const value = field?.value
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}

export default function PackageVariableSelect(props: PackageVariableSelectProps) {
  const path = typeof props?.path === 'string' ? props.path : ''
  const label = typeof props?.field?.label === 'string' ? props.field.label : 'Collega a'

  const { value, setValue } = useField<string>({ path })
  const fields = useFormFields(([formFields]) => formFields)

  const options = useMemo(() => {
    const defaultName = findDefaultNameInFormFields(fields as Record<string, { value?: unknown }>)
    const base = [{ label: defaultName || 'Default', value: 'default' }]
    const vars = findVariablesInFormFields(
      fields as Record<string, { value?: unknown }>,
      path,
    )

    vars.forEach((item, index) => {
      const name = typeof item?.varNome === 'string' ? item.varNome.trim() : ''
      base.push({
        label: name || `Variabile ${index + 1}`,
        value: `variabile:${index}`,
      })
    })

    return base
  }, [fields, path])

  const resolvedValue = typeof value === 'string' && value.trim() ? value : 'default'
  const selectedExists = options.some((option) => option.value === resolvedValue)
  const selectedValue = selectedExists ? resolvedValue : 'default'

  useEffect(() => {
    if (selectedValue !== resolvedValue) {
      setValue(selectedValue)
    }
  }, [resolvedValue, selectedValue, setValue])

  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</label>
      <select
        value={selectedValue}
        onChange={(event) => setValue(event.target.value)}
        style={{
          width: '100%',
          minHeight: '40px',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-250)',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-text)',
          padding: '0.5rem 0.65rem',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
