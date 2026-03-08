import type { Payload } from 'payload'

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export const normalizePromoCodeInput = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : ''

type PromoCodeDocument = {
  id: number
  code?: string | null
  active?: boolean | null
  discountType?: 'percent' | 'amount' | null
  discountValue?: number | null
  commissionType?: 'percent' | 'amount' | null
  commissionValue?: number | null
  appliesToProducts?: boolean | null
  appliesToServices?: boolean | null
  startsAt?: string | null
  endsAt?: string | null
  usageLimit?: number | null
  partner?:
    | number
    | {
        id?: number | null
        firstName?: string | null
        lastName?: string | null
        email?: string | null
      }
    | null
}

export type ResolvedPromoCode = {
  doc: PromoCodeDocument
  promoCodeID: number
  promoCodeValue: string
  partnerID: number
  partnerName: string
  appliesToProducts: boolean
  appliesToServices: boolean
  discountType: 'percent' | 'amount'
  discountValue: number
  commissionType: 'percent' | 'amount'
  commissionValue: number
}

export const calculateDiscountAmount = ({
  amountType,
  amountValue,
  eligibleSubtotal,
}: {
  amountType: 'percent' | 'amount'
  amountValue: number
  eligibleSubtotal: number
}) => {
  if (eligibleSubtotal <= 0 || amountValue <= 0) return 0

  if (amountType === 'percent') {
    return roundCurrency(Math.min(eligibleSubtotal, (eligibleSubtotal * amountValue) / 100))
  }

  return roundCurrency(Math.min(eligibleSubtotal, amountValue))
}

export const calculateCommissionAmount = ({
  commissionType,
  commissionValue,
  eligibleNetAfterDiscount,
}: {
  commissionType: 'percent' | 'amount'
  commissionValue: number
  eligibleNetAfterDiscount: number
}) => {
  if (eligibleNetAfterDiscount <= 0 || commissionValue <= 0) return 0

  if (commissionType === 'percent') {
    return roundCurrency(Math.min(eligibleNetAfterDiscount, (eligibleNetAfterDiscount * commissionValue) / 100))
  }

  return roundCurrency(Math.min(eligibleNetAfterDiscount, commissionValue))
}

const buildPartnerName = (partner: PromoCodeDocument['partner']) => {
  if (!partner || typeof partner === 'number') return ''
  const fullName = [partner.firstName, partner.lastName]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .trim()
  return fullName || (typeof partner.email === 'string' ? partner.email.trim() : '')
}

export const resolvePromoCode = async ({
  payload,
  discountCode,
  hasProducts,
  hasServices,
}: {
  payload: Payload
  discountCode: string
  hasProducts: boolean
  hasServices: boolean
}): Promise<ResolvedPromoCode | null> => {
  const normalizedCode = normalizePromoCodeInput(discountCode)
  if (!normalizedCode) return null

  const result = await payload.find({
    collection: 'promo-codes',
    overrideAccess: true,
    depth: 1,
    limit: 1,
    where: {
      code: {
        equals: normalizedCode,
      },
    },
  })

  const doc = result.docs[0] as PromoCodeDocument | undefined
  if (!doc) return null
  if (doc.active === false) {
    throw new Error('Il codice sconto non è attivo.')
  }

  const now = Date.now()
  if (typeof doc.startsAt === 'string' && doc.startsAt && new Date(doc.startsAt).getTime() > now) {
    throw new Error('Il codice sconto non è ancora valido.')
  }
  if (typeof doc.endsAt === 'string' && doc.endsAt && new Date(doc.endsAt).getTime() < now) {
    throw new Error('Il codice sconto è scaduto.')
  }

  const appliesToProducts = doc.appliesToProducts !== false
  const appliesToServices = doc.appliesToServices !== false
  if (!appliesToProducts && !appliesToServices) {
    throw new Error('Il codice sconto non ha uno scope valido.')
  }
  if ((hasProducts && appliesToProducts === false) && (hasServices && appliesToServices === false)) {
    throw new Error('Il codice sconto non è applicabile a questo carrello.')
  }
  if (hasProducts && !hasServices && appliesToProducts === false) {
    throw new Error('Il codice sconto non è valido per i prodotti.')
  }
  if (hasServices && !hasProducts && appliesToServices === false) {
    throw new Error('Il codice sconto non è valido per i servizi.')
  }

  const discountType = doc.discountType === 'amount' ? 'amount' : 'percent'
  const commissionType = doc.commissionType === 'amount' ? 'amount' : 'percent'
  const discountValue =
    typeof doc.discountValue === 'number' && Number.isFinite(doc.discountValue) ? doc.discountValue : 0
  const commissionValue =
    typeof doc.commissionValue === 'number' && Number.isFinite(doc.commissionValue) ? doc.commissionValue : 0

  if (discountValue <= 0) {
    throw new Error('Il codice sconto non ha un valore valido.')
  }
  if (commissionValue < 0) {
    throw new Error('Il codice sconto ha una commissione non valida.')
  }

  const partnerRaw = doc.partner
  const partnerID =
    typeof partnerRaw === 'number'
      ? partnerRaw
      : partnerRaw && typeof partnerRaw.id === 'number'
        ? partnerRaw.id
        : null

  if (!partnerID) {
    throw new Error('Il codice sconto non ha un partner valido associato.')
  }

  const usageLimit =
    typeof doc.usageLimit === 'number' && Number.isFinite(doc.usageLimit) && doc.usageLimit > 0
      ? Math.floor(doc.usageLimit)
      : null

  if (usageLimit) {
    const usageCount = await payload.find({
      collection: 'orders',
      overrideAccess: true,
      depth: 0,
      limit: 0,
      where: {
        and: [
          {
            promoCode: {
              equals: doc.id,
            },
          },
          {
            status: {
              not_in: ['failed', 'cancelled'],
            },
          },
        ],
      },
    })

    if (usageCount.totalDocs >= usageLimit) {
      throw new Error('Il codice sconto ha raggiunto il limite massimo di utilizzi.')
    }
  }

  return {
    doc,
    promoCodeID: doc.id,
    promoCodeValue: normalizedCode,
    partnerID,
    partnerName: buildPartnerName(partnerRaw),
    appliesToProducts,
    appliesToServices,
    discountType,
    discountValue,
    commissionType,
    commissionValue,
  }
}

export const distributeDiscountAcrossUnitAmounts = ({
  unitAmounts,
  discountAmount,
}: {
  unitAmounts: number[]
  discountAmount: number
}) => {
  const sourceCents = unitAmounts.map((value) => Math.max(0, Math.round(value * 100)))
  const totalCents = sourceCents.reduce((sum, value) => sum + value, 0)
  const discountCents = Math.max(0, Math.min(totalCents, Math.round(discountAmount * 100)))

  if (totalCents === 0 || discountCents === 0) {
    return sourceCents.map((value) => value / 100)
  }

  const rawShares = sourceCents.map((value, index) => ({
    index,
    exact: (value / totalCents) * discountCents,
  }))
  const floored = rawShares.map((entry) => Math.floor(entry.exact))
  let remainder = discountCents - floored.reduce((sum, value) => sum + value, 0)

  rawShares
    .map((entry, index) => ({
      index,
      remainder: entry.exact - floored[index],
    }))
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((entry) => {
      if (remainder <= 0) return
      floored[entry.index] += 1
      remainder -= 1
    })

  return sourceCents.map((value, index) => Math.max(0, value - floored[index]) / 100)
}
