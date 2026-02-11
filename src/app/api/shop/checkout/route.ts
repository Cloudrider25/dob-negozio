import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/getPayloadClient'
import { isLocale, type Locale } from '@/lib/i18n'
import { sendSMTPEmail } from '@/lib/email/sendSMTPEmail'
import type { Product } from '@/payload-types'

type CheckoutItemInput = {
  id: string
  quantity: number
}

type CheckoutPayload = {
  locale?: string
  customer?: {
    email?: string
    firstName?: string
    lastName?: string
    address?: string
    postalCode?: string
    city?: string
    province?: string
    phone?: string
  }
  items?: CheckoutItemInput[]
}

const toString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const createOrderNumber = () => {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0')
  return `DOB-${y}${m}${d}-${random}`
}

const resolveBrandLabel = (product: Product, locale: string) => {
  const brand = product.brand
  if (!brand || typeof brand === 'number') return ''
  if (typeof brand.name === 'string') return brand.name
  if (brand.name && typeof brand.name === 'object') {
    const localized = brand.name as Record<string, unknown>
    const preferred = localized[locale]
    if (typeof preferred === 'string') return preferred
    const first = Object.values(localized).find((value) => typeof value === 'string')
    if (typeof first === 'string') return first
  }
  return ''
}

const resolveCoverImage = (product: Product) => {
  if (!product.coverImage || typeof product.coverImage === 'number') return ''
  return typeof product.coverImage.url === 'string' ? product.coverImage.url : ''
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutPayload
    const localeInput = toString(body.locale)
    const locale: Locale = isLocale(localeInput) ? localeInput : 'it'
    const customer = body.customer ?? {}

    const email = toString(customer.email)
    const firstName = toString(customer.firstName)
    const lastName = toString(customer.lastName)
    const address = toString(customer.address)
    const postalCode = toString(customer.postalCode)
    const city = toString(customer.city)
    const province = toString(customer.province)
    const phone = toString(customer.phone)

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email non valida.' }, { status: 400 })
    }
    if (!firstName || !lastName || !address || !postalCode || !city || !province) {
      return NextResponse.json(
        { error: 'Compila tutti i campi obbligatori di spedizione.' },
        { status: 400 },
      )
    }

    const rawItems = Array.isArray(body.items) ? body.items : []
    const normalized = new Map<string, number>()
    for (const item of rawItems) {
      const id = toString(item?.id)
      const quantity = Number(item?.quantity)
      if (!id) continue
      if (!Number.isFinite(quantity) || quantity <= 0) continue
      const safeQuantity = Math.min(50, Math.floor(quantity))
      normalized.set(id, (normalized.get(id) ?? 0) + safeQuantity)
    }

    if (normalized.size === 0) {
      return NextResponse.json({ error: 'Carrello vuoto.' }, { status: 400 })
    }

    const productIds = Array.from(normalized.keys())
    const payload = await getPayloadClient()
    const productsResult = await payload.find({
      collection: 'products',
      limit: productIds.length,
      depth: 1,
      overrideAccess: false,
      locale,
      where: {
        and: [{ id: { in: productIds } }, { active: { equals: true } }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        brand: true,
        coverImage: true,
        price: true,
        stock: true,
        allocatedStock: true,
        active: true,
      },
    })

    const productsById = new Map(productsResult.docs.map((doc) => [String(doc.id), doc]))
    const missing = productIds.filter((id) => !productsById.has(id))
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Alcuni prodotti non sono più disponibili.', missing },
        { status: 409 },
      )
    }

    type LineItem = {
      product: Product
      quantity: number
      unitPrice: number
      lineTotal: number
      available: number
    }

    const lineItems: LineItem[] = []
    for (const [id, quantity] of normalized.entries()) {
      const product = productsById.get(id)
      if (!product) continue
      if (typeof product.price !== 'number' || product.price < 0) {
        return NextResponse.json(
          { error: `Prezzo non valido per il prodotto ${product.title || id}.` },
          { status: 409 },
        )
      }
      const stock = typeof product.stock === 'number' ? product.stock : 0
      const allocated = typeof product.allocatedStock === 'number' ? product.allocatedStock : 0
      const available = Math.max(0, stock - allocated)
      if (quantity > available) {
        return NextResponse.json(
          {
            error: `Disponibilità insufficiente per ${product.title || id}.`,
            productId: id,
            requested: quantity,
            available,
          },
          { status: 409 },
        )
      }
      lineItems.push({
        product,
        quantity,
        unitPrice: product.price,
        lineTotal: product.price * quantity,
        available,
      })
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const shippingAmount = 0
    const discountAmount = 0
    const total = Math.max(0, subtotal + shippingAmount - discountAmount)

    const createdOrder = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      locale,
      draft: false,
      data: {
        orderNumber: createOrderNumber(),
        status: 'paid',
        paymentStatus: 'paid',
        paymentProvider: 'manual',
        paymentReference: `manual-${Date.now()}`,
        currency: 'EUR',
        locale,
        subtotal,
        shippingAmount,
        discountAmount,
        total,
        customerEmail: email,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerPhone: phone || undefined,
        shippingAddress: {
          address,
          postalCode,
          city,
          province,
          country: 'Italy',
        },
      },
    })

    const rollbackAllocated = new Map<string, number>()
    const createdItemIDs: Array<string | number> = []

    try {
      for (const item of lineItems) {
        const productId = String(item.product.id)
        const currentAllocated =
          typeof item.product.allocatedStock === 'number' ? item.product.allocatedStock : 0
        const nextAllocated = currentAllocated + item.quantity
        rollbackAllocated.set(productId, currentAllocated)

        const createdItem = await payload.create({
          collection: 'order-items',
          overrideAccess: true,
          locale,
          draft: false,
          data: {
            order: createdOrder.id,
            product: item.product.id,
            productTitle: item.product.title || productId,
            productSlug: item.product.slug || undefined,
            productBrand: resolveBrandLabel(item.product, locale),
            productCoverImage: resolveCoverImage(item.product) || undefined,
            currency: 'EUR',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          },
        })
        createdItemIDs.push(createdItem.id)

        await payload.update({
          collection: 'products',
          id: item.product.id,
          overrideAccess: true,
          locale,
          data: {
            allocatedStock: nextAllocated,
          },
        })
      }
    } catch (error) {
      for (const [productId, previousAllocated] of rollbackAllocated.entries()) {
        try {
          await payload.update({
            collection: 'products',
            id: productId,
            overrideAccess: true,
            locale,
            data: {
              allocatedStock: previousAllocated,
            },
          })
        } catch {
          // No-op best effort rollback
        }
      }

      for (const itemID of createdItemIDs) {
        try {
          await payload.delete({
            collection: 'order-items',
            id: itemID,
            overrideAccess: true,
            locale,
          })
        } catch {
          // No-op best effort rollback
        }
      }

      await payload.delete({
        collection: 'orders',
        id: createdOrder.id,
        overrideAccess: true,
        locale,
      })

      throw error
    }

    let emailSent = false
    try {
      await sendSMTPEmail({
        payload,
        to: email,
        subject: `Conferma ordine ${createdOrder.orderNumber}`,
        text: [
          `Ciao ${firstName},`,
          '',
          `abbiamo ricevuto il tuo ordine ${createdOrder.orderNumber}.`,
          `Totale: EUR ${total.toFixed(2)}`,
          '',
          'Grazie,',
          'DOB Milano',
        ].join('\n'),
        html: `
          <p>Ciao ${firstName},</p>
          <p>abbiamo ricevuto il tuo ordine <strong>${createdOrder.orderNumber}</strong>.</p>
          <p>Totale: <strong>EUR ${total.toFixed(2)}</strong></p>
          <p>Grazie,<br/>DOB Milano</p>
        `,
      })
      emailSent = true
    } catch (emailError) {
      payload.logger.error({
        err: emailError,
        msg: `Order confirmation email failed for order ${createdOrder.orderNumber}`,
      })
    }

    return NextResponse.json({
      ok: true,
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      total,
      currency: 'EUR',
      emailSent,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout non riuscito.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
