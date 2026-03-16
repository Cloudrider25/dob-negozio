import type { Payload } from 'payload'
import { toPublicSeoPath } from '@/lib/frontend/seo/routes'
import { getPublicSiteOrigin } from '@/lib/server/url/getPublicSiteOrigin'
import type {
  Order,
  OrderItem as PayloadOrderItem,
  OrderServiceItem as PayloadOrderServiceItem,
} from '@/payload/generated/payload-types'

import type { PayloadRequest } from 'payload'

import { sendBusinessEventEmail } from '@/lib/server/email/sendBusinessEventEmail'

type NotificationPayload = Payload

type ConsultationLeadNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  firstName: string
  lastName: string
  email: string
  phone: string
  skinType?: string | null
  concerns?: string[]
  message?: string | null
  source?: string | null
  locale?: string | null
  pagePath?: string | null
}

type AdminOrderNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  eventKey?: 'order_created' | 'order_paid'
  orderID?: number | string | null
  orderNumber: string
  customerEmail: string
  customerFirstName?: string | null
  customerLastName?: string | null
  total: number
  cartMode?: string | null
  productFulfillmentMode?: string | null
  appointmentMode?: string | null
  appointmentRequestedDate?: string | null
  appointmentRequestedTime?: string | null
  attachments?: Array<{
    filename?: string
    content: Buffer
    contentType?: string
  }>
}

type AppointmentStatusNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  nextStatus: 'alternative_proposed' | 'confirmed' | 'confirmed_by_customer'
  customerEmail: string
  customerName: string
  orderNumber: string
  proposedDate?: string | null
  proposedTime?: string | null
  requestedDate?: string | null
  requestedTime?: string | null
  note?: string | null
}

type AppointmentCancelledNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  customerEmail: string
  customerName: string
  orderNumber: string
  requestedDate?: string | null
  requestedTime?: string | null
  proposedDate?: string | null
  proposedTime?: string | null
  note?: string | null
}

type ServiceDateRequestNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  orderNumber: string
  customerEmail: string
  customerName: string
  requestedDate: string
  requestedTime: string
}

type UserAdminNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  eventKey: 'user_registered' | 'user_verified'
  firstName?: string | null
  lastName?: string | null
  email: string
  roles?: string[]
}

type AuthAdminNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  eventKey: 'login_success_admin_notice' | 'login_failed_admin_notice' | 'password_reset_requested' | 'password_reset_completed'
  email?: string | null
  ip?: string | null
  userAgent?: string | null
  message?: string | null
}

type OrderLifecycleNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  eventKey: 'order_payment_failed' | 'order_cancelled' | 'order_refunded'
  orderID?: number | string | null
  orderNumber: string
  customerEmail: string
  customerFirstName?: string | null
  customerLastName?: string | null
  total: number
  reason?: string | null
}

type ShipmentNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  eventKey: 'shipment_created' | 'tracking_available'
  orderID?: number | string | null
  orderNumber: string
  customerEmail: string
  customerFirstName?: string | null
  customerLastName?: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
}

type ProductWaitlistNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  customerEmail: string
  customerFirstName?: string | null
  customerLastName?: string | null
  productTitle: string
  productSlug: string
  productBrand?: string | null
  locale?: string | null
}

type NewsletterNotificationInput = {
  payload: NotificationPayload
  req?: PayloadRequest
  eventKey: 'newsletter_service_created' | 'newsletter_product_created'
  title: string
  slug: string
  price?: number | null
  durationMinutes?: number | null
  brand?: string | null
}

const isEmail = (value: string | null | undefined) => typeof value === 'string' && /.+@.+\..+/.test(value.trim())

const normalizeText = (value: string | null | undefined) => (typeof value === 'string' ? value.trim() : '')

const formatDate = (value: string | null | undefined) => {
  const normalized = normalizeText(value)
  if (!normalized) return ''
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return normalized
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(parsed)
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)

const resolvePreferredLocale = (value: unknown): 'it' | 'en' | 'ru' => {
  if (value === 'en' || value === 'ru') return value
  return 'it'
}

const getFullName = (firstName?: string | null, lastName?: string | null) =>
  [firstName, lastName].map((value) => normalizeText(value)).filter(Boolean).join(' ') || 'Cliente'

const getAdminEmail = () =>
  normalizeText(process.env.SHOP_APPOINTMENT_ADMIN_EMAIL) || normalizeText(process.env.ADMIN_EMAIL)

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const resolveCartModeLabel = (value: string | null | undefined) => {
  switch (normalizeText(value)) {
    case 'products_only':
      return 'Solo prodotti'
    case 'services_only':
      return 'Solo servizi'
    case 'mixed':
      return 'Prodotti e servizi'
    default:
      return 'Non definita'
  }
}

const resolveFulfillmentLabel = (value: string | null | undefined) => {
  switch (normalizeText(value)) {
    case 'shipping':
      return 'Spedizione'
    case 'pickup':
      return 'Ritiro in sede'
    case 'none':
      return 'Non applicabile'
    default:
      return 'Da definire'
  }
}

const resolveAppointmentModeLabel = (value: string | null | undefined) => {
  switch (normalizeText(value)) {
    case 'requested_slot':
      return 'Data richiesta dal cliente'
    case 'contact_later':
      return 'Da concordare con il cliente'
    case 'none':
      return 'Non applicabile'
    default:
      return 'Da definire'
  }
}

const resolveAbsoluteMediaUrl = (origin: string, value: string | null | undefined) => {
  const normalized = normalizeText(value)
  if (!normalized) return ''
  if (/^https?:\/\//i.test(normalized)) return normalized
  return `${origin}${normalized.startsWith('/') ? normalized : `/${normalized}`}`
}

type OrderEmailRow = {
  title: string
  subtitle: string
  quantity: number
  price: string
  imageUrl?: string
  placeholderLabel?: string
}

const buildOrderItemsHtml = (rows: OrderEmailRow[]) => {
  if (rows.length === 0) return ''

  return rows
    .map((row) => {
      const title = escapeHtml(row.title)
      const subtitle = escapeHtml(row.subtitle)
      const price = escapeHtml(row.price)
      const quantity = row.quantity > 1 ? String(row.quantity) : ''
      const imageBlock = row.imageUrl
        ? `<img src="${escapeHtml(row.imageUrl)}" alt="" width="72" height="72" style="width:100%; height:100%; object-fit:contain; display:block; padding:5px; border-radius:12px;" />`
        : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:10px; border-radius:12px; background-color:#f8f5f1; color:#6b6257; font-size:11px; line-height:1.3; text-transform:uppercase; letter-spacing:0.08em; text-align:center;">${escapeHtml(row.placeholderLabel || 'Item')}</div>`

      return `
        <div style="display:grid; grid-template-columns:72px minmax(0, 1fr) auto; gap:16px; align-items:center; margin:0 0 14px 0;">
          <div style="position:relative; width:72px; height:72px; border-radius:18px; background:#ffffff; border:1px solid #ded6cc; box-shadow:0 4px 14px rgba(17,17,17,0.08); padding:0.35rem; box-sizing:border-box;">
            ${imageBlock}
            ${
              quantity
                ? `<span style="position:absolute; top:-10px; right:-10px; width:28px; height:28px; border-radius:12px; background:#f5f1eb; color:#1f1f1f; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; border:3px solid #f5f1eb;">${quantity}</span>`
                : ''
            }
          </div>
          <div style="min-width:0;">
            <p style="margin:0; font-size:15px; line-height:22px; color:#1f1f1f; font-weight:600;">${title}</p>
            ${subtitle ? `<p style="margin:4px 0 0 0; font-size:13px; line-height:20px; color:#6b6257;">${subtitle}</p>` : ''}
          </div>
          <div style="font-size:14px; line-height:20px; color:#1f1f1f; font-weight:600; white-space:nowrap;">${price}</div>
        </div>
      `
    })
    .join('')
}

const buildOrderItemsText = (rows: OrderEmailRow[]) => {
  if (rows.length === 0) return ''

  return rows
    .map((row) => {
      const qtyPrefix = row.quantity > 1 ? `${row.quantity}x ` : ''
      const subtitle = row.subtitle ? ` · ${row.subtitle}` : ''
      return `- ${qtyPrefix}${row.title}${subtitle} · ${row.price}`
    })
    .join('\n')
}

const findOrderForEmail = async ({
  payload,
  req,
  orderID,
  orderNumber,
}: {
  payload: NotificationPayload
  req?: PayloadRequest
  orderID?: number | string | null
  orderNumber: string
}) => {
  if (typeof orderID === 'number' || (typeof orderID === 'string' && orderID.trim())) {
    return (await payload.findByID({
      collection: 'orders',
      id: orderID,
      overrideAccess: true,
      req,
      depth: 0,
    })) as Order
  }

  const result = await payload.find({
    collection: 'orders',
    overrideAccess: true,
    req,
    depth: 0,
    limit: 1,
    where: {
      orderNumber: {
        equals: orderNumber,
      },
    },
  })

  return ((result.docs?.[0] as Order | undefined) ?? null)
}

const buildOrderEmailArtifacts = async ({
  payload,
  req,
  orderID,
  orderNumber,
  cartMode,
  productFulfillmentMode,
  appointmentMode,
  appointmentRequestedDate,
  appointmentRequestedTime,
}: {
  payload: NotificationPayload
  req?: PayloadRequest
  orderID?: number | string | null
  orderNumber: string
  cartMode?: string | null
  productFulfillmentMode?: string | null
  appointmentMode?: string | null
  appointmentRequestedDate?: string | null
  appointmentRequestedTime?: string | null
}) => {
  const origin = getPublicSiteOrigin(req?.headers)
  const order = await findOrderForEmail({ payload, req, orderID, orderNumber })
  const orderDocId = order?.id
  const rows: OrderEmailRow[] = []

  if (typeof orderDocId === 'number') {
    const [productItems, serviceItems] = await Promise.all([
      payload.find({
        collection: 'order-items',
        overrideAccess: true,
        req,
        depth: 0,
        limit: 100,
        sort: 'createdAt',
        where: {
          order: { equals: orderDocId },
        },
      }),
      payload.find({
        collection: 'order-service-items',
        overrideAccess: true,
        req,
        depth: 0,
        limit: 100,
        sort: 'createdAt',
        where: {
          order: { equals: orderDocId },
        },
      }),
    ])

    for (const item of productItems.docs as PayloadOrderItem[]) {
      rows.push({
        title: item.productTitle,
        subtitle: [normalizeText(item.productBrand)].filter(Boolean).join(' · '),
        quantity: Math.max(1, item.quantity || 1),
        price: formatCurrency(item.lineTotal || item.unitPrice || 0),
        imageUrl: resolveAbsoluteMediaUrl(origin, item.productCoverImage),
        placeholderLabel: 'Prodotto',
      })
    }

    for (const item of serviceItems.docs as PayloadOrderServiceItem[]) {
      const kindLabel =
        item.itemKind === 'program' ? 'Programma' : item.itemKind === 'package' ? 'Pacchetto' : 'Servizio'
      rows.push({
        title: item.serviceTitle,
        subtitle: [kindLabel, normalizeText(item.variantLabel)].filter(Boolean).join(' · '),
        quantity: Math.max(1, item.quantity || 1),
        price: formatCurrency(item.lineTotal || item.unitPrice || 0),
        placeholderLabel: kindLabel,
      })
    }
  }

  const appointmentSummary =
    normalizeText(appointmentMode) === 'requested_slot'
      ? [formatDate(appointmentRequestedDate), normalizeText(appointmentRequestedTime)]
          .filter(Boolean)
          .join(' · ') || 'Da definire'
      : normalizeText(appointmentMode) === 'contact_later'
        ? 'Da concordare con il cliente'
        : 'Non applicabile'

  return {
    accountOrdersUrl: `${origin}/it/account?section=orders`,
    cartModeLabel: resolveCartModeLabel(cartMode),
    productFulfillmentModeLabel: resolveFulfillmentLabel(productFulfillmentMode),
    appointmentModeLabel: resolveAppointmentModeLabel(appointmentMode),
    appointmentSummary,
    itemsHtml: buildOrderItemsHtml(rows),
    itemsText: buildOrderItemsText(rows),
  }
}

export const sendConsultationLeadNotifications = async ({
  payload,
  req,
  firstName,
  lastName,
  email,
  phone,
  skinType,
  concerns,
  message,
  source,
  locale,
  pagePath,
}: ConsultationLeadNotificationInput) => {
  const adminEmail = getAdminEmail()
  const customerName = [firstName, lastName].map((value) => normalizeText(value)).filter(Boolean).join(' ') || 'Cliente'
  const cleanConcerns = (concerns ?? []).map((value) => normalizeText(value)).filter(Boolean)
  const eventData = {
    customer: {
      firstName: normalizeText(firstName),
      lastName: normalizeText(lastName),
      fullName: customerName,
      email: normalizeText(email),
      phone: normalizeText(phone),
    },
    consultation: {
      skinType: normalizeText(skinType),
      concerns: cleanConcerns.join(', '),
      message: normalizeText(message),
      source: normalizeText(source),
      locale: normalizeText(locale),
      pagePath: normalizeText(pagePath),
    },
  }

  if (isEmail(email)) {
    try {
      await sendBusinessEventEmail({
        payload,
        req,
        eventKey: 'consultation_lead_created',
        channel: 'customer',
        locale: locale || 'it',
        to: email,
        data: eventData,
        relatedCollection: 'consultation-leads',
        fallback: {
          subject: 'Richiesta consulenza ricevuta',
          text: [
            `Ciao {{customer.fullName}},`,
            '',
            'abbiamo ricevuto la tua richiesta di consulenza.',
            'Il team DOB Milano ti contattera presto per il prossimo passo.',
            '',
            'Grazie,',
            'DOB Milano',
          ].join('\n'),
          html: `
            <p>Ciao {{customer.fullName}},</p>
            <p>abbiamo ricevuto la tua richiesta di consulenza.</p>
            <p>Il team DOB Milano ti contattera presto per il prossimo passo.</p>
            <p>Grazie,<br/>DOB Milano</p>
          `,
        },
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Consultation acknowledgement email failed for ${email}`,
      })
    }
  }

  if (!isEmail(adminEmail)) return

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey: 'consultation_lead_created',
      channel: 'admin',
      locale: 'it',
      to: adminEmail,
      data: eventData,
      relatedCollection: 'consultation-leads',
      fallback: {
        subject: '[Admin] Nuova richiesta consulenza',
        text: [
          'Cliente: {{customer.fullName}}',
          'Email: {{customer.email}}',
          'Telefono: {{customer.phone}}',
          'Skin type: {{consultation.skinType}}',
          'Concerns: {{consultation.concerns}}',
          'Source: {{consultation.source}}',
          'Locale: {{consultation.locale}}',
          'Page path: {{consultation.pagePath}}',
          'Messaggio: {{consultation.message}}',
        ].join('\n'),
        html: `
          <p><strong>Cliente:</strong> {{customer.fullName}}</p>
          <p><strong>Email:</strong> {{customer.email}}</p>
          <p><strong>Telefono:</strong> {{customer.phone}}</p>
          <p><strong>Skin type:</strong> {{consultation.skinType}}</p>
          <p><strong>Concerns:</strong> {{consultation.concerns}}</p>
          <p><strong>Source:</strong> {{consultation.source}}</p>
          <p><strong>Locale:</strong> {{consultation.locale}}</p>
          <p><strong>Page path:</strong> {{consultation.pagePath}}</p>
          <p><strong>Messaggio:</strong> {{consultation.message}}</p>
        `,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Consultation admin email failed for ${email || 'unknown-email'}`,
    })
  }
}

export const sendOrderPaidNotifications = async ({
  payload,
  req,
  eventKey = 'order_paid',
  orderID,
  orderNumber,
  customerEmail,
  customerFirstName,
  customerLastName,
  total,
  cartMode,
  productFulfillmentMode,
  appointmentMode,
  appointmentRequestedDate,
  appointmentRequestedTime,
  attachments,
}: AdminOrderNotificationInput) => {
  const adminEmail = getAdminEmail()

  const customerName =
    [customerFirstName, customerLastName].map((value) => normalizeText(value)).filter(Boolean).join(' ') || 'Cliente'

  const appointmentSummary =
    appointmentMode === 'requested_slot'
      ? [formatDate(appointmentRequestedDate), normalizeText(appointmentRequestedTime)].filter(Boolean).join(' · ')
      : appointmentMode === 'contact_later'
        ? 'Da concordare con il cliente'
        : ''
  const orderArtifacts = await buildOrderEmailArtifacts({
    payload,
    req,
    orderID,
    orderNumber,
    cartMode,
    productFulfillmentMode,
    appointmentMode,
    appointmentRequestedDate,
    appointmentRequestedTime,
  })
  const eventData = {
    customer: {
      firstName: normalizeText(customerFirstName),
      lastName: normalizeText(customerLastName),
      fullName: customerName,
      email: normalizeText(customerEmail),
    },
    order: {
      number: normalizeText(orderNumber),
      total: formatCurrency(total),
      cartMode: normalizeText(cartMode),
      cartModeLabel: orderArtifacts.cartModeLabel,
      productFulfillmentMode: normalizeText(productFulfillmentMode),
      productFulfillmentModeLabel: orderArtifacts.productFulfillmentModeLabel,
      itemsHtml: orderArtifacts.itemsHtml,
      itemsText: orderArtifacts.itemsText,
    },
    appointment: {
      mode: normalizeText(appointmentMode),
      modeLabel: orderArtifacts.appointmentModeLabel,
      date: formatDate(appointmentRequestedDate),
      time: normalizeText(appointmentRequestedTime),
      summary: appointmentSummary || orderArtifacts.appointmentSummary,
    },
    account: {
      ordersUrl: orderArtifacts.accountOrdersUrl,
    },
  }

  const customerSubject =
    eventKey === 'order_created'
      ? 'Abbiamo ricevuto il tuo ordine {{order.number}}'
      : 'Conferma ordine {{order.number}}'
  const adminSubject =
    eventKey === 'order_created'
      ? '[Admin] Nuovo ordine {{order.number}}'
      : '[Admin] Nuovo ordine pagato {{order.number}}'

  if (isEmail(customerEmail)) {
    try {
      await sendBusinessEventEmail({
        payload,
        req,
        eventKey,
        channel: 'customer',
        locale: 'it',
        to: customerEmail,
        data: eventData,
        attachments,
        relatedCollection: 'orders',
        relatedID: orderNumber,
        fallback: {
          subject: customerSubject,
          text: [
            'Ciao {{customer.firstName}},',
            '',
            eventKey === 'order_created'
              ? 'abbiamo registrato il tuo ordine {{order.number}}.'
              : 'abbiamo ricevuto il tuo ordine {{order.number}}.',
            'Totale: {{order.total}}',
            'Carrello: {{order.cartModeLabel}}',
            'Fulfillment: {{order.productFulfillmentModeLabel}}',
            'Appuntamento: {{appointment.summary}}',
            '',
            'Riepilogo:',
            '{{order.itemsText}}',
            '',
            'Grazie,',
            'DOB Milano',
          ].join('\n'),
          html: `
            <p>Ciao {{customer.firstName}},</p>
            <p>${
              eventKey === 'order_created'
                ? 'abbiamo registrato il tuo ordine <strong>{{order.number}}</strong>.'
                : 'abbiamo ricevuto il tuo ordine <strong>{{order.number}}</strong>.'
            }</p>
            <p>Totale: <strong>{{order.total}}</strong></p>
            <p><strong>Carrello:</strong> {{order.cartModeLabel}}</p>
            <p><strong>Fulfillment:</strong> {{order.productFulfillmentModeLabel}}</p>
            <p><strong>Appuntamento:</strong> {{appointment.summary}}</p>
            <div>{{order.itemsHtml}}</div>
            <p>Grazie,<br/>DOB Milano</p>
          `,
        },
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Order confirmation email failed for order ${orderNumber}`,
      })
    }
  }

  if (!isEmail(adminEmail)) return

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey,
      channel: 'admin',
      locale: 'it',
      to: adminEmail,
      data: eventData,
      relatedCollection: 'orders',
      relatedID: orderNumber,
      fallback: {
        subject: adminSubject,
        text: [
          'Ordine: {{order.number}}',
          'Cliente: {{customer.fullName}}',
          'Email: {{customer.email}}',
          'Totale: {{order.total}}',
          'Carrello: {{order.cartModeLabel}}',
          'Fulfillment: {{order.productFulfillmentModeLabel}}',
          'Appointment mode: {{appointment.modeLabel}}',
          'Appuntamento: {{appointment.summary}}',
          '',
          'Riepilogo:',
          '{{order.itemsText}}',
        ].join('\n'),
        html: `
          <p><strong>Ordine:</strong> {{order.number}}</p>
          <p><strong>Cliente:</strong> {{customer.fullName}}</p>
          <p><strong>Email:</strong> {{customer.email}}</p>
          <p><strong>Totale:</strong> {{order.total}}</p>
          <p><strong>Carrello:</strong> {{order.cartModeLabel}}</p>
          <p><strong>Fulfillment:</strong> {{order.productFulfillmentModeLabel}}</p>
          <p><strong>Appointment mode:</strong> {{appointment.modeLabel}}</p>
          <p><strong>Appuntamento:</strong> {{appointment.summary}}</p>
          <div>{{order.itemsHtml}}</div>
        `,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Order admin notification failed for order ${orderNumber}`,
    })
  }
}

export const sendAppointmentStatusNotifications = async ({
  payload,
  req,
  nextStatus,
  customerEmail,
  customerName,
  orderNumber,
  proposedDate,
  proposedTime,
  requestedDate,
  requestedTime,
  note,
}: AppointmentStatusNotificationInput) => {
  const adminEmail = getAdminEmail()
  const slotText =
    nextStatus === 'alternative_proposed'
      ? [formatDate(proposedDate), normalizeText(proposedTime)].filter(Boolean).join(' · ') || 'Da definire'
      : [formatDate(proposedDate || requestedDate), normalizeText(proposedTime || requestedTime)]
          .filter(Boolean)
          .join(' · ') || 'Da definire'

  const subject =
    nextStatus === 'alternative_proposed'
      ? `Proposta nuovo appuntamento per ordine ${orderNumber}`
      : nextStatus === 'confirmed_by_customer'
        ? `Conferma cliente ricevuta per ordine ${orderNumber}`
        : `Appuntamento confermato per ordine ${orderNumber}`

  const bodyIntro =
    nextStatus === 'alternative_proposed'
      ? `ti proponiamo un'alternativa per il tuo appuntamento relativo all'ordine ${orderNumber}.`
      : nextStatus === 'confirmed_by_customer'
        ? `abbiamo registrato la tua conferma per l'appuntamento relativo all'ordine ${orderNumber}.`
        : `il tuo appuntamento per l'ordine ${orderNumber} è stato confermato.`

  const text = [
    `Ciao ${customerName},`,
    '',
    bodyIntro,
    `Slot: ${slotText}`,
    note ? `Nota: ${note}` : '',
    '',
    nextStatus === 'alternative_proposed' ? 'Ti contatteremo per conferma.' : 'A presto,',
    'DOB Milano',
  ]
    .filter(Boolean)
    .join('\n')

  const html = `
    <p>Ciao ${customerName},</p>
    <p>${bodyIntro}</p>
    <p><strong>Slot:</strong> ${slotText}</p>
    ${note ? `<p><strong>Nota:</strong> ${note}</p>` : ''}
    <p>${nextStatus === 'alternative_proposed' ? 'Ti contatteremo per conferma.' : 'A presto,'}<br/>DOB Milano</p>
  `

  if (isEmail(customerEmail)) {
    try {
      await sendBusinessEventEmail({
        payload,
        req,
        eventKey:
          nextStatus === 'alternative_proposed'
            ? 'appointment_alternative_proposed'
            : nextStatus === 'confirmed_by_customer'
              ? 'appointment_confirmed_by_customer'
              : 'appointment_confirmed',
        channel: 'customer',
        locale: 'it',
        to: customerEmail,
        data: {
          customer: {
            fullName: customerName,
            email: normalizeText(customerEmail),
          },
          order: { number: normalizeText(orderNumber) },
          appointment: {
            date: formatDate(proposedDate || requestedDate),
            time: normalizeText(proposedTime || requestedTime),
            note: normalizeText(note),
          },
        },
        relatedCollection: 'orders',
        relatedID: orderNumber,
        fallback: { subject, text, html },
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Appointment customer notification failed for order ${orderNumber}`,
      })
    }
  }

  if (!isEmail(adminEmail)) return

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey:
        nextStatus === 'alternative_proposed'
          ? 'appointment_alternative_proposed'
          : nextStatus === 'confirmed_by_customer'
            ? 'appointment_confirmed_by_customer'
            : 'appointment_confirmed',
      channel: 'admin',
      locale: 'it',
      to: adminEmail,
      data: {
        customer: {
          fullName: customerName,
          email: normalizeText(customerEmail),
        },
        order: { number: normalizeText(orderNumber) },
        appointment: {
          date: formatDate(proposedDate || requestedDate),
          time: normalizeText(proposedTime || requestedTime),
          note: normalizeText(note),
        },
      },
      relatedCollection: 'orders',
      relatedID: orderNumber,
      fallback: {
        subject: `[Admin] ${subject}`,
        text: `Customer: ${customerEmail || 'n/a'}\n${text}`,
        html: `<p><strong>Customer:</strong> ${customerEmail || 'n/a'}</p>${html}`,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Appointment admin notification failed for order ${orderNumber}`,
    })
  }
}

export const sendAppointmentCancelledNotifications = async ({
  payload,
  req,
  customerEmail,
  customerName,
  orderNumber,
  requestedDate,
  requestedTime,
  proposedDate,
  proposedTime,
  note,
}: AppointmentCancelledNotificationInput) => {
  const adminEmail = getAdminEmail()
  const slotText =
    [formatDate(proposedDate || requestedDate), normalizeText(proposedTime || requestedTime)]
      .filter(Boolean)
      .join(' · ') || 'Da ridefinire'
  const eventData = {
    customer: {
      fullName: normalizeText(customerName),
      email: normalizeText(customerEmail),
    },
    order: { number: normalizeText(orderNumber) },
    appointment: {
      date: formatDate(proposedDate || requestedDate),
      time: normalizeText(proposedTime || requestedTime),
      note: normalizeText(note),
      summary: slotText,
    },
  }

  const subject = 'Aggiornamento appuntamento per ordine {{order.number}}'
  const text = [
    'Ciao {{customer.fullName}},',
    '',
    'il tuo appuntamento relativo all’ordine {{order.number}} è stato annullato o rimesso da definire.',
    'Slot precedente: {{appointment.summary}}',
    '{{appointment.note}}',
    '',
    'DOB Milano',
  ].join('\n')
  const html = `
    <p>Ciao {{customer.fullName}},</p>
    <p>il tuo appuntamento relativo all’ordine <strong>{{order.number}}</strong> è stato annullato o rimesso da definire.</p>
    <p><strong>Slot precedente:</strong> {{appointment.summary}}</p>
    <p>{{appointment.note}}</p>
    <p>DOB Milano</p>
  `

  if (isEmail(customerEmail)) {
    try {
      await sendBusinessEventEmail({
        payload,
        req,
        eventKey: 'appointment_cancelled',
        channel: 'customer',
        locale: 'it',
        to: customerEmail,
        data: eventData,
        relatedCollection: 'orders',
        relatedID: orderNumber,
        fallback: { subject, text, html },
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Appointment cancelled customer notification failed for order ${orderNumber}`,
      })
    }
  }

  if (!isEmail(adminEmail)) return

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey: 'appointment_cancelled',
      channel: 'admin',
      locale: 'it',
      to: adminEmail,
      data: eventData,
      relatedCollection: 'orders',
      relatedID: orderNumber,
      fallback: {
        subject: `[Admin] ${subject}`,
        text: `Customer: ${customerEmail || 'n/a'}\n${text}`,
        html: `<p><strong>Customer:</strong> ${customerEmail || 'n/a'}</p>${html}`,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Appointment cancelled admin notification failed for order ${orderNumber}`,
    })
  }
}

export const sendServiceDateRequestNotifications = async ({
  payload,
  req,
  orderNumber,
  customerEmail,
  customerName,
  requestedDate,
  requestedTime,
}: ServiceDateRequestNotificationInput) => {
  const adminEmail = getAdminEmail()
  const slotText = [formatDate(requestedDate), normalizeText(requestedTime)].filter(Boolean).join(' · ') || 'Da definire'
  const eventData = {
    customer: {
      fullName: normalizeText(customerName),
      email: normalizeText(customerEmail),
    },
    order: { number: normalizeText(orderNumber) },
    appointment: {
      date: formatDate(requestedDate),
      time: normalizeText(requestedTime),
      summary: slotText,
    },
  }

  if (isEmail(customerEmail)) {
    try {
      await sendBusinessEventEmail({
        payload,
        req,
        eventKey: 'appointment_requested',
        channel: 'customer',
        locale: 'it',
        to: customerEmail,
        data: eventData,
        relatedCollection: 'orders',
        relatedID: orderNumber,
        fallback: {
          subject: `Richiesta data ricevuta per ordine {{order.number}}`,
          text: [
            'Ciao {{customer.fullName}},',
            '',
            "abbiamo ricevuto la tua proposta di appuntamento per l'ordine {{order.number}}.",
            'Slot richiesto: {{appointment.summary}}',
            '',
            'Ti ricontatteremo appena confermato.',
            'DOB Milano',
          ].join('\n'),
          html: `
            <p>Ciao {{customer.fullName}},</p>
            <p>abbiamo ricevuto la tua proposta di appuntamento per l'ordine <strong>{{order.number}}</strong>.</p>
            <p><strong>Slot richiesto:</strong> {{appointment.summary}}</p>
            <p>Ti ricontatteremo appena confermato.<br/>DOB Milano</p>
          `,
        },
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Service date request customer notification failed for order ${orderNumber}`,
      })
    }
  }

  if (!isEmail(adminEmail)) return

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey: 'appointment_requested',
      channel: 'admin',
      locale: 'it',
      to: adminEmail,
      data: eventData,
      relatedCollection: 'orders',
      relatedID: orderNumber,
      fallback: {
        subject: '[Admin] Nuova richiesta data per ordine {{order.number}}',
        text: [
          'Cliente: {{customer.fullName}}',
          'Email: {{customer.email}}',
          'Slot richiesto: {{appointment.summary}}',
        ].join('\n'),
        html: `
          <p><strong>Cliente:</strong> {{customer.fullName}}</p>
          <p><strong>Email:</strong> {{customer.email}}</p>
          <p><strong>Slot richiesto:</strong> {{appointment.summary}}</p>
        `,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Service date request admin notification failed for order ${orderNumber}`,
    })
  }
}

export const sendAdminUserNotification = async ({
  payload,
  req,
  eventKey,
  firstName,
  lastName,
  email,
  roles,
}: UserAdminNotificationInput) => {
  const adminEmail = getAdminEmail()
  if (!isEmail(adminEmail)) return

  const fullName = [normalizeText(firstName), normalizeText(lastName)].filter(Boolean).join(' ') || 'Cliente'
  const rolesLabel = Array.isArray(roles) ? roles.filter(Boolean).join(', ') : ''

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey,
      channel: 'admin',
      locale: 'it',
      to: adminEmail,
      data: {
        user: {
          firstName: normalizeText(firstName),
          lastName: normalizeText(lastName),
          fullName,
          email: normalizeText(email),
          roles: rolesLabel,
        },
      },
      relatedCollection: 'users',
      relatedID: email,
      fallback: {
        subject:
          eventKey === 'user_verified'
            ? '[Admin] Utente verificato'
            : '[Admin] Nuovo utente registrato',
        text:
          eventKey === 'user_verified'
            ? ['Utente: {{user.fullName}}', 'Email: {{user.email}}'].join('\n')
            : ['Utente: {{user.fullName}}', 'Email: {{user.email}}', 'Ruoli: {{user.roles}}'].join('\n'),
        html:
          eventKey === 'user_verified'
            ? `
              <p><strong>Utente:</strong> {{user.fullName}}</p>
              <p><strong>Email:</strong> {{user.email}}</p>
            `
            : `
              <p><strong>Utente:</strong> {{user.fullName}}</p>
              <p><strong>Email:</strong> {{user.email}}</p>
              <p><strong>Ruoli:</strong> {{user.roles}}</p>
            `,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Admin user notification failed for ${email || 'unknown-user'}`,
    })
  }
}

export const sendUserRegisteredCustomerNotification = async ({
  payload,
  req,
  firstName,
  lastName,
  email,
  roles,
}: UserAdminNotificationInput) => {
  if (!isEmail(email)) return

  const fullName = [normalizeText(firstName), normalizeText(lastName)].filter(Boolean).join(' ') || 'Cliente'
  const rolesLabel = Array.isArray(roles) ? roles.filter(Boolean).join(', ') : ''

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey: 'user_registered',
      channel: 'customer',
      locale: 'it',
      to: email,
      data: {
        user: {
          firstName: normalizeText(firstName),
          lastName: normalizeText(lastName),
          fullName,
          email: normalizeText(email),
          roles: rolesLabel,
        },
      },
      relatedCollection: 'users',
      relatedID: email,
      fallback: {
        subject: 'Benvenuto su DOB Milano',
        text: [
          'Ciao {{user.fullName}},',
          '',
          'il tuo account DOB Milano è stato creato correttamente.',
          'Controlla la tua casella email per completare la verifica dell’account.',
          '',
          'DOB Milano',
        ].join('\n'),
        html: `
          <p>Ciao {{user.fullName}},</p>
          <p>il tuo account DOB Milano è stato creato correttamente.</p>
          <p>Controlla la tua casella email per completare la verifica dell’account.</p>
          <p>DOB Milano</p>
        `,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Customer user notification failed for ${email || 'unknown-user'}`,
    })
  }
}

export const sendAdminAuthEventNotification = async ({
  payload,
  req,
  eventKey,
  email,
  ip,
  userAgent,
  message,
}: AuthAdminNotificationInput) => {
  const adminEmail = getAdminEmail()
  if (!isEmail(adminEmail)) return

  const subjectMap: Record<AuthAdminNotificationInput['eventKey'], string> = {
    login_success_admin_notice: '[Admin] Login riuscito',
    login_failed_admin_notice: '[Admin] Login fallito',
    password_reset_requested: '[Admin] Reset password richiesto',
    password_reset_completed: '[Admin] Reset password completato',
  }

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey,
      channel: 'admin',
      locale: 'it',
      to: adminEmail,
      data: {
        user: {
          email: normalizeText(email),
        },
        auth: {
          ip: normalizeText(ip),
          userAgent: normalizeText(userAgent),
          message: normalizeText(message),
        },
      },
      relatedCollection: 'auth-audit-events',
      relatedID: email || '',
      fallback: {
        subject: subjectMap[eventKey],
        text: [
          'Email: {{user.email}}',
          'IP: {{auth.ip}}',
          'User agent: {{auth.userAgent}}',
          'Messaggio: {{auth.message}}',
        ].join('\n'),
        html: `
          <p><strong>Email:</strong> {{user.email}}</p>
          <p><strong>IP:</strong> {{auth.ip}}</p>
          <p><strong>User agent:</strong> {{auth.userAgent}}</p>
          <p><strong>Messaggio:</strong> {{auth.message}}</p>
        `,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Admin auth event notification failed for ${eventKey}`,
    })
  }
}

export const sendOrderLifecycleNotifications = async ({
  payload,
  req,
  eventKey,
  orderID,
  orderNumber,
  customerEmail,
  customerFirstName,
  customerLastName,
  total,
  reason,
}: OrderLifecycleNotificationInput) => {
  const adminEmail = getAdminEmail()
  const customerName =
    [customerFirstName, customerLastName].map((value) => normalizeText(value)).filter(Boolean).join(' ') || 'Cliente'
  const orderArtifacts = await buildOrderEmailArtifacts({
    payload,
    req,
    orderID,
    orderNumber,
  })
  const eventData = {
    customer: {
      firstName: normalizeText(customerFirstName),
      lastName: normalizeText(customerLastName),
      fullName: customerName,
      email: normalizeText(customerEmail),
    },
    order: {
      number: normalizeText(orderNumber),
      total: formatCurrency(total),
      itemsHtml: orderArtifacts.itemsHtml,
      itemsText: orderArtifacts.itemsText,
    },
    payment: {
      reason: normalizeText(reason),
    },
    account: {
      ordersUrl: orderArtifacts.accountOrdersUrl,
    },
  }

  const subjectMap: Record<OrderLifecycleNotificationInput['eventKey'], string> = {
    order_payment_failed: 'Pagamento non riuscito per ordine {{order.number}}',
    order_cancelled: 'Ordine {{order.number}} annullato',
    order_refunded: 'Ordine {{order.number}} rimborsato',
  }

  if (isEmail(customerEmail)) {
    try {
      await sendBusinessEventEmail({
        payload,
        req,
        eventKey,
        channel: 'customer',
        locale: 'it',
        to: customerEmail,
        data: eventData,
        relatedCollection: 'orders',
        relatedID: orderNumber,
        fallback: {
          subject: subjectMap[eventKey],
          text: [
            'Ciao {{customer.fullName}},',
            '',
            eventKey === 'order_payment_failed'
              ? 'non siamo riusciti a processare il pagamento per l’ordine {{order.number}}.'
              : eventKey === 'order_cancelled'
                ? "il tuo ordine {{order.number}} è stato annullato."
                : 'il tuo ordine {{order.number}} è stato rimborsato.',
            'Totale: {{order.total}}',
            eventKey === 'order_payment_failed' ? 'Motivo: {{payment.reason}}' : '',
            '',
            'Riepilogo:',
            '{{order.itemsText}}',
            '',
            'DOB Milano',
          ].join('\n'),
          html: `
            <p>Ciao {{customer.fullName}},</p>
            <p>${
              eventKey === 'order_payment_failed'
                ? 'non siamo riusciti a processare il pagamento per l’ordine <strong>{{order.number}}</strong>.'
                : eventKey === 'order_cancelled'
                ? 'il tuo ordine <strong>{{order.number}}</strong> è stato annullato.'
                : 'il tuo ordine <strong>{{order.number}}</strong> è stato rimborsato.'
            }</p>
            <p><strong>Totale:</strong> {{order.total}}</p>
            ${eventKey === 'order_payment_failed' ? '<p><strong>Motivo:</strong> {{payment.reason}}</p>' : ''}
            <div>{{order.itemsHtml}}</div>
            <p>DOB Milano</p>
          `,
        },
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Customer order lifecycle notification failed for ${orderNumber}`,
      })
    }
  }

  if (!isEmail(adminEmail)) return

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey,
      channel: 'admin',
      locale: 'it',
      to: adminEmail,
      data: eventData,
      relatedCollection: 'orders',
      relatedID: orderNumber,
      fallback: {
        subject: `[Admin] ${subjectMap[eventKey]}`,
        text: [
          'Ordine: {{order.number}}',
          'Cliente: {{customer.fullName}}',
          'Email: {{customer.email}}',
          'Totale: {{order.total}}',
          'Motivo: {{payment.reason}}',
          '',
          'Riepilogo:',
          '{{order.itemsText}}',
        ].join('\n'),
        html: `
          <p><strong>Ordine:</strong> {{order.number}}</p>
          <p><strong>Cliente:</strong> {{customer.fullName}}</p>
          <p><strong>Email:</strong> {{customer.email}}</p>
          <p><strong>Totale:</strong> {{order.total}}</p>
          <p><strong>Motivo:</strong> {{payment.reason}}</p>
          <div>{{order.itemsHtml}}</div>
        `,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Admin order lifecycle notification failed for ${orderNumber}`,
    })
  }
}

export const sendShipmentNotifications = async ({
  payload,
  req,
  eventKey,
  orderID,
  orderNumber,
  customerEmail,
  customerFirstName,
  customerLastName,
  trackingNumber,
  trackingUrl,
}: ShipmentNotificationInput) => {
  const adminEmail = getAdminEmail()
  const customerName =
    [customerFirstName, customerLastName].map((value) => normalizeText(value)).filter(Boolean).join(' ') || 'Cliente'
  const orderArtifacts = await buildOrderEmailArtifacts({
    payload,
    req,
    orderID,
    orderNumber,
  })
  const eventData = {
    customer: {
      firstName: normalizeText(customerFirstName),
      lastName: normalizeText(customerLastName),
      fullName: customerName,
      email: normalizeText(customerEmail),
    },
    order: {
      number: normalizeText(orderNumber),
      itemsHtml: orderArtifacts.itemsHtml,
      itemsText: orderArtifacts.itemsText,
    },
    shipping: {
      trackingNumber: normalizeText(trackingNumber),
      trackingUrl: normalizeText(trackingUrl),
    },
    account: {
      ordersUrl: orderArtifacts.accountOrdersUrl,
    },
  }

  const subject =
    eventKey === 'tracking_available'
      ? 'Tracking disponibile per ordine {{order.number}}'
      : 'Spedizione creata per ordine {{order.number}}'

  if (isEmail(customerEmail)) {
    try {
      await sendBusinessEventEmail({
        payload,
        req,
        eventKey,
        channel: 'customer',
        locale: 'it',
        to: customerEmail,
        data: eventData,
        relatedCollection: 'orders',
        relatedID: orderNumber,
        fallback: {
          subject,
          text: [
            'Ciao {{customer.fullName}},',
            '',
            'il tuo ordine {{order.number}} è in spedizione.',
            'Tracking: {{shipping.trackingNumber}}',
            'Link: {{shipping.trackingUrl}}',
            '',
            'Riepilogo:',
            '{{order.itemsText}}',
            '',
            'DOB Milano',
          ].join('\n'),
          html: `
            <p>Ciao {{customer.fullName}},</p>
            <p>il tuo ordine <strong>{{order.number}}</strong> è in spedizione.</p>
            <p><strong>Tracking:</strong> {{shipping.trackingNumber}}</p>
            <p><strong>Link:</strong> <a href="{{shipping.trackingUrl}}">{{shipping.trackingUrl}}</a></p>
            <div>{{order.itemsHtml}}</div>
            <p>DOB Milano</p>
          `,
        },
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Customer shipment notification failed for ${orderNumber}`,
      })
    }
  }

  if (!isEmail(adminEmail)) return

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey,
      channel: 'admin',
      locale: 'it',
      to: adminEmail,
      data: eventData,
      relatedCollection: 'orders',
      relatedID: orderNumber,
      fallback: {
        subject: `[Admin] ${subject}`,
        text: [
          'Ordine: {{order.number}}',
          'Cliente: {{customer.fullName}}',
          'Email: {{customer.email}}',
          'Tracking: {{shipping.trackingNumber}}',
          'Link: {{shipping.trackingUrl}}',
          '',
          'Riepilogo:',
          '{{order.itemsText}}',
        ].join('\n'),
        html: `
          <p><strong>Ordine:</strong> {{order.number}}</p>
          <p><strong>Cliente:</strong> {{customer.fullName}}</p>
          <p><strong>Email:</strong> {{customer.email}}</p>
          <p><strong>Tracking:</strong> {{shipping.trackingNumber}}</p>
          <p><strong>Link:</strong> <a href="{{shipping.trackingUrl}}">{{shipping.trackingUrl}}</a></p>
          <div>{{order.itemsHtml}}</div>
        `,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Admin shipment notification failed for ${orderNumber}`,
    })
  }
}

export const sendProductWaitlistAvailableNotification = async ({
  payload,
  req,
  customerEmail,
  customerFirstName,
  customerLastName,
  productTitle,
  productSlug,
  productBrand,
  locale,
}: ProductWaitlistNotificationInput) => {
  const normalizedEmail = normalizeText(customerEmail)
  const normalizedTitle = normalizeText(productTitle)
  const normalizedSlug = normalizeText(productSlug)
  if (!isEmail(normalizedEmail) || !normalizedTitle || !normalizedSlug) return

  const resolvedLocale = resolvePreferredLocale(locale)
  const fullName = getFullName(customerFirstName, customerLastName)
  const origin = getPublicSiteOrigin(req?.headers)
  const accountProductsUrl = `${origin}/${resolvedLocale}/account?section=orders`

  try {
    await sendBusinessEventEmail({
      payload,
      req,
      eventKey: 'product_waitlist_back_in_stock',
      channel: 'customer',
      locale: resolvedLocale,
      to: normalizedEmail,
      data: {
        customer: {
          firstName: normalizeText(customerFirstName),
          lastName: normalizeText(customerLastName),
          fullName,
          email: normalizedEmail,
        },
        product: {
          title: normalizedTitle,
          slug: normalizedSlug,
          brand: normalizeText(productBrand),
        },
        account: {
          productsUrl: accountProductsUrl,
        },
      },
      relatedCollection: 'products',
      relatedID: normalizedSlug,
      fallback: {
        subject: 'Il prodotto che aspettavi e di nuovo disponibile',
        text: [
          'Ciao {{customer.fullName}},',
          '',
          'il prodotto {{product.title}} e di nuovo disponibile.',
          'Trovi il prodotto nella tua area account, sezione Prodotti > Waitlist.',
          '{{account.productsUrl}}',
          '',
          'DOB Milano',
        ].join('\n'),
        html: `
          <p>Ciao {{customer.fullName}},</p>
          <p>il prodotto <strong>{{product.title}}</strong> e di nuovo disponibile.</p>
          <p>Trovi il prodotto nella tua area account, sezione <strong>Prodotti</strong> sotto <strong>Waitlist</strong>.</p>
          <p><a href="{{account.productsUrl}}">Apri area account</a></p>
          <p>DOB Milano</p>
        `,
      },
    })
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Waitlist availability notification failed for ${normalizedSlug}:${normalizedEmail}`,
    })
    throw error
  }
}

export const sendNewsletterNotifications = async ({
  payload,
  req,
  eventKey,
  title,
  slug,
  price,
  durationMinutes,
  brand,
}: NewsletterNotificationInput) => {
  const adminEmail = getAdminEmail()
  const normalizedTitle = normalizeText(title)
  const normalizedSlug = normalizeText(slug)

  if (!normalizedTitle || !normalizedSlug) return

  const origin = getPublicSiteOrigin(req?.headers)
  const itemPath =
    eventKey === 'newsletter_service_created'
      ? `/${'it'}${toPublicSeoPath('it', `/services/service/${normalizedSlug}`)}`
      : `/it/shop/${normalizedSlug}`
  const itemUrl = `${origin}${itemPath}`

  const adminData =
    eventKey === 'newsletter_service_created'
      ? {
          service: {
            name: normalizedTitle,
            slug: normalizedSlug,
            price: typeof price === 'number' ? formatCurrency(price) : '',
            durationMinutes:
              typeof durationMinutes === 'number' && Number.isFinite(durationMinutes)
                ? String(durationMinutes)
                : '',
            url: itemUrl,
          },
        }
      : {
          product: {
            title: normalizedTitle,
            slug: normalizedSlug,
            price: typeof price === 'number' ? formatCurrency(price) : '',
            brand: normalizeText(brand),
            url: itemUrl,
          },
        }

  if (isEmail(adminEmail)) {
    try {
      await sendBusinessEventEmail({
        payload,
        req,
        eventKey,
        channel: 'admin',
        locale: 'it',
        to: adminEmail,
        data: adminData,
        relatedCollection: eventKey === 'newsletter_service_created' ? 'services' : 'products',
        relatedID: normalizedSlug,
        fallback: {
          subject:
            eventKey === 'newsletter_service_created'
              ? 'Nuovo servizio disponibile: {{service.name}}'
              : 'Nuovo prodotto disponibile: {{product.title}}',
          text:
            eventKey === 'newsletter_service_created'
              ? [
                  'Nuovo servizio pubblicato.',
                  'Servizio: {{service.name}}',
                  'Prezzo: {{service.price}}',
                  'Durata: {{service.durationMinutes}}',
                  'Link: {{service.url}}',
                ].join('\n')
              : [
                  'Nuovo prodotto pubblicato.',
                  'Prodotto: {{product.title}}',
                  'Brand: {{product.brand}}',
                  'Prezzo: {{product.price}}',
                  'Link: {{product.url}}',
                ].join('\n'),
          html:
            eventKey === 'newsletter_service_created'
              ? `
                <p><strong>Nuovo servizio pubblicato.</strong></p>
                <p><strong>Servizio:</strong> {{service.name}}</p>
                <p><strong>Prezzo:</strong> {{service.price}}</p>
                <p><strong>Durata:</strong> {{service.durationMinutes}}</p>
                <p><a href="{{service.url}}">{{service.url}}</a></p>
              `
              : `
                <p><strong>Nuovo prodotto pubblicato.</strong></p>
                <p><strong>Prodotto:</strong> {{product.title}}</p>
                <p><strong>Brand:</strong> {{product.brand}}</p>
                <p><strong>Prezzo:</strong> {{product.price}}</p>
                <p><a href="{{product.url}}">{{product.url}}</a></p>
              `,
        },
      })
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: `Admin newsletter notification failed for ${normalizedSlug}`,
      })
    }
  }

  let page = 1
  const limit = 100

  while (true) {
    const result = await payload.find({
      collection: 'users',
      depth: 0,
      limit,
      page,
      overrideAccess: true,
      ...(req ? { req } : {}),
      where: {
        and: [
          { 'preferences.marketingOptIn': { equals: true } },
          { _verified: { equals: true } },
        ],
      },
    })

    for (const user of result.docs) {
      const customerEmail = normalizeText(user.email)
      if (!isEmail(customerEmail)) continue

      const locale = resolvePreferredLocale(user.preferences?.preferredLocale)
      const firstName = normalizeText(user.firstName)
      const lastName = normalizeText(user.lastName)
      const fullName = getFullName(firstName, lastName)

      const customerData =
        eventKey === 'newsletter_service_created'
          ? {
              customer: {
                firstName,
                lastName,
                fullName,
                email: customerEmail,
              },
              service: {
                name: normalizedTitle,
                slug: normalizedSlug,
                price: typeof price === 'number' ? formatCurrency(price) : '',
                durationMinutes:
                  typeof durationMinutes === 'number' && Number.isFinite(durationMinutes)
                    ? String(durationMinutes)
                    : '',
                url:
                  eventKey === 'newsletter_service_created'
                    ? `${origin}/${locale}${toPublicSeoPath(locale, `/services/service/${normalizedSlug}`)}`
                    : itemUrl,
              },
            }
          : {
              customer: {
                firstName,
                lastName,
                fullName,
                email: customerEmail,
              },
              product: {
                title: normalizedTitle,
                slug: normalizedSlug,
                price: typeof price === 'number' ? formatCurrency(price) : '',
                brand: normalizeText(brand),
                url: `${origin}/${locale}/shop/${normalizedSlug}`,
              },
            }

      try {
        await sendBusinessEventEmail({
          payload,
          req,
          eventKey,
          channel: 'customer',
          locale,
          to: customerEmail,
          data: customerData,
          relatedCollection: eventKey === 'newsletter_service_created' ? 'services' : 'products',
          relatedID: normalizedSlug,
          fallback: {
            subject:
              eventKey === 'newsletter_service_created'
                ? 'Nuovo servizio DOB Milano: {{service.name}}'
                : 'Nuovo prodotto DOB Milano: {{product.title}}',
            text:
              eventKey === 'newsletter_service_created'
                ? [
                    'Ciao {{customer.fullName}},',
                    '',
                    'Abbiamo pubblicato un nuovo servizio su DOB Milano.',
                    'Servizio: {{service.name}}',
                    'Prezzo: {{service.price}}',
                    'Durata: {{service.durationMinutes}} min',
                    'Scoprilo qui: {{service.url}}',
                  ].join('\n')
                : [
                    'Ciao {{customer.fullName}},',
                    '',
                    'Abbiamo aggiunto un nuovo prodotto su DOB Milano.',
                    'Prodotto: {{product.title}}',
                    'Brand: {{product.brand}}',
                    'Prezzo: {{product.price}}',
                    'Scoprilo qui: {{product.url}}',
                  ].join('\n'),
            html:
              eventKey === 'newsletter_service_created'
                ? `
                  <p>Ciao {{customer.fullName}},</p>
                  <p>Abbiamo pubblicato un nuovo servizio su <strong>DOB Milano</strong>.</p>
                  <p><strong>Servizio:</strong> {{service.name}}</p>
                  <p><strong>Prezzo:</strong> {{service.price}}</p>
                  <p><strong>Durata:</strong> {{service.durationMinutes}} min</p>
                  <p><a href="{{service.url}}">Scopri il servizio</a></p>
                `
                : `
                  <p>Ciao {{customer.fullName}},</p>
                  <p>Abbiamo aggiunto un nuovo prodotto su <strong>DOB Milano</strong>.</p>
                  <p><strong>Prodotto:</strong> {{product.title}}</p>
                  <p><strong>Brand:</strong> {{product.brand}}</p>
                  <p><strong>Prezzo:</strong> {{product.price}}</p>
                  <p><a href="{{product.url}}">Scopri il prodotto</a></p>
                `,
          },
        })
      } catch (error) {
        payload.logger.error({
          err: error,
          msg: `Customer newsletter notification failed for ${normalizedSlug} -> ${customerEmail}`,
        })
      }
    }

    if (page >= result.totalPages) break
    page += 1
  }
}
