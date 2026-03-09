'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type ApiDoc = Record<string, unknown>
type ApiListResponse = { docs?: ApiDoc[] }

type OrderRow = {
  id: string
  orderNumber: string
  createdAt: string
  customerEmail: string
  cartMode: string
  paymentStatus: string
  status: string
  subtotal: number
  discountAmount: number
  total: number
  commissionAmount: number
  commissionStatus: string
  commissionPaidAt: string
  commissionPayoutReference: string
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '')
const asNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0
const asId = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return ''
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('it-IT')
}

const getOrderAdminHref = (orderId: string) => `/admin/collections/orders/${orderId}`

export default function PartnerCommissionDashboard() {
  const documentInfo = useDocumentInfo()
  const partnerId = documentInfo?.id ? String(documentInfo.id) : ''

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [productUnits, setProductUnits] = useState(0)
  const [serviceUnits, setServiceUnits] = useState(0)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [payoutReference, setPayoutReference] = useState('')
  const [payoutNotes, setPayoutNotes] = useState('')

  useEffect(() => {
    if (!partnerId) {
      setOrders([])
      setSelectedOrderIds([])
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setNotice(null)

      try {
        const ordersParams = new URLSearchParams()
        ordersParams.set('depth', '0')
        ordersParams.set('limit', '500')
        ordersParams.set('sort', '-createdAt')
        ordersParams.append('where[partner][equals]', partnerId)

        const productParams = new URLSearchParams()
        productParams.set('depth', '0')
        productParams.set('limit', '500')
        productParams.append('where[order.partner][equals]', partnerId)

        const serviceParams = new URLSearchParams()
        serviceParams.set('depth', '0')
        serviceParams.set('limit', '500')
        serviceParams.append('where[order.partner][equals]', partnerId)

        const [ordersRes, orderItemsRes, serviceItemsRes] = await Promise.all([
          fetch(`/api/orders?${ordersParams.toString()}`, { credentials: 'include' }),
          fetch(`/api/order-items?${productParams.toString()}`, { credentials: 'include' }),
          fetch(`/api/order-service-items?${serviceParams.toString()}`, { credentials: 'include' }),
        ])

        if (!ordersRes.ok) throw new Error(`Orders request failed: ${ordersRes.status}`)
        if (!orderItemsRes.ok) throw new Error(`Order items request failed: ${orderItemsRes.status}`)
        if (!serviceItemsRes.ok) throw new Error(`Service items request failed: ${serviceItemsRes.status}`)

        const ordersData = ((await ordersRes.json()) as ApiListResponse).docs ?? []
        const orderItemsData = ((await orderItemsRes.json()) as ApiListResponse).docs ?? []
        const serviceItemsData = ((await serviceItemsRes.json()) as ApiListResponse).docs ?? []

        if (cancelled) return

        setOrders(
          ordersData.map((doc) => ({
            id: asId(doc.id),
            orderNumber: asString(doc.orderNumber) || `#${asId(doc.id)}`,
            createdAt: asString(doc.createdAt),
            customerEmail: asString(doc.customerEmail),
            cartMode: asString(doc.cartMode) || 'products_only',
            paymentStatus: asString(doc.paymentStatus) || 'pending',
            status: asString(doc.status) || 'pending',
            subtotal: asNumber(doc.subtotal),
            discountAmount: asNumber(doc.discountAmount),
            total: asNumber(doc.total),
            commissionAmount: asNumber(doc.commissionAmount),
            commissionStatus: asString(doc.commissionStatus) || 'pending',
            commissionPaidAt: asString(doc.commissionPaidAt),
            commissionPayoutReference: asString(doc.commissionPayoutReference),
          })),
        )

        setProductUnits(orderItemsData.reduce((sum, doc) => sum + Math.max(1, asNumber(doc.quantity)), 0))
        setServiceUnits(serviceItemsData.reduce((sum, doc) => sum + Math.max(1, asNumber(doc.quantity)), 0))
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Errore caricamento report partner')
          setOrders([])
          setProductUnits(0)
          setServiceUnits(0)
          setSelectedOrderIds([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [partnerId])

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.commissionAmount > 0 && order.commissionStatus === 'pending'),
    [orders],
  )

  const metrics = useMemo(() => {
    const netRevenue = orders.reduce(
      (sum, order) => sum + Math.max(0, order.subtotal - order.discountAmount),
      0,
    )
    const pendingAmount = orders.reduce(
      (sum, order) => sum + (order.commissionStatus === 'pending' ? order.commissionAmount : 0),
      0,
    )
    const paidAmount = orders.reduce(
      (sum, order) => sum + (order.commissionStatus === 'paid' ? order.commissionAmount : 0),
      0,
    )
    const voidAmount = orders.reduce(
      (sum, order) => sum + (order.commissionStatus === 'void' ? order.commissionAmount : 0),
      0,
    )

    return {
      ordersCount: orders.length,
      netRevenue,
      pendingAmount,
      paidAmount,
      voidAmount,
    }
  }, [orders])

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId],
    )
  }

  const selectAllPending = () => {
    setSelectedOrderIds(pendingOrders.map((order) => order.id))
  }

  const clearSelection = () => {
    setSelectedOrderIds([])
  }

  const markSelectedAsPaid = async () => {
    if (selectedOrderIds.length === 0) return

    setSaving(true)
    setError(null)
    setNotice(null)

    try {
      const paidAt = new Date().toISOString()
      const normalizedReference = payoutReference.trim()
      const normalizedNotes = payoutNotes.trim()

      await Promise.all(
        selectedOrderIds.map(async (orderId) => {
          const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              commissionStatus: 'paid',
              commissionPaidAt: paidAt,
              commissionPayoutReference: normalizedReference || null,
              commissionPayoutNotes: normalizedNotes || null,
            }),
          })

          if (!res.ok) {
            throw new Error(`Aggiornamento ordine ${orderId} fallito: ${res.status}`)
          }
        }),
      )

      setOrders((current) =>
        current.map((order) =>
          selectedOrderIds.includes(order.id)
            ? {
                ...order,
                commissionStatus: 'paid',
                commissionPaidAt: paidAt,
                commissionPayoutReference: normalizedReference,
              }
            : order,
        ),
      )
      setNotice(`Commissioni segnate come pagate su ${selectedOrderIds.length} ordini.`)
      setSelectedOrderIds([])
      setPayoutReference('')
      setPayoutNotes('')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Errore aggiornamento payout')
    } finally {
      setSaving(false)
    }
  }

  if (!partnerId) {
    return <div style={{ color: 'var(--theme-text)' }}>Salva l&apos;utente per vedere report e payout.</div>
  }

  if (loading) {
    return <div style={{ color: 'var(--theme-text)' }}>Caricamento report partner…</div>
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {error ? (
        <div style={{ color: 'var(--theme-error-500, #d14343)' }}>{error}</div>
      ) : null}
      {notice ? (
        <div style={{ color: 'var(--theme-success-500, var(--theme-text))' }}>{notice}</div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {[
          { label: 'Ordini attribuiti', value: String(metrics.ordersCount) },
          { label: 'Prodotti venduti', value: String(productUnits) },
          { label: 'Servizi prenotati', value: String(serviceUnits) },
          { label: 'Netto attribuito', value: formatMoney(metrics.netRevenue) },
          { label: 'Commissioni pending', value: formatMoney(metrics.pendingAmount) },
          { label: 'Commissioni pagate', value: formatMoney(metrics.paidAmount) },
          { label: 'Commissioni void', value: formatMoney(metrics.voidAmount) },
        ].map((metric) => (
          <div
            key={metric.label}
            style={{
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 10,
              padding: '0.9rem 1rem',
              background: 'var(--theme-elevation-0)',
            }}
          >
            <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.8rem' }}>{metric.label}</div>
            <div style={{ color: 'var(--theme-text)', fontSize: '1.1rem', fontWeight: 700 }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '0.75rem',
            alignItems: 'center',
            padding: '0.9rem 1rem',
            borderBottom: '1px solid var(--theme-elevation-100)',
          }}
        >
          <div>
            <div style={{ color: 'var(--theme-text)', fontWeight: 700 }}>Payout commissioni</div>
            <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.82rem' }}>
              Seleziona gli ordini `pending` e segnali come pagati.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={selectAllPending} disabled={pendingOrders.length === 0 || saving}>
              Seleziona pending
            </button>
            <button type="button" onClick={clearSelection} disabled={selectedOrderIds.length === 0 || saving}>
              Deseleziona
            </button>
            <button
              type="button"
              onClick={markSelectedAsPaid}
              disabled={selectedOrderIds.length === 0 || saving}
            >
              {saving ? 'Aggiornamento…' : 'Segna come pagate'}
            </button>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '0.9rem 1rem',
            borderBottom: '1px solid var(--theme-elevation-100)',
          }}
        >
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ color: 'var(--theme-elevation-650)', fontSize: '0.82rem' }}>
              Riferimento payout
            </span>
            <input
              type="text"
              value={payoutReference}
              onChange={(event) => setPayoutReference(event.target.value)}
              placeholder="Bonifico marzo 2026"
            />
          </label>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ color: 'var(--theme-elevation-650)', fontSize: '0.82rem' }}>
              Note payout
            </span>
            <input
              type="text"
              value={payoutNotes}
              onChange={(event) => setPayoutNotes(event.target.value)}
              placeholder="Pagamento partner batch marzo"
            />
          </label>
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--theme-text)' }}>
            Nessun ordine attribuito a questo partner.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 0 }}>
            {orders.map((order) => {
              const selectable = order.commissionAmount > 0 && order.commissionStatus === 'pending'
              const selected = selectedOrderIds.includes(order.id)
              const rowKey = order.id || `${order.orderNumber}-${order.createdAt}-${order.customerEmail}`
              return (
                <div
                  key={rowKey}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1.2fr 0.8fr 0.8fr 0.9fr 0.9fr',
                    gap: '0.75rem',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    borderTop: '1px solid var(--theme-elevation-100)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={!selectable || saving}
                    onChange={() => toggleOrderSelection(order.id)}
                  />
                  <div style={{ minWidth: 0 }}>
                    <a
                      href={getOrderAdminHref(order.id)}
                      style={{ color: 'var(--theme-text)', fontWeight: 700, textDecoration: 'none' }}
                    >
                      {order.orderNumber}
                    </a>
                    <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.82rem' }}>
                      {order.customerEmail || 'Cliente'} · {formatDate(order.createdAt)}
                    </div>
                    <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.8rem' }}>
                      {order.cartMode} · ordine {order.status} · pagamento {order.paymentStatus}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>Netto</div>
                    <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>
                      {formatMoney(Math.max(0, order.subtotal - order.discountAmount))}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>Commissione</div>
                    <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>
                      {formatMoney(order.commissionAmount)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>Stato</div>
                    <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>
                      {order.commissionStatus || 'pending'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>Pagamento</div>
                    <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>
                      {order.commissionPaidAt ? formatDate(order.commissionPaidAt) : '—'}
                    </div>
                    <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>
                      {order.commissionPayoutReference || '—'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
