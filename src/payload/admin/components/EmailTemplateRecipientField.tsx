'use client'

import { useEffect } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

const normalizeText = (value: unknown) => (typeof value === 'string' ? value : '')

export default function EmailTemplateRecipientField(props: {
  path?: string
  field?: {
    label?: string
  }
}) {
  const path = typeof props?.path === 'string' ? props.path : 'recipientOverride'
  const label = typeof props?.field?.label === 'string' ? props.field.label : 'Recipient'
  const { value, setValue } = useField<string>({ path })
  const { channel, eventKey } = useFormFields(([fields]) => ({
    channel: fields.channel?.value,
    eventKey: fields.eventKey?.value,
  }))

  const normalizedChannel = normalizeText(channel)
  const isCustomer = normalizedChannel === 'customer'
  const autoRecipient =
    normalizeText(eventKey) === 'email_verification_requested' ||
    normalizeText(eventKey) === 'password_reset_requested'
      ? '{{user.email}}'
      : '{{customer.email}}'

  useEffect(() => {
    if (!isCustomer) return
    if (!value) return
    setValue('')
  }, [isCustomer, setValue, value])

  if (isCustomer) {
    return (
      <div style={{ display: 'grid', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</label>
        <input
          type="text"
          value={autoRecipient}
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
            opacity: 0.8,
          }}
        />
        <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>
          Automatico dal destinatario runtime per i template customer.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</label>
      <input
        type="email"
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => setValue(event.target.value)}
        placeholder="vendite@dobmilano.com"
        style={{
          width: '100%',
          minHeight: '40px',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-250)',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-text)',
          padding: '0.5rem 0.65rem',
        }}
      />
      <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>
        Se valorizzato, overridea il destinatario admin/internal calcolato dal backend.
      </div>
    </div>
  )
}
