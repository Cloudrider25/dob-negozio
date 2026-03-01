import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config'

const runId = Date.now()
const userEmail = `qa.account.management.${runId}@example.com`
const userPassword = 'DobMilano!Mgmt123'
const oneYearSeconds = 60 * 60 * 24 * 365

let payload: Payload
let userId: number | null = null
let orderId: number | null = null
let orderServiceItemId: number | null = null
let orderServiceSessionId: number | null = null
let serviceTitleForUI = 'Servizio test'

const buildPreferenceCookies = () => [
  {
    name: 'dob_prefs_confirmed',
    value: '1',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
  {
    name: 'dob_prefs_locale',
    value: 'it',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
  {
    name: 'dob_prefs_country',
    value: 'ITA',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
  {
    name: 'dob_prefs_currency',
    value: 'EUR',
    url: 'http://localhost:3000',
    sameSite: 'Lax' as const,
    expires: Math.floor(Date.now() / 1000) + oneYearSeconds,
  },
]

test.describe('Account management smoke', () => {
  test.beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    const createdUser = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email: userEmail,
        password: userPassword,
        roles: ['customer'],
        firstName: 'QA',
        lastName: 'Management',
        _verified: true,
      },
    })
    userId = createdUser.id

    const createdOrder = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        orderNumber: `TEST-A6-${runId}`,
        status: 'paid',
        paymentStatus: 'paid',
        paymentProvider: 'manual',
        paymentReference: `test-a6-${runId}`,
        currency: 'EUR',
        locale: 'it',
        subtotal: 80,
        shippingAmount: 0,
        discountAmount: 0,
        total: 80,
        customerEmail: userEmail,
        customer: createdUser.id,
        customerFirstName: 'QA',
        customerLastName: 'Management',
        shippingAddress: {
          address: 'Via QA 6',
          postalCode: '20100',
          city: 'Milano',
          province: 'MI',
          country: 'Italy',
        },
      },
    })
    orderId = createdOrder.id

    const serviceResult = await payload.find({
      collection: 'services',
      overrideAccess: true,
      depth: 0,
      limit: 1,
      where: {
        active: { equals: true },
      },
    })
    const service = serviceResult.docs[0]
    if (!service) return

    serviceTitleForUI = service.name || 'Servizio test'

    const createdOrderServiceItem = await payload.create({
      collection: 'order-service-items',
      overrideAccess: true,
      data: {
        order: createdOrder.id,
        service: service.id,
        itemKind: 'service',
        appointmentMode: 'contact_later',
        appointmentStatus: 'none',
        serviceTitle: serviceTitleForUI,
        serviceSlug: service.slug || undefined,
        durationMinutes: typeof service.durationMinutes === 'number' ? service.durationMinutes : 60,
        sessions: 1,
        currency: 'EUR',
        unitPrice: typeof service.price === 'number' ? service.price : 80,
        quantity: 1,
        lineTotal: typeof service.price === 'number' ? service.price : 80,
      },
    })
    orderServiceItemId = createdOrderServiceItem.id

    const createdSession = await payload.create({
      collection: 'order-service-sessions',
      overrideAccess: true,
      data: {
        order: createdOrder.id,
        orderServiceItem: createdOrderServiceItem.id,
        service: service.id,
        itemKind: 'service',
        variantKey: 'default',
        variantLabel: 'Default',
        sessionIndex: 1,
        sessionLabel: 'Seduta 1/1',
        sessionsTotal: 1,
        appointmentMode: 'contact_later',
        appointmentStatus: 'none',
        serviceTitle: serviceTitleForUI,
        serviceSlug: service.slug || undefined,
        durationMinutes: typeof service.durationMinutes === 'number' ? service.durationMinutes : 60,
        currency: 'EUR',
        sessionPrice: typeof service.price === 'number' ? service.price : 80,
      },
    })
    orderServiceSessionId = createdSession.id
  })

  test.afterAll(async () => {
    const deletions: Promise<unknown>[] = []

    if (orderServiceSessionId) {
      deletions.push(
        payload.delete({
          collection: 'order-service-sessions',
          id: orderServiceSessionId,
          overrideAccess: true,
        }),
      )
    }

    if (orderServiceItemId) {
      deletions.push(
        payload.delete({
          collection: 'order-service-items',
          id: orderServiceItemId,
          overrideAccess: true,
        }),
      )
    }

    if (orderId) {
      deletions.push(
        payload.delete({
          collection: 'orders',
          id: orderId,
          overrideAccess: true,
        }),
      )
    }

    await Promise.allSettled(deletions)

    if (userId) {
      await payload.delete({
        collection: 'users',
        id: userId,
        overrideAccess: true,
      }).catch(() => undefined)
    }
  })

  test('@smoke login + profile + addresses + service-date', async ({ page }) => {
    test.skip(!userId, 'Fixture user not available')

    await page.goto('http://localhost:3000/it/signin', { waitUntil: 'networkidle' })

    const loginResponse = await page.request.post('http://localhost:3000/api/users/login', {
      data: {
        email: userEmail,
        password: userPassword,
      },
    })
    expect(loginResponse.ok()).toBeTruthy()

    await page.context().addCookies(buildPreferenceCookies())
    await page.goto('http://localhost:3000/it/account', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/it\/account/)

    await page.getByLabel('Telefono').fill('3331234567')
    await page.getByRole('button', { name: /Salva profilo/i }).click()
    await expect(page.getByText('Profilo aggiornato con successo.')).toBeVisible()

    await page.getByRole('button', { name: /^Indirizzi$/i }).click()
    await page.getByRole('button', { name: /Aggiungi nuovo indirizzo/i }).click()

    const addressForm = page.locator('form').filter({ hasText: /Aggiungi un nuovo indirizzo|Modifica indirizzo/i }).first()
    await addressForm.getByPlaceholder('Nome', { exact: true }).fill('Mario')
    await addressForm.getByPlaceholder('Cognome', { exact: true }).fill('Rossi')
    await addressForm.getByPlaceholder('Indirizzo', { exact: true }).fill('Via Milano 1')
    await addressForm.getByPlaceholder('Citta', { exact: true }).fill('Milano')
    await addressForm.getByPlaceholder('CAP', { exact: true }).fill('20100')
    await addressForm.getByPlaceholder('Telefono', { exact: true }).fill('021234567')
    await addressForm.locator('select').nth(1).selectOption({ label: 'Milano' })
    await addressForm.getByRole('button', { name: /Salva indirizzo/i }).click()

    await expect(page.getByRole('button', { name: /Vedi\/Modifica rubrica indirizzi/i })).toBeVisible()
    await page.getByRole('button', { name: /Vedi\/Modifica rubrica indirizzi/i }).click()
    await page.getByRole('button', { name: /^Elimina$/i }).first().click()
    await expect(page.getByText('Nessun indirizzo salvato')).toBeVisible()

    await page.getByRole('button', { name: /^Servizi$/i }).click()
    await page.getByRole('button', { name: /Tutti i servizi prenotati|Nascondi servizi prenotati/i }).click()

    if (orderServiceSessionId) {
      await page.locator('[role="button"]').filter({ hasText: serviceTitleForUI }).first().click()
      await expect(page.getByRole('heading', { name: /Dettagli appuntamento/i })).toBeVisible()
      await page.locator('input[type="date"]').first().fill('2026-03-20')
      await page.locator('input[type="time"]').first().fill('10:30')
      await page.getByRole('button', { name: /Salva data/i }).click()
      await expect(page.getByText('Data aggiornata.')).toBeVisible()
    }
  })
})
