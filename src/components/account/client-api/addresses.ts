import type { PhotonAddressSuggestion } from '../forms/types'
import type { AddressItem } from '../types'
import { ApiClientError, parseApiError } from './parseApiError'

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

type UserAddressEntry = {
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  streetAddress?: string | null
  apartment?: string | null
  city?: string | null
  country?: string | null
  province?: string | null
  postalCode?: string | null
  phone?: string | null
  isDefault?: boolean | null
}

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

const mapUserAddressEntry = (entry: UserAddressEntry, index: number): AddressItem | null => {
  const streetAddress = entry.streetAddress?.trim() || ''
  const apartment = entry.apartment?.trim() || ''
  const city = entry.city?.trim() || ''
  const province = entry.province?.trim() || ''
  const postalCode = entry.postalCode?.trim() || ''
  const country = entry.country?.trim() || ''

  if (!streetAddress || !city || !province || !postalCode || !country) return null

  const firstName = entry.firstName?.trim() || ''
  const lastName = entry.lastName?.trim() || ''
  const company = entry.company?.trim() || ''
  const address = [streetAddress, apartment].filter(Boolean).join(', ')
  const id = `${address}|${postalCode}|${city}|${province}|${country}|${index}`

  return {
    id,
    fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
    address,
    postalCode,
    city,
    province,
    country,
    firstName,
    lastName,
    company,
    streetAddress,
    apartment,
    phone: entry.phone?.trim() || '',
    isDefault: Boolean(entry.isDefault),
  }
}

const normalizeAddressesOrder = (rows: AddressItem[]) => {
  const defaultRows = rows.filter((row) => row.isDefault)
  const otherRows = rows.filter((row) => !row.isDefault)
  return [...defaultRows, ...otherRows].map((row, index) => ({ ...row, isDefault: index === 0 }))
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

export async function fetchUserAddresses(userId: number) {
  const response = await fetch(`/api/users/${userId}?depth=0`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const message = await parseApiError(response, 'Impossibile caricare gli indirizzi.')
    throw new ApiClientError(message, response.status)
  }

  const data = (await response.json().catch(() => ({}))) as { addresses?: UserAddressEntry[] }
  const rows = (data.addresses || [])
    .map((entry, index) => mapUserAddressEntry(entry, index))
    .filter((entry): entry is AddressItem => Boolean(entry))

  return normalizeAddressesOrder(rows)
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
    const message = await parseApiError(response, 'Impossibile salvare gli indirizzi.')
    throw new ApiClientError(message, response.status)
  }
}
