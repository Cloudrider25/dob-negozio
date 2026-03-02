import type { ProductSort, OrderItem } from '../../types'

export type GroupedOrderRow =
  | { kind: 'single'; row: OrderItem }
  | {
      kind: 'order-group'
      key: string
      lead: OrderItem
      rows: OrderItem[]
      productsTotal: number
    }

const toTs = (value: string | Date) => new Date(value).getTime()

export function sortOrdersByDateDesc(rows: OrderItem[]) {
  return [...rows].sort((a, b) => toTs(b.createdAt) - toTs(a.createdAt))
}

export function sortOrdersForList(rows: OrderItem[], sort: ProductSort) {
  const next = [...rows]

  if (sort === 'oldest') {
    next.sort((a, b) => toTs(a.createdAt) - toTs(b.createdAt))
    return next
  }

  if (sort === 'total_desc') {
    next.sort((a, b) => (b.total || 0) - (a.total || 0))
    return next
  }

  if (sort === 'total_asc') {
    next.sort((a, b) => (a.total || 0) - (b.total || 0))
    return next
  }

  next.sort((a, b) => toTs(b.createdAt) - toTs(a.createdAt))
  return next
}

export function groupOrders(rows: OrderItem[]): GroupedOrderRow[] {
  const output: GroupedOrderRow[] = []
  const byOrder = new Map<string, OrderItem[]>()

  for (const row of rows) {
    const list = byOrder.get(row.orderNumber) ?? []
    list.push(row)
    byOrder.set(row.orderNumber, list)
  }

  for (const [key, groupRows] of byOrder.entries()) {
    if (groupRows.length === 1) {
      output.push({ kind: 'single', row: groupRows[0] })
      continue
    }

    const ordered = [...groupRows].sort((a, b) => a.id - b.id)

    output.push({
      kind: 'order-group',
      key,
      lead: ordered[0],
      rows: ordered,
      productsTotal: ordered.reduce((sum, row) => sum + (row.total || 0), 0),
    })
  }

  output.sort((a, b) => {
    const aDate = a.kind === 'single' ? a.row.createdAt : a.lead.createdAt
    const bDate = b.kind === 'single' ? b.row.createdAt : b.lead.createdAt
    return toTs(bDate) - toTs(aDate)
  })

  return output
}

export function findNextProductDeliveryRow(rows: OrderItem[], nowTs = Date.now()) {
  const candidates = rows
    .map((row) => {
      if (!row.deliveryUpdatedAt) return { row, ts: null as number | null }
      const ts = new Date(row.deliveryUpdatedAt).getTime()
      return { row, ts: Number.isNaN(ts) ? null : ts }
    })
    .filter((entry): entry is { row: OrderItem; ts: number } => entry.ts !== null && entry.ts > nowTs)
    .sort((a, b) => a.ts - b.ts)

  return candidates[0]?.row ?? null
}
