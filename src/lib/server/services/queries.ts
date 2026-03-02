import type { Payload, Where } from 'payload'

import type { Locale } from '@/lib/i18n/core'
import { getPayloadClient } from '@/lib/server/payload/getPayloadClient'
import type { Service } from '@/payload/generated/payload-types'

type ServicesQueryOptions = {
  payload?: Payload
  locale: Locale
  depth?: number
  limit?: number
  sort?: string
  where?: Where
  select?: Record<string, unknown>
}

export const getServiceBySlug = async ({
  payload,
  locale,
  slug,
  depth = 1,
}: {
  payload?: Payload
  locale: Locale
  slug: string
  depth?: number
}) => {
  const payloadClient = payload ?? (await getPayloadClient())
  const result = await payloadClient.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    depth,
    limit: 1,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs[0] || null
}

export const getServices = async ({
  payload,
  locale,
  depth = 1,
  limit = 200,
  sort,
  where,
  select,
}: ServicesQueryOptions) => {
  const payloadClient = payload ?? (await getPayloadClient())
  return payloadClient.find({
    collection: 'services',
    locale,
    overrideAccess: false,
    depth,
    limit,
    ...(sort ? { sort } : {}),
    ...(where ? { where } : {}),
    ...(select ? { select } : {}),
  })
}

export const getActiveServicesByTreatmentId = async ({
  payload,
  locale,
  treatmentId,
  depth = 1,
  limit = 200,
  sort = 'price',
}: {
  payload?: Payload
  locale: Locale
  treatmentId: number | string
  depth?: number
  limit?: number
  sort?: string
}) =>
  getServices({
    payload,
    locale,
    depth,
    limit,
    sort,
    where: {
      and: [
        { treatments: { in: [treatmentId] } },
        { active: { equals: true } },
      ],
    },
  })

export const mapServicesById = (services: Service[]) =>
  new Map(services.map((service) => [String(service.id), service]))
