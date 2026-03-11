'use client'

import { useEffect, useMemo } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

type ProgramComputedPriceFieldProps = {
  path?: string
  field?: {
    label?: string
    admin?: {
      description?: string
    }
  }
}

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
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

const roundCurrency = (value: number) => Number(value.toFixed(2))

export default function ProgramComputedPriceField(props: ProgramComputedPriceFieldProps) {
  const path = typeof props?.path === 'string' ? props.path : ''
  const label = typeof props?.field?.label === 'string' ? props.field.label : 'Nuovo prezzo'
  const description =
    typeof props?.field?.admin?.description === 'string' ? props.field.admin.description : ''

  const { value, setValue } = useField<number | null>({ path })
  const fields = useFormFields(([formFields]) => formFields) as Record<
    string,
    { value?: unknown }
  >

  const fieldPaths = useMemo(() => {
    const root = path.includes('.') ? path.slice(0, path.lastIndexOf('.') + 1) : ''
    return {
      basePricePath: `${root}basePrice`,
      discountTypePath: `${root}discountType`,
      discountValuePath: `${root}discountValue`,
    }
  }, [path])

  const basePrice = toNumberOrNull(getFieldValue(fields, fieldPaths.basePricePath, 'basePrice')) ?? 0
  const discountTypeRaw = getFieldValue(fields, fieldPaths.discountTypePath, 'discountType')
  const discountType = discountTypeRaw === 'amount' ? 'amount' : 'percent'
  const discountValue = toNumberOrNull(
    getFieldValue(fields, fieldPaths.discountValuePath, 'discountValue'),
  )

  const computedValue = useMemo(() => {
    const safeDiscountValue = discountValue === null || discountValue < 0 ? 0 : discountValue
    const discountAmount =
      discountType === 'amount'
        ? safeDiscountValue
        : (basePrice * Math.min(safeDiscountValue, 100)) / 100

    return roundCurrency(Math.max(basePrice - discountAmount, 0))
  }, [basePrice, discountType, discountValue])

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
      {description ? <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>{description}</div> : null}
    </div>
  )
}
