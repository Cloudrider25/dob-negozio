'use client'

import { useEffect, useMemo, useState } from 'react'

type ApiDoc = Record<string, unknown>
type ApiListResponse = { docs?: ApiDoc[] }

type PartnerRow = {
  id: string
  email: string
  firstName: string
  lastName: string
}

type OrderRow = {
  id: string
  partnerId: string
  commissionAmount: number
  commissionStatus: string
  subtotal: number
  discountAmount: number
}

type PartnerSummaryRow = {
  id: string
  name: string
  email: string
  ordersCount: number
  netRevenue: number
  pendingAmount: number
  paidAmount: number
  voidAmount: number
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

const getPartnerAdminHref = (partnerId: string) => `/admin/collections/users/${partnerId}`

export default function PartnerPayoutsOverview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [partners, setPartners] = useState<PartnerRow[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const partnerParams = new URLSearchParams()
        partnerParams.set('depth', '0')
        partnerParams.set('limit', '500')
        partnerParams.set('sort', 'email')
        partnerParams.append('where[roles][contains]', 'partner')

        const orderParams = new URLSearchParams()
        orderParams.set('depth', '0')
        orderParams.set('limit', '1000')
        orderParams.set('sort', '-createdAt')
        orderParams.append('where[partner][exists]', 'true')

        const [partnersRes, ordersRes] = await Promise.all([
          fetch(`/api/users?${partnerParams.toString()}`, { credentials: 'include' }),
          fetch(`/api/orders?${orderParams.toString()}`, { credentials: 'include' }),
        ])

        if (!partnersRes.ok) throw new Error(`Users request failed: ${partnersRes.status}`)
        if (!ordersRes.ok) throw new Error(`Orders request failed: ${ordersRes.status}`)

        const partnersData = ((await partnersRes.json()) as ApiListResponse).docs ?? []
        const ordersData = ((await ordersRes.json()) as ApiListResponse).docs ?? []

        if (cancelled) return

        setPartners(
          partnersData.map((doc) => ({
            id: asId(doc.id),
            email: asString(doc.email),
            firstName: asString(doc.firstName),
            lastName: asString(doc.lastName),
          })),
        )

        setOrders(
          ordersData.map((doc) => ({
            id: asId(doc.id),
            partnerId: asId(doc.partner),
            commissionAmount: asNumber(doc.commissionAmount),
            commissionStatus: asString(doc.commissionStatus) || 'pending',
            subtotal: asNumber(doc.subtotal),
            discountAmount: asNumber(doc.discountAmount),
          })),
        )
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Errore caricamento riepilogo partner')
          setPartners([])
          setOrders([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const summaries = useMemo<PartnerSummaryRow[]>(() => {
    return partners.map((partner) => {
      const partnerOrders = orders.filter((order) => order.partnerId === partner.id)
      const name = [partner.firstName, partner.lastName].filter(Boolean).join(' ').trim() || partner.email
      return {
        id: partner.id,
        name,
        email: partner.email,
        ordersCount: partnerOrders.length,
        netRevenue: partnerOrders.reduce(
          (sum, order) => sum + Math.max(0, order.subtotal - order.discountAmount),
          0,
        ),
        pendingAmount: partnerOrders.reduce(
          (sum, order) => sum + (order.commissionStatus === 'pending' ? order.commissionAmount : 0),
          0,
        ),
        paidAmount: partnerOrders.reduce(
          (sum, order) => sum + (order.commissionStatus === 'paid' ? order.commissionAmount : 0),
          0,
        ),
        voidAmount: partnerOrders.reduce(
          (sum, order) => sum + (order.commissionStatus === 'void' ? order.commissionAmount : 0),
          0,
        ),
      }
    })
  }, [orders, partners])

  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, row) => ({
        partnersCount: acc.partnersCount + 1,
        ordersCount: acc.ordersCount + row.ordersCount,
        netRevenue: acc.netRevenue + row.netRevenue,
        pendingAmount: acc.pendingAmount + row.pendingAmount,
        paidAmount: acc.paidAmount + row.paidAmount,
        voidAmount: acc.voidAmount + row.voidAmount,
      }),
      {
        partnersCount: 0,
        ordersCount: 0,
        netRevenue: 0,
        pendingAmount: 0,
        paidAmount: 0,
        voidAmount: 0,
      },
    )
  }, [summaries])

  if (loading) {
    return <div style={{ color: 'var(--theme-text)' }}>Caricamento overview partner…</div>
  }

  if (error) {
    return <div style={{ color: 'var(--theme-error-500, #d14343)' }}>{error}</div>
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {[
          { label: 'Partner attivi', value: String(totals.partnersCount) },
          { label: 'Ordini attribuiti', value: String(totals.ordersCount) },
          { label: 'Netto totale', value: formatMoney(totals.netRevenue) },
          { label: 'Commissioni pending', value: formatMoney(totals.pendingAmount) },
          { label: 'Commissioni pagate', value: formatMoney(totals.paidAmount) },
          { label: 'Commissioni void', value: formatMoney(totals.voidAmount) },
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
            padding: '0.9rem 1rem',
            borderBottom: '1px solid var(--theme-elevation-100)',
            color: 'var(--theme-text)',
            fontWeight: 700,
          }}
        >
          Partner overview
        </div>

        {summaries.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--theme-text)' }}>Nessun partner trovato.</div>
        ) : (
          <div style={{ display: 'grid', gap: 0 }}>
            {summaries.map((row) => (
              <div
                key={row.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.3fr 0.6fr 0.8fr 0.8fr 0.8fr 0.8fr',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  borderTop: '1px solid var(--theme-elevation-100)',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <a
                    href={getPartnerAdminHref(row.id)}
                    style={{ color: 'var(--theme-text)', fontWeight: 700, textDecoration: 'none' }}
                  >
                    {row.name}
                  </a>
                  <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.82rem' }}>{row.email}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>Ordini</div>
                  <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>{row.ordersCount}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>Netto</div>
                  <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>{formatMoney(row.netRevenue)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>Pending</div>
                  <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>
                    {formatMoney(row.pendingAmount)}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>Pagate</div>
                  <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>{formatMoney(row.paidAmount)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--theme-elevation-650)', fontSize: '0.78rem' }}>Void</div>
                  <div style={{ color: 'var(--theme-text)', fontWeight: 600 }}>{formatMoney(row.voidAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
