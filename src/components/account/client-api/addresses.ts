import type { PhotonAddressSuggestion } from '../forms/types'
import type { AddressItem } from '../types'

type NominatimResult = Array<{
  display_name?: string
  address?: {
    road?: string
    pedestrian?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state_district?: string
    state?: string
    postcode?: string
    country?: string
  }
}>

const normalizeProvince = (raw?: string) => {
  const value = (raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
  if (!value) return undefined
  if (value.includes('monza') || value.includes('brianza')) {
    return 'Monza and Brianza'
  }
  if (value.includes('milano')) {
    return 'Milano'
  }
  return undefined
}

const parseNominatim = (data: NominatimResult): PhotonAddressSuggestion[] => {
  const suggestionsRaw: PhotonAddressSuggestion[] = []
  for (const item of data) {
    const a = item.address ?? {}
    const road = a.road || a.pedestrian || ''
    const city = a.city || a.town || a.village || a.county || ''
    const streetAddress = [road, a.house_number].filter(Boolean).join(' ').trim() || undefined
    const province =
      normalizeProvince(a.county) ||
      normalizeProvince(a.state_district) ||
      normalizeProvince(a.state)
    const postalCode = a.postcode?.trim() || undefined
    const country = a.country?.trim() || undefined
    const label =
      [streetAddress, city || undefined, province, postalCode, country].filter(Boolean).join(', ') ||
      item.display_name ||
      ''
    if (!label) continue
    suggestionsRaw.push({
      label,
      streetAddress,
      city: city || undefined,
      province,
      postalCode,
      country,
    })
  }
  return suggestionsRaw
}

export async function searchAddressSuggestions(query: string, signal: AbortSignal) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=it&q=${encodeURIComponent(query)}`,
    { signal },
  )
  if (!response.ok) return []

  const nominatimData = (await response.json()) as NominatimResult
  const suggestionsRaw = parseNominatim(nominatimData)
  return suggestionsRaw.filter(
    (value, index, arr) =>
      arr.findIndex((item) => item.label.toLowerCase() === value.label.toLowerCase()) === index,
  )
}

export async function persistUserAddresses(userId: number, nextAddresses: AddressItem[]) {
  const payloadAddresses = nextAddresses.map((address, index) => ({
    firstName: (address.firstName ?? '').trim(),
    lastName: (address.lastName ?? '').trim(),
    company: (address.company ?? '').trim(),
    streetAddress: (address.streetAddress ?? address.address.split(',')[0] ?? '').trim(),
    apartment: (
      address.apartment ??
      (address.address.includes(',') ? address.address.split(',').slice(1).join(',') : '')
    ).trim(),
    city: address.city.trim(),
    country: address.country.trim(),
    province: address.province.trim(),
    postalCode: address.postalCode.trim(),
    phone: (address.phone ?? '').trim(),
    isDefault: index === 0,
  }))

  const response = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ addresses: payloadAddresses }),
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string }
    throw new Error(data.message || 'Impossibile salvare gli indirizzi.')
  }
}

