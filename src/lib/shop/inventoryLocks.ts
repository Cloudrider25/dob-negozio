import { randomUUID } from 'node:crypto'

import type { Payload } from 'payload'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type AcquiredLock = {
  id: number | string
  productID: number
  token: string
}

const clearExpiredLock = async (payload: Payload, productID: number) => {
  const existing = await payload.find({
    collection: 'shop-inventory-locks',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: {
      product: { equals: productID },
    },
    select: {
      id: true,
      expiresAt: true,
    },
  })

  const lock = existing.docs[0]
  if (!lock) return

  const expiresAt = typeof lock.expiresAt === 'string' ? new Date(lock.expiresAt) : null
  if (!expiresAt || Number.isNaN(expiresAt.getTime())) return
  if (expiresAt.getTime() > Date.now()) return

  try {
    await payload.delete({
      collection: 'shop-inventory-locks',
      id: lock.id,
      overrideAccess: true,
    })
  } catch {
    // No-op: lock might already be removed by another worker
  }
}

const acquireSingleLock = async ({
  payload,
  productID,
  retries = 30,
  delayMs = 75,
  ttlMs = 30_000,
}: {
  payload: Payload
  productID: number
  retries?: number
  delayMs?: number
  ttlMs?: number
}): Promise<AcquiredLock> => {
  const token = randomUUID()

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const lock = await payload.create({
        collection: 'shop-inventory-locks',
        overrideAccess: true,
        draft: false,
        data: {
          product: productID,
          lockToken: token,
          expiresAt: new Date(Date.now() + ttlMs).toISOString(),
        },
      })

      return {
        id: lock.id,
        productID,
        token,
      }
    } catch {
      await clearExpiredLock(payload, productID)
      await sleep(delayMs)
    }
  }

  throw new Error(`Unable to acquire inventory lock for product ${productID}.`)
}

export const acquireInventoryLocks = async ({
  payload,
  productIDs,
}: {
  payload: Payload
  productIDs: string[]
}): Promise<AcquiredLock[]> => {
  const uniqueSortedIDs = Array.from(
    new Set(
      productIDs
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id)),
    ),
  ).sort((a, b) => a - b)
  const acquired: AcquiredLock[] = []
  try {
    for (const productID of uniqueSortedIDs) {
      acquired.push(
        await acquireSingleLock({
          payload,
          productID,
        }),
      )
    }
    return acquired
  } catch (error) {
    await releaseInventoryLocks({
      payload,
      locks: acquired,
    })
    throw error
  }
}

export const releaseInventoryLocks = async ({
  payload,
  locks,
}: {
  payload: Payload
  locks: AcquiredLock[]
}) => {
  for (const lock of locks) {
    try {
      await payload.delete({
        collection: 'shop-inventory-locks',
        id: lock.id,
        overrideAccess: true,
      })
    } catch {
      // No-op: best effort cleanup
    }
  }
}
