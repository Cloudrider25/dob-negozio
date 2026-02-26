import type { PayloadRequest } from 'payload'
import type { Locale } from '@/lib/i18n'

type UserLike = {
  id: number | string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  roles?: unknown
  addresses?: unknown
}

type EnsureOptions = {
  req?: PayloadRequest
  locale?: Locale
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const hasCustomerRole = (roles: unknown) =>
  Array.isArray(roles) && roles.some((role) => typeof role === 'string' && role === 'customer')

export async function ensureAnagraficaForCustomer(
  payload: PayloadRequest['payload'],
  user: UserLike | null | undefined,
  options: EnsureOptions = {},
) {
  if (!user || !user.id) return null
  if (!hasCustomerRole(user.roles)) return null

  const customerId = typeof user.id === 'number' ? user.id : Number(user.id)
  if (!Number.isFinite(customerId)) return null

  const req = options.req
  const locale = options.locale

  const existing = await payload.find({
    collection: 'anagrafiche',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    ...(locale ? { locale } : {}),
    ...(req ? { req } : {}),
    where: {
      customer: {
        equals: customerId,
      },
    },
  })

  const firstName = asString(user.firstName)
  const lastName = asString(user.lastName)
  const email = asString(user.email)
  const phone = asString(user.phone)

  const normalizedAddresses = Array.isArray(user.addresses)
    ? user.addresses.map((raw, index) => {
        const a = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
        return {
          firstName: asString(a.firstName),
          lastName: asString(a.lastName),
          company: asString(a.company),
          streetAddress: asString(a.streetAddress),
          apartment: asString(a.apartment),
          city: asString(a.city),
          province: asString(a.province),
          postalCode: asString(a.postalCode),
          country: asString(a.country) || 'Italy',
          phone: asString(a.phone),
          isDefault:
            typeof a.isDefault === 'boolean'
              ? a.isDefault
              : index === 0,
        }
      })
    : []

  const data = {
    customer: customerId,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    email: email || undefined,
    phone: phone || undefined,
    addresses: normalizedAddresses,
  }

  if (existing.docs.length > 0) {
    const doc = existing.docs[0]
    return payload.update({
      collection: 'anagrafiche',
      id: doc.id as number,
      overrideAccess: true,
      ...(locale ? { locale } : {}),
      ...(req ? { req } : {}),
      context: { skipUserWriteThrough: true },
      data,
    })
  }

  return payload.create({
    collection: 'anagrafiche',
    overrideAccess: true,
    draft: false,
    ...(locale ? { locale } : {}),
    ...(req ? { req } : {}),
    context: { skipUserWriteThrough: true },
    data,
  })
}
