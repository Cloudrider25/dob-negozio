'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDocumentInfo, useLocale } from '@payloadcms/ui'

type ApiDoc = Record<string, unknown>
type ApiListResponse = { docs?: ApiDoc[] }

type Row = {
  id: string
  orderNumber: string
  createdAt: string
  serviceTitle: string
  itemKind: 'service' | 'package'
  variantLabel: string
  quantity: number
  lineTotal: number | null
  appointmentStatus: string
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')
const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null)
const asId = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return ''
}

const formatMoney = (value: number | null) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
    : '—'

export default function AnagServicesPurchasesList() {
  const documentInfo = useDocumentInfo()
  const locale = useLocale()
  const anagraficaId = documentInfo?.id ? String(documentInfo.id) : ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    if (!anagraficaId) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const docRes = await fetch(`/api/anagrafiche/${anagraficaId}?depth=0`, { credentials: 'include' })
        if (!docRes.ok) throw new Error(`Anagrafica load failed: ${docRes.status}`)
        const anagDoc = (await docRes.json()) as ApiDoc
        const customerId = asId(anagDoc.customer)
        if (!customerId) {
          if (!cancelled) setRows([])
          return
        }

        const params = new URLSearchParams()
        params.set('depth', '1')
        params.set('limit', '200')
        params.set('sort', '-createdAt')
        if (locale) params.set('locale', String(locale))
        params.append('where[order.customer][equals]', customerId)

        const res = await fetch(`/api/order-service-items?${params.toString()}`, { credentials: 'include' })
        if (!res.ok) throw new Error(`Order service items request failed: ${res.status}`)
        const data = (await res.json()) as ApiListResponse
        if (cancelled) return

        const nextRows: Row[] = (data.docs ?? []).map((doc) => {
          const order = (doc.order && typeof doc.order === 'object' ? (doc.order as ApiDoc) : null) ?? null
          return {
            id: asId(doc.id),
            orderNumber: asString(order?.orderNumber) || `#${asId(doc.order)}`,
            createdAt: asString(order?.createdAt),
            serviceTitle: asString(doc.serviceTitle) || 'Servizio',
            itemKind: asString(doc.itemKind) === 'package' ? 'package' : 'service',
            variantLabel: asString(doc.variantLabel),
            quantity: asNumber(doc.quantity) ?? 1,
            lineTotal: asNumber(doc.lineTotal),
            appointmentStatus: asString(doc.appointmentStatus) || 'none',
          }
        })

        setRows(nextRows)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Errore caricamento servizi acquistati')
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
  }, [anagraficaId, locale])

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + (typeof row.lineTotal === 'number' ? row.lineTotal : 0), 0),
    [rows],
  )

  if (!anagraficaId) return <div style={{ color: 'var(--theme-text)' }}>Salva l&apos;anagrafica per vedere i servizi.</div>
  if (loading) return <div style={{ color: 'var(--theme-text)' }}>Caricamento servizi acquistati…</div>
  if (error) return <div style={{ color: 'var(--theme-error-500, #d14343)' }}>{error}</div>

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {rows.length === 0 ? (
        <div style={{ color: 'var(--theme-text)' }}>Nessun servizio acquistato per questo cliente.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 0,
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {rows.map((row) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '0.75rem',
                alignItems: 'center',
                padding: '0.7rem 0.9rem',
                borderBottom: '1px solid var(--theme-elevation-100)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--theme-text)' }}>{row.serviceTitle}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--theme-elevation-650)' }}>
                  {row.itemKind === 'package' ? 'Pacchetto' : 'Servizio'}
                  {row.variantLabel ? ` · ${row.variantLabel}` : ''}
                  {` · ${row.orderNumber}`}
                  {row.createdAt ? ` · ${new Date(row.createdAt).toLocaleDateString('it-IT')}` : ''}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-650)' }}>
                  Stato appuntamento: {row.appointmentStatus || 'none'}
                </div>
              </div>
              <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>{formatMoney(row.lineTotal)}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ color: 'var(--theme-elevation-700)', fontSize: '0.9rem' }}>
        Totale storico servizi: <strong>{formatMoney(total)}</strong>
      </div>
    </div>
  )
}

