'use client'

import { SectionTitle } from '@/components/sections/SectionTitle'

import { AccountPillButton } from '../AccountButtons'
import { AddressForm } from '../forms/AddressForm'
import type { AddressDraft, FormMessage, PhotonAddressSuggestion } from '../forms/types'
import type { AddressItem, AddressesView } from '../types'

type AccountAddressesTabProps = {
  styles: Record<string, string>
  copy: {
    addresses: {
      title: string
      defaultAddress: string
      noAddress: string
      addNewAddress: string
      edit: string
      delete: string
      formTitle: string
      firstName: string
      lastName: string
      company: string
      streetAddress: string
      apartment: string
      city: string
      limitHint: string
      countryItaly: string
      province: string
      provinceMonza: string
      provinceMilano: string
      postalCode: string
      phone: string
      setDefaultAddress: string
      saveAddress: string
      cancel: string
    }
  }
  identity: {
    firstName: string
    fallbackCustomer: string
  }
  data: {
    addressesView: AddressesView
    defaultAddress: AddressItem | null
    addresses: AddressItem[]
    showAddressForm: boolean
    editingAddressId: string | null
    addressMessage: FormMessage | null
    addressDraft: AddressDraft
    addressLookupQuery: string
    cityLoading: boolean
    showCitySuggestions: boolean
    citySuggestions: PhotonAddressSuggestion[]
  }
  actions: {
    setAddressLookupQuery: (value: string) => void
    setShowCitySuggestions: (value: boolean) => void
    applyCitySuggestion: (suggestion: PhotonAddressSuggestion) => void
    setAddressDraft: React.Dispatch<React.SetStateAction<AddressDraft>>
    onSaveAddress: (event: React.FormEvent<HTMLFormElement>) => void
    setEditingAddressId: (id: string | null) => void
    setShowAddressForm: (value: boolean | ((prev: boolean) => boolean)) => void
    setAddressMessage: (message: FormMessage | null) => void
    setAddressesView: (view: AddressesView) => void
    onSetDefaultAddress: (addressId: string) => void
    onEditAddress: (address: AddressItem) => void
    onDeleteAddressById: (addressId: string) => void
  }
  formatAddressLines: (address: AddressItem) => string[]
}

export default function AccountAddressesTab({
  styles,
  copy,
  identity,
  data,
  actions,
  formatAddressLines,
}: AccountAddressesTabProps) {
  return (
    <>
      <SectionTitle as="h2" size="h2" className={styles.title}>
        {copy.addresses.title}, {identity.firstName || identity.fallbackCustomer}
      </SectionTitle>
      <hr className={styles.sectionDivider} />
      {data.addressesView === 'default' ? (
        <div className={styles.block}>
          <div className={`${styles.rowBetween} ${styles.addressHeaderRow}`}>
            <div>
              <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                {copy.addresses.defaultAddress}
              </SectionTitle>
              {data.defaultAddress ? (
                <div className={`${styles.addressPreview} typo-body-lg`}>
                  {formatAddressLines(data.defaultAddress).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className={`${styles.value} typo-body-lg`}>{copy.addresses.noAddress}</p>
              )}
            </div>
          </div>
          <div className={styles.addressSectionActions}>
            {data.defaultAddress ? (
              <AccountPillButton
                type="button"
                className={`${styles.addressPrimaryButton} typo-small-upper`}
                onClick={() => {
                  actions.setAddressesView('book')
                  actions.setEditingAddressId(null)
                  actions.setShowAddressForm(false)
                  actions.setAddressMessage(null)
                }}
              >
                Vedi/Modifica rubrica indirizzi
              </AccountPillButton>
            ) : (
              <AccountPillButton
                type="button"
                className={`${styles.addressPrimaryButton} typo-small-upper`}
                onClick={() => {
                  actions.setAddressesView('default')
                  actions.setEditingAddressId(null)
                  actions.setAddressMessage(null)
                  actions.setAddressLookupQuery('')
                  actions.setShowAddressForm((value) => !value)
                }}
              >
                {copy.addresses.addNewAddress}
              </AccountPillButton>
            )}
          </div>
        </div>
      ) : null}

      {data.addressesView === 'book' ? (
        <div className={`${styles.block} ${styles.addressBookBlock}`}>
          <div className={styles.addressBookHeader}>
            <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
              Rubrica indirizzi
            </SectionTitle>
            <button
              type="button"
              className={`${styles.addressBackLink} typo-caption-upper`}
              onClick={() => actions.setAddressesView('default')}
            >
              Chiudi rubrica
            </button>
          </div>

          <div className={styles.addressBookList}>
            {data.addresses.length === 0 ? (
              <p className={`${styles.value} typo-body-lg`}>{copy.addresses.noAddress}</p>
            ) : (
              data.addresses.map((address, index) => (
                <div key={address.id} className={styles.addressBookCard}>
                  <div>
                    <p className={`${styles.serviceCellTitle} typo-caption-upper`}>
                      {index === 0 ? copy.addresses.defaultAddress : 'Indirizzo'}
                    </p>
                    <div className={`${styles.addressPreview} typo-body-lg`}>
                      {formatAddressLines(address).map((line) => (
                        <p key={`${address.id}-${line}`}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <div className={styles.addressBookActions}>
                    {index !== 0 ? (
                      <AccountPillButton
                        type="button"
                        className={`${styles.addressPrimaryButton} typo-small-upper`}
                        onClick={() => actions.onSetDefaultAddress(address.id)}
                      >
                        Imposta predefinito
                      </AccountPillButton>
                    ) : null}
                    <div className={styles.addressBookActionRow}>
                      <AccountPillButton
                        type="button"
                        className={`${styles.addressPrimaryButton} typo-small-upper`}
                        onClick={() => actions.onEditAddress(address)}
                      >
                        {copy.addresses.edit}
                      </AccountPillButton>
                      <button
                        type="button"
                        className={`${styles.addressDeleteLink} typo-caption-upper`}
                        onClick={() => actions.onDeleteAddressById(address.id)}
                      >
                        {copy.addresses.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <AccountPillButton
            type="button"
            className={`${styles.addressPrimaryButton} typo-small-upper`}
            onClick={() => {
              actions.setAddressesView('book')
              actions.setEditingAddressId(null)
              actions.setShowAddressForm((value) => !value)
              actions.setAddressMessage(null)
              actions.setAddressLookupQuery('')
            }}
          >
            {copy.addresses.addNewAddress}
          </AccountPillButton>
        </div>
      ) : null}

      {data.showAddressForm ? (
        <AddressForm
          editingAddressId={data.editingAddressId}
          message={data.addressMessage}
          copy={copy.addresses}
          draft={data.addressDraft}
          lookupQuery={data.addressLookupQuery}
          cityLoading={data.cityLoading}
          showCitySuggestions={data.showCitySuggestions}
          citySuggestions={data.citySuggestions}
          onLookupQueryChange={actions.setAddressLookupQuery}
          onLookupFocus={() => actions.setShowCitySuggestions(true)}
          onLookupBlur={() => {
            window.setTimeout(() => actions.setShowCitySuggestions(false), 120)
          }}
          onSuggestionSelect={actions.applyCitySuggestion}
          setDraft={actions.setAddressDraft}
          onSubmit={actions.onSaveAddress}
          onCancel={() => {
            actions.setEditingAddressId(null)
            actions.setAddressMessage(null)
            actions.setAddressLookupQuery('')
            actions.setShowAddressForm(false)
          }}
        />
      ) : null}
    </>
  )
}
