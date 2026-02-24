'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDocumentInfo, useLocale } from '@payloadcms/ui'

type ApiDoc = Record<string, unknown>
type ApiListResponse = { docs?: ApiDoc[] }

type Row = {
  id: string
  title: string
  itemKind: 'service' | 'package'
  quantity: number
  unitPrice: number | null
  lineTotal: number | null
  variantLabel: string | null
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')
const asId = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return ''
}
const asNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const formatMoney = (value: number | null) => {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

export default function OrderServiceItemsList() {
  const documentInfo = useDocumentInfo()
  const locale = useLocale()
  const orderId = documentInfo?.id ? String(documentInfo.id) : ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    if (!orderId) {
      setRows([])
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('depth', '0')
        params.set('limit', '200')
        params.set('sort', '-createdAt')
        if (locale) params.set('locale', String(locale))
        params.append('where[order][equals]', orderId)

        const res = await fetch(`/api/order-service-items?${params.toString()}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = (await res.json()) as ApiListResponse
        if (cancelled) return

        const nextRows: Row[] = (data.docs ?? []).map((doc) => ({
          id: asId(doc.id),
          title: asString(doc.serviceTitle) || 'Service item',
          itemKind: asString(doc.itemKind) === 'package' ? 'package' : 'service',
          quantity: asNumber(doc.quantity) ?? 1,
          unitPrice: asNumber(doc.unitPrice),
          lineTotal: asNumber(doc.lineTotal),
          variantLabel: asString(doc.variantLabel) || null,
        }))

        setRows(nextRows)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Errore caricamento service items')
          setRows([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [orderId, locale])

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + (typeof row.lineTotal === 'number' ? row.lineTotal : 0), 0),
    [rows],
  )

  if (!orderId) {
    return <div style={{ color: 'var(--theme-text)' }}>Salva l&apos;ordine per vedere i service items.</div>
  }

  if (loading) {
    return <div style={{ color: 'var(--theme-text)' }}>Caricamento service items…</div>
  }

  if (error) {
    return <div style={{ color: 'var(--theme-error-500, #d14343)' }}>{error}</div>
  }

  if (rows.length === 0) {
    return <div style={{ color: 'var(--theme-text)' }}>Nessun service item per questo ordine.</div>
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div
        style={{
          display: 'grid',
          gap: '0.5rem',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {rows.map((row) => (
          <div
            key={row.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '0.75rem',
              alignItems: 'center',
              padding: '0.75rem 0.9rem',
              borderBottom: '1px solid var(--theme-elevation-100)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--theme-text)' }}>{row.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--theme-elevation-650)' }}>
                {row.itemKind === 'package' ? 'Pacchetto' : 'Servizio'}
                {row.variantLabel ? ` · ${row.variantLabel}` : ''}
              </div>
            </div>
            <div style={{ color: 'var(--theme-text)', whiteSpace: 'nowrap' }}>x{row.quantity}</div>
            <div style={{ color: 'var(--theme-text)', whiteSpace: 'nowrap' }}>{formatMoney(row.lineTotal)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', color: 'var(--theme-text)' }}>
        <strong>Totale service items:</strong>
        <span>{formatMoney(total)}</span>
      </div>
    </div>
  )
}

