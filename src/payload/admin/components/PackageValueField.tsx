'use client'

import { useEffect, useMemo } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

type PackageValueFieldProps = {
  path?: string
  field?: {
    label?: string
    admin?: {
      description?: string
    }
  }
}

const getFieldValue = (
  fields: Record<string, { value?: unknown }> | undefined,
  exactPath?: string,
  endsWithPath?: string,
) => {
  if (!fields || typeof fields !== 'object') return undefined
  if (exactPath && exactPath in fields) return fields[exactPath]?.value
  if (endsWithPath) {
    const suffix = `.${endsWithPath}`
    for (const [key, field] of Object.entries(fields)) {
      if (key === endsWithPath || key.endsWith(suffix)) return field?.value
    }
  }
  return undefined
}

export default function PackageValueField(props: PackageValueFieldProps) {
  const path = typeof props?.path === 'string' ? props.path : ''
  const label = typeof props?.field?.label === 'string' ? props.field.label : 'Valore pacchetto'
  const description =
    typeof props?.field?.admin?.description === 'string' ? props.field.admin.description : ''

  const { value, setValue } = useField<number | null>({ path })
  const fields = useFormFields(([formFields]) => formFields) as Record<
    string,
    { value?: unknown }
  >

  const rowPaths = useMemo(() => {
    const match = path.match(/^(.*?)(?:\.)?pacchetti\.(\d+)\.valorePacchetto$/)
    const root = match?.[1] ? `${match[1]}.` : ''
    const index = match?.[2] ?? null
    if (index === null) {
      return {
        sessionsPath: path.replace(/[^.]+$/, 'numeroSedute'),
        selectedVariantPath: path.replace(/[^.]+$/, 'collegaAVariabile'),
        defaultPricePath: `${root}price`,
        root,
      }
    }
    return {
      sessionsPath: `${root}pacchetti.${index}.numeroSedute`,
      selectedVariantPath: `${root}pacchetti.${index}.collegaAVariabile`,
      defaultPricePath: `${root}price`,
      root,
    }
  }, [path])

  const sessions = toNumberOrNull(getFieldValue(fields, rowPaths.sessionsPath, 'numeroSedute'))
  const selectedVariantRaw = getFieldValue(fields, rowPaths.selectedVariantPath, 'collegaAVariabile')
  const selectedVariant =
    typeof selectedVariantRaw === 'string' && selectedVariantRaw.trim()
      ? selectedVariantRaw.trim()
      : 'default'

  const defaultPrice = toNumberOrNull(getFieldValue(fields, rowPaths.defaultPricePath, 'price'))

  const variantPrice = useMemo(() => {
    const match = selectedVariant.match(/^variabile:(\d+)$/)
    if (!match) return null
    const variantIndex = Number(match[1])
    if (!Number.isFinite(variantIndex)) return null

    const exactPath = `${rowPaths.root}variabili.${variantIndex}.varPrice`
    const endsWithPath = `variabili.${variantIndex}.varPrice`
    return toNumberOrNull(getFieldValue(fields, exactPath, endsWithPath))
  }, [fields, rowPaths.root, selectedVariant])

  const sourcePrice = selectedVariant === 'default' ? defaultPrice : variantPrice

  const computedValue = useMemo(() => {
    if (sourcePrice === null || sessions === null) return null
    if (sessions < 0 || sourcePrice < 0) return null
    return Number((sourcePrice * sessions).toFixed(2))
  }, [sourcePrice, sessions])

  const resolvedDescription =
    selectedVariant === 'default'
      ? 'Calcolato automaticamente: Default Price * Numero sedute'
      : 'Calcolato automaticamente: Price della variation * Numero sedute'

  useEffect(() => {
    if (value === computedValue) return
    setValue(computedValue)
  }, [computedValue, setValue, value])

  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</label>
      <input
        type="number"
        value={typeof value === 'number' ? value : ''}
        readOnly
        tabIndex={-1}
        style={{
          width: '100%',
          minHeight: '40px',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-250)',
          background: 'var(--theme-elevation-50)',
          color: 'var(--theme-text)',
          padding: '0.5rem 0.65rem',
        }}
      />
      {description || resolvedDescription ? (
        <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>
          {description || resolvedDescription}
        </div>
      ) : null}
    </div>
  )
}
