'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'

import {
  fetchUserAddresses,
  persistUserAddresses,
  searchAddressSuggestions,
} from '../../client-api/addresses'
import { toErrorMessage } from '../../client-api/parseApiError'
import type { AddressDraft, FormMessage, PhotonAddressSuggestion } from '../../forms/types'
import type { AddressItem, AddressesView } from '../../types'
import { createMutationQueue } from './mutationQueue'

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

type AddressStateItem = AddressItem & { isDefault: boolean }

const normalizeAddressState = (rows: AddressItem[]): AddressStateItem[] => {
  const withFlag = rows.map((row) => ({ ...row, isDefault: Boolean(row.isDefault) }))
  const defaultIndex = withFlag.findIndex((row) => row.isDefault)
  if (defaultIndex <= 0) {
    return withFlag.map((row, index) => ({ ...row, isDefault: index === 0 }))
  }

  const ordered = [...withFlag]
  const [defaultRow] = ordered.splice(defaultIndex, 1)
  ordered.unshift(defaultRow)
  return ordered.map((row, index) => ({ ...row, isDefault: index === 0 }))
}

export function useAccountAddresses({ initialAddresses, userId }: UseAccountAddressesArgs) {
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressesView, setAddressesView] = useState<AddressesView>('default')
  const [addressMessage, setAddressMessage] = useState<FormMessage | null>(null)
  const [addressDraft, setAddressDraft] = useState<AddressDraft>(DEFAULT_ADDRESS_DRAFT)
  const [addressLookupQuery, setAddressLookupQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<PhotonAddressSuggestion[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)

  const enqueuePersistRef = useRef(createMutationQueue())
  const addressesRevisionRef = useRef(0)

  const initialAddressState = normalizeAddressState(initialAddresses)

  const { data: addresses = initialAddressState, mutate: mutateAddresses, isLoading: addressesLoading } = useSWR<
    AddressStateItem[]
  >(`account:addresses:${userId}`, async () => normalizeAddressState(await fetchUserAddresses(userId)), {
    fallbackData: initialAddressState,
    revalidateOnFocus: false,
    errorRetryCount: 1,
    dedupingInterval: 60_000,
  })

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

  const enqueueAddressMutation = ({
    createNext,
    successMessage,
    onSuccess,
  }: {
    createNext: (current: AddressStateItem[]) => AddressStateItem[]
    successMessage?: string
    onSuccess?: () => void
  }) => {
    const revision = ++addressesRevisionRef.current
    let previousAddresses: AddressStateItem[] = []
    let nextAddresses: AddressStateItem[] = []

    setAddressMessage(null)

    void mutateAddresses(
      (current = []) => {
        previousAddresses = current
        nextAddresses = createNext(current)
        return nextAddresses
      },
      { revalidate: false },
    )

    void enqueuePersistRef.current(async () => {
      try {
        await persistUserAddresses(userId, nextAddresses)
        if (successMessage) {
          setAddressMessage({ type: 'success', text: successMessage })
        }
        onSuccess?.()
      } catch (error) {
        if (addressesRevisionRef.current === revision) {
          await mutateAddresses(previousAddresses, { revalidate: false })
        } else {
          await mutateAddresses()
        }

        setAddressMessage({
          type: 'error',
          text: toErrorMessage(error, 'Errore salvataggio indirizzi.'),
        })
      }
    })
  }

  const onDeleteAddressById = (id: string) => {
    if (editingAddressId === id) setEditingAddressId(null)

    enqueueAddressMutation({
      createNext: (current) => current.filter((address) => address.id !== id),
    })
  }

  const onSetDefaultAddress = (id: string) => {
    enqueueAddressMutation({
      createNext: (current) => {
        const index = current.findIndex((address) => address.id === id)
        if (index <= 0) return current

        const output = [...current]
        const [selected] = output.splice(index, 1)
        output.unshift(selected)

        return output.map((entry, entryIndex) => ({
          ...entry,
          isDefault: entryIndex === 0,
        }))
      },
    })
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

    enqueueAddressMutation({
      createNext: (current) => {
        const base = editingAddressId
          ? current.map((address) => (address.id === editingAddressId ? nextAddress : address))
          : [...current, nextAddress]

        if (addressDraft.isDefault) {
          return [
            ...base.filter((address) => address.id === nextAddress.id),
            ...base.filter((address) => address.id !== nextAddress.id),
          ].map((entry, index) => ({ ...entry, isDefault: index === 0 }))
        }

        if (base.length === 1) {
          return [{ ...nextAddress, isDefault: true }]
        }

        return base.map((entry, index) => ({
          ...entry,
          isDefault: entry.id === nextAddress.id ? false : index === 0,
        }))
      },
      successMessage: 'Indirizzo salvato.',
      onSuccess: () => {
        setShowAddressForm(false)
        setAddressLookupQuery('')
        setEditingAddressId(null)
        setAddressDraft(DEFAULT_ADDRESS_DRAFT)
      },
    })
  }

  return {
    addresses,
    defaultAddress,
    addressesLoading,
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
