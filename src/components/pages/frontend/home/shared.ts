import { resolveMedia } from '@/components/shared/media'

type MediaReader = {
  findByID: (input: {
    collection: 'media'
    id: string
    depth: 0
    overrideAccess: false
  }) => Promise<unknown>
}

export const resolveMediaValue = async (
  payload: MediaReader,
  value: unknown,
  fallbackAlt = '',
) => {
  const direct = resolveMedia(value, fallbackAlt)
  if (direct) return direct
  if (typeof value === 'string' || typeof value === 'number') {
    const mediaDoc = await payload.findByID({
      collection: 'media',
      id: String(value),
      depth: 0,
      overrideAccess: false,
    })
    return resolveMedia(mediaDoc, fallbackAlt)
  }
  return null
}

export const resolveProgramId = (value: unknown) => {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const idValue = (value as { id?: string | number }).id
    return idValue ? String(idValue) : null
  }
  return null
}

export const formatPrice = (locale: string, value?: number | null, currency?: string | null) => {
  if (typeof value !== 'number') return ''
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(value)
}

export const formatDuration = (minutes?: number | null) => {
  if (typeof minutes !== 'number' || Number.isNaN(minutes) || minutes <= 0) return undefined
  return `${minutes} min`
}

export const formatProgramPrice = (locale: string, value?: number | null, currency?: string | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(value)
}

export const formatServiceTag = (value?: string | null) => {
  if (value === 'package') return 'Pacchetto'
  if (value === 'single') return 'Singolo'
  return null
}
