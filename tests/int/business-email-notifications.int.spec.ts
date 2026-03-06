import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/server/email/sendSMTPEmail', () => ({
  sendSMTPEmail: vi.fn(),
}))

import {
  sendAdminNewOrderNotification,
  sendAppointmentStatusNotifications,
  sendConsultationLeadNotifications,
  sendServiceDateRequestNotifications,
} from '@/lib/server/email/businessNotifications'
import { sendSMTPEmail } from '@/lib/server/email/sendSMTPEmail'

const payload = {
  logger: {
    error: vi.fn(),
  },
} as never

describe('business email notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_EMAIL = 'admin@dobmilano.it'
    delete process.env.SHOP_APPOINTMENT_ADMIN_EMAIL
  })

  it('sends customer and admin notifications for consultation leads', async () => {
    await sendConsultationLeadNotifications({
      payload,
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario@example.com',
      phone: '+39000111222',
      concerns: ['idratazione', 'macchie'],
      source: 'frontend-form',
      locale: 'it',
      pagePath: '/it/contact',
    })

    expect(sendSMTPEmail).toHaveBeenCalledTimes(2)
    expect(vi.mocked(sendSMTPEmail).mock.calls[0]?.[0].subject).toContain('Richiesta consulenza ricevuta')
    expect(vi.mocked(sendSMTPEmail).mock.calls[1]?.[0].subject).toContain('[Admin] Nuova richiesta consulenza')
  })

  it('sends an admin new-order notification with contact-later summary', async () => {
    await sendAdminNewOrderNotification({
      payload,
      orderNumber: 'DOB-20260306-00001',
      customerEmail: 'customer@example.com',
      customerFirstName: 'Mario',
      customerLastName: 'Rossi',
      total: 120,
      cartMode: 'services_only',
      productFulfillmentMode: 'pickup',
      appointmentMode: 'contact_later',
    })

    expect(sendSMTPEmail).toHaveBeenCalledTimes(1)
    expect(vi.mocked(sendSMTPEmail).mock.calls[0]?.[0].subject).toContain('[Admin] Nuovo ordine')
    expect(vi.mocked(sendSMTPEmail).mock.calls[0]?.[0].text).toContain('Da concordare con il cliente')
  })

  it('sends customer and admin notifications for requested service dates', async () => {
    await sendServiceDateRequestNotifications({
      payload,
      orderNumber: 'DOB-20260306-00002',
      customerEmail: 'customer@example.com',
      customerName: 'Mario Rossi',
      requestedDate: '2026-03-10T09:00:00.000Z',
      requestedTime: '10:30',
    })

    expect(sendSMTPEmail).toHaveBeenCalledTimes(2)
    expect(vi.mocked(sendSMTPEmail).mock.calls[0]?.[0].subject).toContain('Richiesta data ricevuta')
    expect(vi.mocked(sendSMTPEmail).mock.calls[1]?.[0].subject).toContain('[Admin] Nuova richiesta data')
  })

  it('sends customer and admin notifications when customer confirms an appointment', async () => {
    await sendAppointmentStatusNotifications({
      payload,
      nextStatus: 'confirmed_by_customer',
      customerEmail: 'customer@example.com',
      customerName: 'Mario Rossi',
      orderNumber: 'DOB-20260306-00003',
      proposedDate: '2026-03-12T09:00:00.000Z',
      proposedTime: '11:00',
    })

    expect(sendSMTPEmail).toHaveBeenCalledTimes(2)
    expect(vi.mocked(sendSMTPEmail).mock.calls[0]?.[0].subject).toContain('Conferma cliente ricevuta')
    expect(vi.mocked(sendSMTPEmail).mock.calls[1]?.[0].subject).toContain('[Admin] Conferma cliente ricevuta')
  })
})
