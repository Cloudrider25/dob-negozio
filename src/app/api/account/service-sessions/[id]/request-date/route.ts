import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const sessionId = asString(id)
  if (!sessionId) {
    return NextResponse.json({ error: 'Sessione non valida.' }, { status: 400 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: 'set' | 'clear'
    requestedDate?: string
    requestedTime?: string
  }
  const action = body.action === 'clear' ? 'clear' : 'set'
  const requestedDate = asString(body.requestedDate)
  const requestedTime = asString(body.requestedTime)
  const date = action === 'set' ? new Date(requestedDate) : null
  if (action === 'set') {
    if (!requestedDate || !requestedTime) {
      return NextResponse.json({ error: 'Data e ora sono obbligatorie.' }, { status: 400 })
    }
    if (!date || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Data non valida.' }, { status: 400 })
    }
  }

  const payload = await getPayloadClient()
  const authResult = await payload.auth({ headers: request.headers })
  const user = authResult?.user && typeof authResult.user === 'object' ? authResult.user : null
  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const session = await payload.findByID({
    collection: 'order-service-sessions',
    id: sessionId,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null)

  if (!session) {
    return NextResponse.json({ error: 'Sessione non trovata.' }, { status: 404 })
  }

  const orderId =
    typeof session.order === 'number'
      ? session.order
      : session.order && typeof session.order === 'object' && 'id' in session.order
        ? (session.order as { id?: number }).id
        : undefined

  if (!orderId) {
    return NextResponse.json({ error: 'Ordine non valido.' }, { status: 400 })
  }

  // Enforce ownership via collection access (do not bypass).
  const ownedOrder = await payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 0,
    user,
    overrideAccess: false,
  }).catch(() => null)

  if (!ownedOrder) {
    return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 })
  }

  const currentStatus = typeof session.appointmentStatus === 'string' ? session.appointmentStatus : 'none'
  if (currentStatus === 'confirmed' || currentStatus === 'confirmed_by_customer') {
    return NextResponse.json({ error: 'Questa seduta è già confermata.' }, { status: 409 })
  }

  const updated = await payload.update({
    collection: 'order-service-sessions',
    id: sessionId,
    depth: 0,
    overrideAccess: true,
    data: {
      appointmentMode: action === 'clear' ? 'contact_later' : 'requested_slot',
      appointmentStatus: action === 'clear' ? 'none' : 'pending',
      appointmentRequestedDate: action === 'clear' ? null : date!.toISOString(),
      appointmentRequestedTime: action === 'clear' ? null : requestedTime,
    },
  })

  const orderServiceItemId =
    typeof session.orderServiceItem === 'number'
      ? session.orderServiceItem
      : session.orderServiceItem && typeof session.orderServiceItem === 'object' && 'id' in session.orderServiceItem
        ? (session.orderServiceItem as { id?: number }).id
        : undefined

  if (orderServiceItemId) {
    const itemKind = typeof session.itemKind === 'string' ? session.itemKind : 'service'
    if (itemKind === 'package') {
      return NextResponse.json({
        ok: true,
        id: updated.id,
      })
    }

    await payload.update({
      collection: 'order-service-items',
      id: orderServiceItemId,
      depth: 0,
      overrideAccess: true,
      context: {
        skipSessionSync: true,
      },
      data: {
        appointmentMode: action === 'clear' ? 'contact_later' : 'requested_slot',
        appointmentStatus: action === 'clear' ? 'none' : 'pending',
        appointmentRequestedDate: action === 'clear' ? null : date!.toISOString(),
        appointmentRequestedTime: action === 'clear' ? null : requestedTime,
      },
    }).catch(() => undefined)
  }

  return NextResponse.json({
    ok: true,
    id: updated.id,
  })
}
