import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'

type TestUser = {
  id: number
  email: string
}

const runId = Date.now()
const emailA = `qa.account.a.${runId}@example.com`
const emailB = `qa.account.b.${runId}@example.com`

let payload: Payload
let userA: TestUser
let userB: TestUser
let orderAId: number

describe('Account access control', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    const createdA = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email: emailA,
        password: 'DobMilano!A123',
        roles: ['customer'],
        firstName: 'User',
        lastName: 'A',
        _verified: true,
      },
    })
    userA = { id: createdA.id, email: createdA.email }

    const createdB = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email: emailB,
        password: 'DobMilano!B123',
        roles: ['customer'],
        firstName: 'User',
        lastName: 'B',
        _verified: true,
      },
    })
    userB = { id: createdB.id, email: createdB.email }

    const createdOrder = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        orderNumber: `TEST-ACCOUNT-${runId}`,
        status: 'paid',
        paymentStatus: 'paid',
        paymentProvider: 'manual',
        paymentReference: `test-ref-${runId}`,
        currency: 'EUR',
        locale: 'it',
        subtotal: 10,
        shippingAmount: 0,
        discountAmount: 0,
        total: 10,
        customerEmail: userA.email,
        customer: userA.id,
        customerFirstName: 'User',
        customerLastName: 'A',
        shippingAddress: {
          address: 'Via Test 1',
          postalCode: '20100',
          city: 'Milano',
          province: 'MI',
          country: 'Italy',
        },
      },
    })
    orderAId = createdOrder.id
  })

  afterAll(async () => {
    if (!payload) return

    await payload.delete({
      collection: 'orders',
      overrideAccess: true,
      where: {
        or: [
          { id: { equals: orderAId } },
          { orderNumber: { contains: `TEST-ACCOUNT-${runId}` } },
        ],
      },
    })

    await payload.delete({
      collection: 'users',
      overrideAccess: true,
      where: {
        email: { in: [emailA, emailB] },
      },
    })
  })

  it('user can read only self profile', async () => {
    const self = await payload.findByID({
      collection: 'users',
      id: userA.id,
      overrideAccess: false,
      user: { id: userA.id, email: userA.email, roles: ['customer'] },
    })

    expect(self.id).toBe(userA.id)
    expect(self.email).toBe(userA.email)

    await expect(
      payload.findByID({
        collection: 'users',
        id: userA.id,
        overrideAccess: false,
        user: { id: userB.id, email: userB.email, roles: ['customer'] },
      }),
    ).rejects.toThrow()
  })

  it('user can update own profile but not another user profile', async () => {
    const updatedSelf = await payload.update({
      collection: 'users',
      id: userA.id,
      overrideAccess: false,
      user: { id: userA.id, email: userA.email, roles: ['customer'] },
      data: {
        firstName: 'Updated',
        lastName: 'Self',
        phone: '3880000000',
      },
    })

    expect(updatedSelf.firstName).toBe('Updated')
    expect(updatedSelf.lastName).toBe('Self')
    expect(updatedSelf.phone).toBe('3880000000')

    await expect(
      payload.update({
        collection: 'users',
        id: userA.id,
        overrideAccess: false,
        user: { id: userB.id, email: userB.email, roles: ['customer'] },
        data: {
          firstName: 'Hacked',
        },
      }),
    ).rejects.toThrow()
  })

  it('user cannot read orders of another user', async () => {
    const ownOrders = await payload.find({
      collection: 'orders',
      overrideAccess: false,
      user: { id: userA.id, email: userA.email, roles: ['customer'] },
      where: {
        id: { equals: orderAId },
      },
    })

    expect(ownOrders.docs).toHaveLength(1)

    const foreignOrders = await payload.find({
      collection: 'orders',
      overrideAccess: false,
      user: { id: userB.id, email: userB.email, roles: ['customer'] },
      where: {
        id: { equals: orderAId },
      },
    })

    expect(foreignOrders.docs).toHaveLength(0)
  })
})
