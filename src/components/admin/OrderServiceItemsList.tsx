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
  appointmentStatus: string
  appointmentRequestedDate: string
  appointmentRequestedTime: string
  appointmentProposedDate: string
  appointmentProposedTime: string
  appointmentProposalNote: string
}

type SessionRow = {
  id: string
  orderServiceItemId: string
  sessionLabel: string
  sessionIndex: number
  appointmentStatus: string
  appointmentRequestedDate: string
  appointmentRequestedTime: string
  appointmentProposedDate: string
  appointmentProposedTime: string
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
  const [sessionRows, setSessionRows] = useState<SessionRow[]>([])
  const [savingRowId, setSavingRowId] = useState<string | null>(null)

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
          appointmentStatus: asString(doc.appointmentStatus) || 'none',
          appointmentRequestedDate: asString(doc.appointmentRequestedDate).slice(0, 10),
          appointmentRequestedTime: asString(doc.appointmentRequestedTime),
          appointmentProposedDate: asString(doc.appointmentProposedDate).slice(0, 10),
          appointmentProposedTime: asString(doc.appointmentProposedTime),
          appointmentProposalNote: asString(doc.appointmentProposalNote),
        }))

        setRows(nextRows)

        const sessionsParams = new URLSearchParams()
        sessionsParams.set('depth', '0')
        sessionsParams.set('limit', '1000')
        sessionsParams.set('sort', 'sessionIndex')
        params.get('locale') && sessionsParams.set('locale', params.get('locale') as string)
        sessionsParams.append('where[order][equals]', orderId)

        const sessionsRes = await fetch(`/api/order-service-sessions?${sessionsParams.toString()}`, {
          credentials: 'include',
        })
        if (sessionsRes.ok) {
          const sessionsData = (await sessionsRes.json()) as ApiListResponse
          const nextSessions: SessionRow[] = (sessionsData.docs ?? []).map((doc) => ({
            id: asId(doc.id),
            orderServiceItemId: asId(doc.orderServiceItem),
            sessionLabel: asString(doc.sessionLabel) || 'Seduta',
            sessionIndex: asNumber(doc.sessionIndex) ?? 1,
            appointmentStatus: asString(doc.appointmentStatus) || 'none',
            appointmentRequestedDate: asString(doc.appointmentRequestedDate).slice(0, 10),
            appointmentRequestedTime: asString(doc.appointmentRequestedTime),
            appointmentProposedDate: asString(doc.appointmentProposedDate).slice(0, 10),
            appointmentProposedTime: asString(doc.appointmentProposedTime),
          }))
          setSessionRows(nextSessions)
        } else {
          setSessionRows([])
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Errore caricamento service items')
          setRows([])
          setSessionRows([])
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

  const sessionsByItemId = useMemo(() => {
    const map = new Map<string, SessionRow[]>()
    for (const session of sessionRows) {
      const list = map.get(session.orderServiceItemId) ?? []
      list.push(session)
      map.set(session.orderServiceItemId, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sessionIndex - b.sessionIndex)
    }
    return map
  }, [sessionRows])

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const saveRow = async (row: Row) => {
    setSavingRowId(row.id)
    setError(null)
    try {
      const res = await fetch(`/api/order-service-items/${row.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentStatus: row.appointmentStatus || 'none',
          appointmentProposedDate: row.appointmentProposedDate || null,
          appointmentProposedTime: row.appointmentProposedTime || null,
          appointmentProposalNote: row.appointmentProposalNote || null,
        }),
      })
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore salvataggio service item')
    } finally {
      setSavingRowId(null)
    }
  }

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
              gap: '0.75rem',
              padding: '0.75rem 0.9rem',
              borderBottom: '1px solid var(--theme-elevation-100)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--theme-text)' }}>{row.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--theme-elevation-650)' }}>
                  {row.itemKind === 'package' ? 'Pacchetto' : 'Servizio'}
                  {row.variantLabel ? ` · ${row.variantLabel}` : ''}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-650)', marginTop: '0.25rem' }}>
                  Richiesto: {[row.appointmentRequestedDate, row.appointmentRequestedTime].filter(Boolean).join(' · ') || '—'}
                </div>
                {(sessionsByItemId.get(row.id) ?? []).length > 0 ? (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      display: 'grid',
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      color: 'var(--theme-elevation-650)',
                    }}
                  >
                    {(sessionsByItemId.get(row.id) ?? []).map((session) => (
                      <div key={session.id}>
                        {session.sessionLabel}: {session.appointmentStatus || 'none'} ·{' '}
                        {[session.appointmentProposedDate || session.appointmentRequestedDate, session.appointmentProposedTime || session.appointmentRequestedTime]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div style={{ color: 'var(--theme-text)', whiteSpace: 'nowrap' }}>x{row.quantity}</div>
              <div style={{ color: 'var(--theme-text)', whiteSpace: 'nowrap' }}>{formatMoney(row.lineTotal)}</div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1fr 1fr auto',
                gap: '0.5rem',
                alignItems: 'start',
              }}
            >
              <select
                value={row.appointmentStatus}
                onChange={(e) => updateRow(row.id, { appointmentStatus: e.target.value })}
                style={{
                  minHeight: '38px',
                  borderRadius: '8px',
                  border: '1px solid var(--theme-elevation-200)',
                  background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text)',
                  padding: '0.4rem 0.5rem',
                }}
              >
                <option value="none">Nessuno</option>
                <option value="pending">Pending</option>
                <option value="alternative_proposed">Alternativa proposta</option>
                <option value="confirmed">Confermato</option>
                <option value="confirmed_by_customer">Confermato da cliente</option>
              </select>
              <input
                type="date"
                value={row.appointmentProposedDate}
                onChange={(e) => updateRow(row.id, { appointmentProposedDate: e.target.value })}
                style={{
                  minHeight: '38px',
                  borderRadius: '8px',
                  border: '1px solid var(--theme-elevation-200)',
                  background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text)',
                  padding: '0.4rem 0.5rem',
                }}
              />
              <input
                type="time"
                value={row.appointmentProposedTime}
                onChange={(e) => updateRow(row.id, { appointmentProposedTime: e.target.value })}
                style={{
                  minHeight: '38px',
                  borderRadius: '8px',
                  border: '1px solid var(--theme-elevation-200)',
                  background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text)',
                  padding: '0.4rem 0.5rem',
                }}
              />
              <button
                type="button"
                onClick={() => void saveRow(row)}
                disabled={savingRowId === row.id}
                style={{
                  minHeight: '38px',
                  borderRadius: '999px',
                  border: '1px solid var(--theme-elevation-250)',
                  background: 'var(--theme-text)',
                  color: 'var(--theme-bg, #fff)',
                  padding: '0.35rem 0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {savingRowId === row.id ? 'Salvataggio…' : 'Salva'}
              </button>
            </div>

            <textarea
              value={row.appointmentProposalNote}
              onChange={(e) => updateRow(row.id, { appointmentProposalNote: e.target.value })}
              placeholder="Nota proposta / conferma"
              rows={2}
              style={{
                width: '100%',
                borderRadius: '8px',
                border: '1px solid var(--theme-elevation-200)',
                background: 'var(--theme-elevation-0)',
                color: 'var(--theme-text)',
                padding: '0.55rem 0.6rem',
                resize: 'vertical',
              }}
            />
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
