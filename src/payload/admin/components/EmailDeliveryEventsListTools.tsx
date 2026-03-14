'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  EMAIL_EVENT_OPTIONS,
  getEmailTemplateTypeLabel,
  getEmailEventMeta,
  type EmailEventKey,
} from '@/lib/server/email/events'

type EmailDeliveryEventRow = {
  id: number | string
  eventKey?: EmailEventKey
  to?: string
  status?: string
  errorMessage?: string
  createdAt?: string
}

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Failed', value: 'failed' },
  { label: 'Sent', value: 'sent' },
  { label: 'Skipped', value: 'skipped' },
  { label: 'Queued', value: 'queued' },
] as const

const inputStyle: CSSProperties = {
  width: '100%',
  minHeight: '40px',
  borderRadius: 'var(--style-radius-m)',
  border: '1px solid var(--theme-elevation-200)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-text)',
  padding: '0.5rem 0.75rem',
}

const cardStyle: CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-l)',
  background: 'var(--theme-elevation-0)',
}

const formatDateTime = (value?: string) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}

export default function EmailDeliveryEventsListTools() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams?.toString() || ''

  const [eventKey, setEventKey] = useState(searchParams?.get('where[eventKey][equals]') || '')
  const [status, setStatus] = useState(searchParams?.get('where[status][equals]') || '')
  const [recipient, setRecipient] = useState(searchParams?.get('where[to][like]') || '')
  const [recentFailures, setRecentFailures] = useState<EmailDeliveryEventRow[]>([])

  useEffect(() => {
    setEventKey(searchParams?.get('where[eventKey][equals]') || '')
    setStatus(searchParams?.get('where[status][equals]') || '')
    setRecipient(searchParams?.get('where[to][like]') || '')
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    const loadFailures = async () => {
      const response = await fetch(
        '/api/email-delivery-events?limit=5&sort=-createdAt&where[status][equals]=failed&depth=0',
        { credentials: 'same-origin' },
      )

      if (!response.ok) return

      const result = (await response.json()) as { docs?: EmailDeliveryEventRow[] }
      if (!cancelled) {
        setRecentFailures(Array.isArray(result.docs) ? result.docs : [])
      }
    }

    void loadFailures()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedType = useMemo(() => {
    if (!eventKey || !EMAIL_EVENT_OPTIONS.some((option) => option.value === eventKey)) return ''
    return getEmailTemplateTypeLabel(getEmailEventMeta(eventKey as EmailEventKey).type)
  }, [eventKey])

  const applyFilters = () => {
    const next = new URLSearchParams(searchParamsString)

    next.delete('page')
    next.delete('where[eventKey][equals]')
    next.delete('where[status][equals]')
    next.delete('where[to][like]')

    if (eventKey) next.set('where[eventKey][equals]', eventKey)
    if (status) next.set('where[status][equals]', status)
    if (recipient.trim()) next.set('where[to][like]', recipient.trim())

    const query = next.toString()
    const basePath = pathname || ''
    router.push(query ? `${basePath}?${query}` : basePath)
  }

  const clearFilters = () => {
    const next = new URLSearchParams(searchParamsString)
    next.delete('page')
    next.delete('where[eventKey][equals]')
    next.delete('where[status][equals]')
    next.delete('where[to][like]')
    const query = next.toString()
    const basePath = pathname || ''
    router.push(query ? `${basePath}?${query}` : basePath)
  }

  return (
    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
      <div
        style={{
          ...cardStyle,
          display: 'grid',
          gap: '0.9rem',
          padding: '14px',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--theme-text)' }}>Email Delivery Filters</div>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'minmax(14rem, 1.2fr) minmax(10rem, 0.8fr) minmax(16rem, 1fr) auto auto',
            alignItems: 'end',
          }}
        >
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Event Key</label>
            <select value={eventKey} onChange={(event) => setEventKey(event.target.value)} style={inputStyle}>
              <option value="">All events</option>
              {EMAIL_EVENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Type</label>
            <input type="text" value={selectedType || 'All'} readOnly style={{ ...inputStyle, background: 'var(--theme-elevation-50)' }} />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Recipient</label>
            <input
              type="text"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="vendite@dobmilano.com"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} style={inputStyle}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            style={{
              minHeight: '40px',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--style-radius-m)',
              border: '1px solid var(--theme-elevation-200)',
              background: 'var(--theme-elevation-0)',
              color: 'var(--theme-text)',
            }}
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              minHeight: '40px',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--style-radius-m)',
              border: '1px solid var(--theme-elevation-200)',
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          display: 'grid',
          gap: '0.75rem',
          padding: '14px',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--theme-text)' }}>Latest Failures</div>
        {recentFailures.length === 0 ? (
          <div style={{ color: 'var(--theme-text)' }}>No recent failures.</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {recentFailures.map((item) => (
              <div
                key={String(item.id)}
                style={{
                  border: '1px solid var(--theme-elevation-100)',
                  borderRadius: 'var(--style-radius-m)',
                  padding: '10px 12px',
                  background: 'var(--theme-elevation-25)',
                }}
              >
                <div style={{ display: 'grid', gap: '0.2rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--theme-text)' }}>
                    {item.eventKey || 'unknown-event'} {'->'} {item.to || 'missing-recipient'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--theme-text)' }}>
                    {item.status || 'failed'} · {formatDateTime(item.createdAt)}
                  </div>
                  {item.errorMessage ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--theme-text)' }}>{item.errorMessage}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
