import type { Payload } from 'payload'

import { sendSMTPEmail } from '@/lib/server/email/sendSMTPEmail'

type NotificationPayload = Payload

type ConsultationLeadNotificationInput = {
  payload: NotificationPayload
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
}

type AppointmentStatusNotificationInput = {
  payload: NotificationPayload
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

type ServiceDateRequestNotificationInput = {
  payload: NotificationPayload
  orderNumber: string
  customerEmail: string
  customerName: string
  requestedDate: string
  requestedTime: string
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

const getAdminEmail = () =>
  normalizeText(process.env.SHOP_APPOINTMENT_ADMIN_EMAIL) || normalizeText(process.env.ADMIN_EMAIL)

const sendBestEffort = async (
  payload: NotificationPayload,
  args: Parameters<typeof sendSMTPEmail>[0],
  logMessage: string,
) => {
  try {
    await sendSMTPEmail(args)
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: logMessage,
    })
  }
}

export const sendConsultationLeadNotifications = async ({
  payload,
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

  if (isEmail(email)) {
    await sendBestEffort(
      payload,
      {
        payload,
        to: email,
        subject: 'Richiesta consulenza ricevuta',
        text: [
          `Ciao ${customerName},`,
          '',
          'abbiamo ricevuto la tua richiesta di consulenza.',
          'Il team DOB Milano ti contattera presto per il prossimo passo.',
          '',
          'Grazie,',
          'DOB Milano',
        ].join('\n'),
        html: `
          <p>Ciao ${customerName},</p>
          <p>abbiamo ricevuto la tua richiesta di consulenza.</p>
          <p>Il team DOB Milano ti contattera presto per il prossimo passo.</p>
          <p>Grazie,<br/>DOB Milano</p>
        `,
      },
      `Consultation acknowledgement email failed for ${email}`,
    )
  }

  if (!isEmail(adminEmail)) return

  await sendBestEffort(
    payload,
    {
      payload,
      to: adminEmail,
      subject: '[Admin] Nuova richiesta consulenza',
      text: [
        `Cliente: ${customerName}`,
        `Email: ${email || 'n/a'}`,
        `Telefono: ${phone || 'n/a'}`,
        skinType ? `Skin type: ${skinType}` : '',
        cleanConcerns.length ? `Concerns: ${cleanConcerns.join(', ')}` : '',
        source ? `Source: ${source}` : '',
        locale ? `Locale: ${locale}` : '',
        pagePath ? `Page path: ${pagePath}` : '',
        message ? `Messaggio: ${message}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
        <p><strong>Cliente:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${email || 'n/a'}</p>
        <p><strong>Telefono:</strong> ${phone || 'n/a'}</p>
        ${skinType ? `<p><strong>Skin type:</strong> ${skinType}</p>` : ''}
        ${cleanConcerns.length ? `<p><strong>Concerns:</strong> ${cleanConcerns.join(', ')}</p>` : ''}
        ${source ? `<p><strong>Source:</strong> ${source}</p>` : ''}
        ${locale ? `<p><strong>Locale:</strong> ${locale}</p>` : ''}
        ${pagePath ? `<p><strong>Page path:</strong> ${pagePath}</p>` : ''}
        ${message ? `<p><strong>Messaggio:</strong> ${message}</p>` : ''}
      `,
    },
    `Consultation admin email failed for ${email || 'unknown-email'}`,
  )
}

export const sendAdminNewOrderNotification = async ({
  payload,
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
}: AdminOrderNotificationInput) => {
  const adminEmail = getAdminEmail()
  if (!isEmail(adminEmail)) return

  const customerName =
    [customerFirstName, customerLastName].map((value) => normalizeText(value)).filter(Boolean).join(' ') || 'Cliente'

  const appointmentSummary =
    appointmentMode === 'requested_slot'
      ? [formatDate(appointmentRequestedDate), normalizeText(appointmentRequestedTime)].filter(Boolean).join(' · ')
      : appointmentMode === 'contact_later'
        ? 'Da concordare con il cliente'
        : ''

  await sendBestEffort(
    payload,
    {
      payload,
      to: adminEmail,
      subject: `[Admin] Nuovo ordine ${orderNumber}`,
      text: [
        `Ordine: ${orderNumber}`,
        `Cliente: ${customerName}`,
        `Email: ${customerEmail || 'n/a'}`,
        `Totale: ${formatCurrency(total)}`,
        cartMode ? `Cart mode: ${cartMode}` : '',
        productFulfillmentMode ? `Fulfillment: ${productFulfillmentMode}` : '',
        appointmentMode ? `Appointment mode: ${appointmentMode}` : '',
        appointmentSummary ? `Appuntamento: ${appointmentSummary}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
        <p><strong>Ordine:</strong> ${orderNumber}</p>
        <p><strong>Cliente:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail || 'n/a'}</p>
        <p><strong>Totale:</strong> ${formatCurrency(total)}</p>
        ${cartMode ? `<p><strong>Cart mode:</strong> ${cartMode}</p>` : ''}
        ${productFulfillmentMode ? `<p><strong>Fulfillment:</strong> ${productFulfillmentMode}</p>` : ''}
        ${appointmentMode ? `<p><strong>Appointment mode:</strong> ${appointmentMode}</p>` : ''}
        ${appointmentSummary ? `<p><strong>Appuntamento:</strong> ${appointmentSummary}</p>` : ''}
      `,
    },
    `New order admin notification failed for order ${orderNumber}`,
  )
}

export const sendAppointmentStatusNotifications = async ({
  payload,
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
    await sendBestEffort(
      payload,
      {
        payload,
        to: customerEmail,
        subject,
        text,
        html,
      },
      `Appointment customer notification failed for order ${orderNumber}`,
    )
  }

  if (!isEmail(adminEmail)) return

  await sendBestEffort(
    payload,
    {
      payload,
      to: adminEmail,
      subject: `[Admin] ${subject}`,
      text: `Customer: ${customerEmail || 'n/a'}\n${text}`,
      html: `<p><strong>Customer:</strong> ${customerEmail || 'n/a'}</p>${html}`,
    },
    `Appointment admin notification failed for order ${orderNumber}`,
  )
}

export const sendServiceDateRequestNotifications = async ({
  payload,
  orderNumber,
  customerEmail,
  customerName,
  requestedDate,
  requestedTime,
}: ServiceDateRequestNotificationInput) => {
  const adminEmail = getAdminEmail()
  const slotText = [formatDate(requestedDate), normalizeText(requestedTime)].filter(Boolean).join(' · ') || 'Da definire'

  if (isEmail(customerEmail)) {
    await sendBestEffort(
      payload,
      {
        payload,
        to: customerEmail,
        subject: `Richiesta data ricevuta per ordine ${orderNumber}`,
        text: [
          `Ciao ${customerName},`,
          '',
          `abbiamo ricevuto la tua proposta di appuntamento per l'ordine ${orderNumber}.`,
          `Slot richiesto: ${slotText}`,
          '',
          'Ti ricontatteremo appena confermato.',
          'DOB Milano',
        ].join('\n'),
        html: `
          <p>Ciao ${customerName},</p>
          <p>abbiamo ricevuto la tua proposta di appuntamento per l'ordine <strong>${orderNumber}</strong>.</p>
          <p><strong>Slot richiesto:</strong> ${slotText}</p>
          <p>Ti ricontatteremo appena confermato.<br/>DOB Milano</p>
        `,
      },
      `Service date request customer notification failed for order ${orderNumber}`,
    )
  }

  if (!isEmail(adminEmail)) return

  await sendBestEffort(
    payload,
    {
      payload,
      to: adminEmail,
      subject: `[Admin] Nuova richiesta data per ordine ${orderNumber}`,
      text: [
        `Cliente: ${customerName}`,
        `Email: ${customerEmail || 'n/a'}`,
        `Slot richiesto: ${slotText}`,
      ].join('\n'),
      html: `
        <p><strong>Cliente:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail || 'n/a'}</p>
        <p><strong>Slot richiesto:</strong> ${slotText}</p>
      `,
    },
    `Service date request admin notification failed for order ${orderNumber}`,
  )
}
