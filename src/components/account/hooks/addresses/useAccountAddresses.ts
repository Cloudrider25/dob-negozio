'use client'

import { useEffect, useState } from 'react'

import { persistUserAddresses, searchAddressSuggestions } from '../../client-api/addresses'
import type { AddressDraft, FormMessage, PhotonAddressSuggestion } from '../../forms/types'
import type { AddressItem, AddressesView } from '../../types'

const DEFAULT_ADDRESS_DRAFT: AddressDraft = {
  firstName: '',
  lastName: '',
  company: '',
  streetAddress: '',
  apartment: '',
  city: '',
  country: 'Italy',
  province: '',
  postalCode: '',
  phone: '',
  isDefault: true,
}

type UseAccountAddressesArgs = {
  initialAddresses: AddressItem[]
  userId: number
}

export function useAccountAddresses({ initialAddresses, userId }: UseAccountAddressesArgs) {
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressesView, setAddressesView] = useState<AddressesView>('default')
  const [addressMessage, setAddressMessage] = useState<FormMessage | null>(null)
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(DEFAULT_ADDRESS_DRAFT)
  const [addressLookupQuery, setAddressLookupQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<PhotonAddressSuggestion[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)

  const defaultAddress = addresses[0] ?? null

  useEffect(() => {
    const query = addressLookupQuery.trim()
    if (query.length < 2) {
      setCitySuggestions([])
      setCityLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        setCityLoading(true)
        const suggestions = await searchAddressSuggestions(query, controller.signal)
        setCitySuggestions(suggestions)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setCitySuggestions([])
        }
      } finally {
        setCityLoading(false)
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [addressLookupQuery])

  const applyCitySuggestion = (suggestion: PhotonAddressSuggestion) => {
    setAddressDraft((prev) => {
      const nextProvince =
        suggestion.province && ['Milano', 'Monza and Brianza'].includes(suggestion.province)
          ? suggestion.province
          : prev.province

      return {
        ...prev,
        streetAddress: suggestion.streetAddress || prev.streetAddress,
        city: suggestion.city || prev.city,
        postalCode: suggestion.postalCode || prev.postalCode,
        province: nextProvince,
        country:
          suggestion.country?.toLowerCase() === 'italy' ||
          suggestion.country?.toLowerCase() === 'italia'
            ? 'Italy'
            : prev.country,
      }
    })
    setAddressLookupQuery(suggestion.label)
    setShowCitySuggestions(false)
  }

  const formatAddressLines = (address: AddressItem) =>
    [
      address.fullName?.trim() || '',
      address.address,
      `${address.postalCode} ${address.city} ${address.province}`.trim(),
      address.country,
    ].filter((line) => line.trim().length > 0)

  const onDeleteAddressById = (id: string) => {
    const next = addresses.filter((address) => address.id !== id)
    setAddresses(next)
    setAddressMessage(null)
    if (editingAddressId === id) setEditingAddressId(null)
    void persistUserAddresses(userId, next).catch((error) =>
      setAddressMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.',
      }),
    )
  }

  const onSetDefaultAddress = (id: string) => {
    const next = (() => {
      const prev = addresses
      const index = prev.findIndex((address) => address.id === id)
      if (index <= 0) return prev
      const output = [...prev]
      const [selected] = output.splice(index, 1)
      output.unshift(selected)
      return output
    })()
    setAddresses(next)
    void persistUserAddresses(userId, next).catch((error) =>
      setAddressMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.',
      }),
    )
  }

  const onEditAddress = (address?: AddressItem | null) => {
    setAddressMessage(null)
    setAddressLookupQuery('')
    if (address) {
      setEditingAddressId(address.id)
      setAddressDraft((prev) => ({
        ...prev,
        firstName:
          address.firstName ??
          (address.fullName.split(' ').slice(0, -1).join(' ') || prev.firstName),
        lastName:
          address.lastName ?? (address.fullName.split(' ').slice(-1).join(' ') || prev.lastName),
        company: address.company ?? '',
        streetAddress:
          address.streetAddress ?? (address.address.split(',')[0]?.trim() || address.address),
        apartment:
          address.apartment ??
          (address.address.includes(',')
            ? address.address.split(',').slice(1).join(',').trim()
            : ''),
        city: address.city,
        country: address.country === 'Italia' ? 'Italy' : address.country,
        province: address.province,
        postalCode: address.postalCode,
        phone: address.phone ?? '',
        isDefault: Boolean(address.isDefault ?? false),
      }))
    } else {
      setEditingAddressId(null)
    }
    setShowAddressForm(true)
  }

  const onSaveAddress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAddressMessage(null)
    const required = [
      addressDraft.firstName,
      addressDraft.lastName,
      addressDraft.streetAddress,
      addressDraft.city,
      addressDraft.country,
      addressDraft.province,
      addressDraft.postalCode,
    ]
    if (required.some((value) => value.trim().length === 0)) {
      setAddressMessage({
        type: 'error',
        text: 'Compila tutti i campi obbligatori (Nome, Cognome, Indirizzo, Città, Provincia, CAP).',
      })
      return
    }

    const nextAddress: AddressItem = {
      id: editingAddressId || `${Date.now()}`,
      fullName: `${addressDraft.firstName} ${addressDraft.lastName}`.trim(),
      address: [addressDraft.streetAddress, addressDraft.apartment].filter(Boolean).join(', '),
      postalCode: addressDraft.postalCode,
      city: addressDraft.city,
      province: addressDraft.province,
      country: addressDraft.country,
      firstName: addressDraft.firstName,
      lastName: addressDraft.lastName,
      company: addressDraft.company,
      streetAddress: addressDraft.streetAddress,
      apartment: addressDraft.apartment,
      phone: addressDraft.phone,
      isDefault: addressDraft.isDefault,
    }

    const nextAddressesBase = editingAddressId
      ? addresses.map((address) => (address.id === editingAddressId ? nextAddress : address))
      : [...addresses, nextAddress]

    let nextAddresses = nextAddressesBase
    if (addressDraft.isDefault) {
      nextAddresses = [
        ...nextAddressesBase.filter((address) => address.id === nextAddress.id),
        ...nextAddressesBase.filter((address) => address.id !== nextAddress.id),
      ]
    } else if (
      !nextAddressesBase.some((address) => address.id !== nextAddress.id) &&
      nextAddressesBase.length === 1
    ) {
      nextAddresses = [{ ...nextAddress, isDefault: true }]
    }

    setAddresses(nextAddresses)

    void persistUserAddresses(userId, nextAddresses)
      .then(() => {
        setShowAddressForm(false)
        setAddressLookupQuery('')
        setEditingAddressId(null)
        setAddressMessage({ type: 'success', text: 'Indirizzo salvato.' })
        setAddressDraft(DEFAULT_ADDRESS_DRAFT)
      })
      .catch((error) => {
        setAddressMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Errore salvataggio indirizzi.',
        })
      })
  }

  return {
    addresses,
    setAddresses,
    defaultAddress,
    showAddressForm,
    setShowAddressForm,
    editingAddressId,
    setEditingAddressId,
    addressesView,
    setAddressesView,
    addressMessage,
    setAddressMessage,
    addressDraft,
    setAddressDraft,
    addressLookupQuery,
    setAddressLookupQuery,
    citySuggestions,
    showCitySuggestions,
    setShowCitySuggestions,
    cityLoading,
    applyCitySuggestion,
    formatAddressLines,
    onDeleteAddressById,
    onSetDefaultAddress,
    onEditAddress,
    onSaveAddress,
  }
}
