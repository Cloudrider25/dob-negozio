import type { Locale } from '@/lib/i18n/core'

export const EMAIL_CHANNEL_OPTIONS = [
  { label: 'Customer', value: 'customer' },
  { label: 'Admin', value: 'admin' },
  { label: 'Internal', value: 'internal' },
] as const

export type EmailChannel = (typeof EMAIL_CHANNEL_OPTIONS)[number]['value']

export const EMAIL_TEMPLATE_TYPE_OPTIONS = [
  { label: 'Auth', value: 'auth' },
  { label: 'Lead', value: 'lead' },
  { label: 'Newsletter', value: 'newsletter' },
  { label: 'Order', value: 'order' },
  { label: 'Appointment', value: 'appointment' },
  { label: 'Shipping', value: 'shipping' },
  { label: 'System', value: 'system' },
] as const

export type EmailTemplateType = (typeof EMAIL_TEMPLATE_TYPE_OPTIONS)[number]['value']

export const EMAIL_EVENT_OPTIONS = [
  { label: 'Email Verification Requested', value: 'email_verification_requested' },
  { label: 'User Registered', value: 'user_registered' },
  { label: 'User Verified', value: 'user_verified' },
  { label: 'Password Reset Requested', value: 'password_reset_requested' },
  { label: 'Password Reset Completed', value: 'password_reset_completed' },
  { label: 'Login Success Admin Notice', value: 'login_success_admin_notice' },
  { label: 'Login Failed Admin Notice', value: 'login_failed_admin_notice' },
  { label: 'Consultation Lead Created', value: 'consultation_lead_created' },
  { label: 'Newsletter Service Created', value: 'newsletter_service_created' },
  { label: 'Newsletter Product Created', value: 'newsletter_product_created' },
  { label: 'Order Created', value: 'order_created' },
  { label: 'Order Paid', value: 'order_paid' },
  { label: 'Order Payment Failed', value: 'order_payment_failed' },
  { label: 'Order Cancelled', value: 'order_cancelled' },
  { label: 'Order Refunded', value: 'order_refunded' },
  { label: 'Appointment Requested', value: 'appointment_requested' },
  { label: 'Appointment Alternative Proposed', value: 'appointment_alternative_proposed' },
  { label: 'Appointment Confirmed', value: 'appointment_confirmed' },
  { label: 'Appointment Confirmed By Customer', value: 'appointment_confirmed_by_customer' },
  { label: 'Appointment Cancelled', value: 'appointment_cancelled' },
  { label: 'Shipment Created', value: 'shipment_created' },
  { label: 'Tracking Available', value: 'tracking_available' },
  { label: 'Email Delivery Failed', value: 'email_delivery_failed' },
] as const

export type EmailEventKey = (typeof EMAIL_EVENT_OPTIONS)[number]['value']

type EmailEventMeta = {
  type: EmailTemplateType
  description: string
  availableVariables: string[]
  testDataExample: Record<string, unknown>
  supportedChannels: EmailChannel[]
  supportedLocales: Locale[]
}

export const EMAIL_EVENT_META: Record<EmailEventKey, EmailEventMeta> = {
  email_verification_requested: {
    type: 'auth',
    description: 'Customer verification email sent after signup with the email verification link.',
    availableVariables: [
      '{{user.firstName}}',
      '{{user.lastName}}',
      '{{user.fullName}}',
      '{{user.email}}',
      '{{auth.verifyUrl}}',
    ],
    testDataExample: {
      user: {
        firstName: 'Alessio',
        lastName: 'Rossi',
        fullName: 'Alessio Rossi',
        email: 'alessio@example.com',
      },
      auth: {
        verifyUrl: 'https://dobmilano.com/it/verify-email?token=example-token',
      },
    },
    supportedChannels: ['customer'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  user_registered: {
    type: 'auth',
    description: 'Notification fired when a user account is created.',
    availableVariables: ['{{user.firstName}}', '{{user.lastName}}', '{{user.fullName}}', '{{user.email}}', '{{user.roles}}'],
    testDataExample: {
      user: {
        firstName: 'Alessio',
        lastName: 'Rossi',
        fullName: 'Alessio Rossi',
        email: 'alessio@example.com',
        roles: 'customer',
      },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  user_verified: {
    type: 'auth',
    description: 'Admin notification fired when a user verifies the account email.',
    availableVariables: ['{{user.firstName}}', '{{user.lastName}}', '{{user.fullName}}', '{{user.email}}'],
    testDataExample: {
      user: {
        firstName: 'Alessio',
        lastName: 'Rossi',
        fullName: 'Alessio Rossi',
        email: 'alessio@example.com',
      },
    },
    supportedChannels: ['admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  password_reset_requested: {
    type: 'auth',
    description: 'Password reset requested notification for customer and admin.',
    availableVariables: [
      '{{user.firstName}}',
      '{{user.lastName}}',
      '{{user.fullName}}',
      '{{user.email}}',
      '{{auth.resetUrl}}',
      '{{auth.ip}}',
      '{{auth.userAgent}}',
    ],
    testDataExample: {
      user: {
        firstName: 'Alessio',
        lastName: 'Rossi',
        fullName: 'Alessio Rossi',
        email: 'alessio@example.com',
      },
      auth: {
        resetUrl: 'https://dobmilano.com/it/reset-password?token=example-token',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  password_reset_completed: {
    type: 'auth',
    description: 'Admin notice when a password reset completes.',
    availableVariables: ['{{user.email}}', '{{auth.ip}}', '{{auth.userAgent}}'],
    testDataExample: {
      user: { email: 'alessio@example.com' },
      auth: { ip: '127.0.0.1', userAgent: 'Mozilla/5.0' },
    },
    supportedChannels: ['admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  login_success_admin_notice: {
    type: 'auth',
    description: 'Admin notice for successful login events.',
    availableVariables: ['{{user.email}}', '{{auth.ip}}', '{{auth.userAgent}}'],
    testDataExample: {
      user: { email: 'alessio@example.com' },
      auth: { ip: '127.0.0.1', userAgent: 'Mozilla/5.0' },
    },
    supportedChannels: ['admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  login_failed_admin_notice: {
    type: 'auth',
    description: 'Admin notice for failed login events.',
    availableVariables: ['{{user.email}}', '{{auth.ip}}', '{{auth.userAgent}}', '{{auth.message}}'],
    testDataExample: {
      user: { email: 'alessio@example.com' },
      auth: { ip: '127.0.0.1', userAgent: 'Mozilla/5.0', message: 'Invalid credentials.' },
    },
    supportedChannels: ['admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  consultation_lead_created: {
    type: 'lead',
    description: 'Consultation lead notification for customer and admin.',
    availableVariables: [
      '{{customer.firstName}}',
      '{{customer.lastName}}',
      '{{customer.fullName}}',
      '{{customer.email}}',
      '{{customer.phone}}',
      '{{consultation.skinType}}',
      '{{consultation.concerns}}',
      '{{consultation.message}}',
      '{{consultation.source}}',
      '{{consultation.locale}}',
      '{{consultation.pagePath}}',
    ],
    testDataExample: {
      customer: {
        firstName: 'Alessia',
        lastName: 'Verdi',
        fullName: 'Alessia Verdi',
        email: 'alessia@example.com',
        phone: '+39 333 0000000',
      },
      consultation: {
        skinType: 'mixed',
        concerns: 'hydration, redness',
        message: 'Vorrei una consulenza.',
        source: 'frontend-form',
        locale: 'it',
        pagePath: '/it/contact',
      },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  newsletter_service_created: {
    type: 'newsletter',
    description: 'Newsletter notification when a new service is published.',
    availableVariables: [
      '{{customer.firstName}}',
      '{{customer.lastName}}',
      '{{customer.fullName}}',
      '{{customer.email}}',
      '{{service.name}}',
      '{{service.slug}}',
      '{{service.price}}',
      '{{service.durationMinutes}}',
      '{{service.url}}',
    ],
    testDataExample: {
      customer: {
        firstName: 'Alessia',
        lastName: 'Verdi',
        fullName: 'Alessia Verdi',
        email: 'alessia@example.com',
      },
      service: {
        name: 'Laser Uomo Viso',
        slug: 'laser-uomo-viso',
        price: 'EUR 95.00',
        durationMinutes: '45',
        url: 'https://dobmilano.com/it/servizi/servizio/laser-uomo-viso',
      },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  newsletter_product_created: {
    type: 'newsletter',
    description: 'Newsletter notification when a new product is published.',
    availableVariables: [
      '{{customer.firstName}}',
      '{{customer.lastName}}',
      '{{customer.fullName}}',
      '{{customer.email}}',
      '{{product.title}}',
      '{{product.slug}}',
      '{{product.price}}',
      '{{product.brand}}',
      '{{product.url}}',
    ],
    testDataExample: {
      customer: {
        firstName: 'Alessia',
        lastName: 'Verdi',
        fullName: 'Alessia Verdi',
        email: 'alessia@example.com',
      },
      product: {
        title: 'HL Vitalise Moisturazing Cream Giorno',
        slug: 'hl-vitalise-moisturazing-cream-giorno',
        price: 'EUR 59.00',
        brand: 'Holy Land',
        url: 'https://dobmilano.com/it/shop/hl-vitalise-moisturazing-cream-giorno',
      },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  order_created: {
    type: 'order',
    description: 'Order created notification before payment capture.',
    availableVariables: [
      '{{customer.firstName}}',
      '{{customer.lastName}}',
      '{{customer.fullName}}',
      '{{customer.email}}',
      '{{order.number}}',
      '{{order.total}}',
      '{{order.cartMode}}',
      '{{order.productFulfillmentMode}}',
      '{{appointment.mode}}',
      '{{appointment.date}}',
      '{{appointment.time}}',
    ],
    testDataExample: {
      customer: {
        firstName: 'Alessio',
        lastName: 'Rossi',
        fullName: 'Alessio Rossi',
        email: 'alessio@example.com',
      },
      order: {
        number: 'DOB-20260313-00001',
        total: 'EUR 120.00',
        cartMode: 'mixed',
        productFulfillmentMode: 'shipping',
      },
      appointment: {
        mode: 'requested_slot',
        date: '13 mar 2026',
        time: '15:00',
      },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  order_paid: {
    type: 'order',
    description: 'Order confirmation for customer and admin after payment/capture.',
    availableVariables: [
      '{{customer.firstName}}',
      '{{customer.lastName}}',
      '{{customer.fullName}}',
      '{{customer.email}}',
      '{{order.number}}',
      '{{order.total}}',
      '{{order.cartMode}}',
      '{{order.productFulfillmentMode}}',
      '{{appointment.mode}}',
      '{{appointment.date}}',
      '{{appointment.time}}',
    ],
    testDataExample: {
      customer: {
        firstName: 'Alessio',
        lastName: 'Rossi',
        fullName: 'Alessio Rossi',
        email: 'alessio@example.com',
      },
      order: {
        number: 'DOB-20260313-00001',
        total: 'EUR 120.00',
        cartMode: 'services_only',
        productFulfillmentMode: 'none',
      },
      appointment: {
        mode: 'requested_slot',
        date: '13 mar 2026',
        time: '15:00',
      },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  order_payment_failed: {
    type: 'order',
    description: 'Notification when an order payment fails.',
    availableVariables: ['{{customer.email}}', '{{order.number}}', '{{order.total}}', '{{payment.reason}}'],
    testDataExample: {
      customer: { email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001', total: 'EUR 120.00' },
      payment: { reason: 'card_declined' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  order_cancelled: {
    type: 'order',
    description: 'Order cancellation notification.',
    availableVariables: ['{{customer.email}}', '{{order.number}}', '{{order.total}}'],
    testDataExample: {
      customer: { email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001', total: 'EUR 120.00' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  order_refunded: {
    type: 'order',
    description: 'Order refund notification.',
    availableVariables: ['{{customer.email}}', '{{order.number}}', '{{order.total}}'],
    testDataExample: {
      customer: { email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001', total: 'EUR 120.00' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  appointment_requested: {
    type: 'appointment',
    description: 'Appointment requested by customer.',
    availableVariables: ['{{customer.fullName}}', '{{customer.email}}', '{{order.number}}', '{{appointment.date}}', '{{appointment.time}}'],
    testDataExample: {
      customer: { fullName: 'Alessio Rossi', email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001' },
      appointment: { date: '13 mar 2026', time: '15:00' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  appointment_alternative_proposed: {
    type: 'appointment',
    description: 'Alternative appointment proposed.',
    availableVariables: ['{{customer.fullName}}', '{{customer.email}}', '{{order.number}}', '{{appointment.date}}', '{{appointment.time}}', '{{appointment.note}}'],
    testDataExample: {
      customer: { fullName: 'Alessio Rossi', email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001' },
      appointment: { date: '14 mar 2026', time: '16:00', note: 'Disponibilita estetista.' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  appointment_confirmed: {
    type: 'appointment',
    description: 'Appointment confirmed by admin.',
    availableVariables: ['{{customer.fullName}}', '{{customer.email}}', '{{order.number}}', '{{appointment.date}}', '{{appointment.time}}', '{{appointment.note}}'],
    testDataExample: {
      customer: { fullName: 'Alessio Rossi', email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001' },
      appointment: { date: '14 mar 2026', time: '16:00', note: '' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  appointment_confirmed_by_customer: {
    type: 'appointment',
    description: 'Customer confirmed the proposed appointment.',
    availableVariables: ['{{customer.fullName}}', '{{customer.email}}', '{{order.number}}', '{{appointment.date}}', '{{appointment.time}}', '{{appointment.note}}'],
    testDataExample: {
      customer: { fullName: 'Alessio Rossi', email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001' },
      appointment: { date: '14 mar 2026', time: '16:00', note: '' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  appointment_cancelled: {
    type: 'appointment',
    description: 'Appointment cancelled or cleared.',
    availableVariables: ['{{customer.fullName}}', '{{customer.email}}', '{{order.number}}'],
    testDataExample: {
      customer: { fullName: 'Alessio Rossi', email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  shipment_created: {
    type: 'shipping',
    description: 'Sendcloud parcel created.',
    availableVariables: ['{{customer.fullName}}', '{{customer.email}}', '{{order.number}}', '{{shipping.trackingNumber}}', '{{shipping.trackingUrl}}'],
    testDataExample: {
      customer: { fullName: 'Alessio Rossi', email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001' },
      shipping: { trackingNumber: 'TRK123', trackingUrl: 'https://tracking.example.com/TRK123' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  tracking_available: {
    type: 'shipping',
    description: 'Tracking data became available.',
    availableVariables: ['{{customer.fullName}}', '{{customer.email}}', '{{order.number}}', '{{shipping.trackingNumber}}', '{{shipping.trackingUrl}}'],
    testDataExample: {
      customer: { fullName: 'Alessio Rossi', email: 'alessio@example.com' },
      order: { number: 'DOB-20260313-00001' },
      shipping: { trackingNumber: 'TRK123', trackingUrl: 'https://tracking.example.com/TRK123' },
    },
    supportedChannels: ['customer', 'admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
  email_delivery_failed: {
    type: 'system',
    description: 'Admin fallback alert when an email delivery attempt fails.',
    availableVariables: ['{{email.eventKey}}', '{{email.channel}}', '{{email.to}}', '{{email.subject}}', '{{email.errorMessage}}'],
    testDataExample: {
      email: {
        eventKey: 'order_paid',
        channel: 'customer',
        to: 'cliente@example.com',
        subject: 'Conferma ordine DOB-20260313-00001',
        errorMessage: 'SMTP timeout',
      },
    },
    supportedChannels: ['admin'],
    supportedLocales: ['it', 'en', 'ru'],
  },
}

export const getEmailEventMeta = (eventKey: EmailEventKey) => EMAIL_EVENT_META[eventKey]

export const getEmailTemplateTypeLabel = (type: EmailTemplateType) =>
  EMAIL_TEMPLATE_TYPE_OPTIONS.find((option) => option.value === type)?.label || type
