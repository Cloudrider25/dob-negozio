'use client'

import type { Dispatch, FormEvent, SetStateAction } from 'react'

import { SectionTitle } from '@/components/sections/SectionTitle'
import { Input, Select } from '@/components/ui/input'
import { AccountPillButton } from '@/components/account/shared/AccountButtons'

import type { AddressDraft, FormMessage, PhotonAddressSuggestion } from '../types'
import styles from './AddressForm.module.css'

type AddressCopy = {
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

type AddressFormProps = {
  editingAddressId: string | null
  message: FormMessage | null
  copy: AddressCopy
  draft: AddressDraft
  lookupQuery: string
  cityLoading: boolean
  showCitySuggestions: boolean
  citySuggestions: PhotonAddressSuggestion[]
  onLookupQueryChange: (value: string) => void
  onLookupFocus: () => void
  onLookupBlur: () => void
  onSuggestionSelect: (suggestion: PhotonAddressSuggestion) => void
  setDraft: Dispatch<SetStateAction<AddressDraft>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function AddressForm({
  editingAddressId,
  message,
  copy,
  draft,
  lookupQuery,
  cityLoading,
  showCitySuggestions,
  citySuggestions,
  onLookupQueryChange,
  onLookupFocus,
  onLookupBlur,
  onSuggestionSelect,
  setDraft,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  return (
    <form className={styles.addressForm} onSubmit={onSubmit}>
      <SectionTitle as="h3" size="h3" className={styles.title}>
        {editingAddressId ? 'Modifica indirizzo' : copy.formTitle}
      </SectionTitle>
      {message ? (
        <p className={`${message.type === 'success' ? styles.successText : styles.errorText} typo-caption`}>
          {message.text}
        </p>
      ) : null}
      <div className={styles.formBlock}>
        <p className={`${styles.formBlockLabel} typo-caption-upper`}>Ricerca indirizzo</p>
        <div className={styles.cityAutocomplete}>
          <Input
            className={`${styles.input} typo-body`}
            placeholder="Indirizzo (ricerca automatica)"
            value={lookupQuery}
            autoComplete="off"
            onFocus={onLookupFocus}
            onChange={(event) => onLookupQueryChange(event.target.value)}
            onBlur={onLookupBlur}
          />
          {showCitySuggestions && (cityLoading || citySuggestions.length > 0) ? (
            <div className={styles.citySuggestions} role="listbox" aria-label="Suggerimenti indirizzo">
              {cityLoading ? (
                <div className={`${styles.citySuggestionItem} ${styles.citySuggestionMuted} typo-caption`}>
                  Ricerca indirizzo...
                </div>
              ) : (
                citySuggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    className={`${styles.citySuggestionItem} typo-caption`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSuggestionSelect(suggestion)}
                  >
                    {suggestion.label}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.formBlockDivider} aria-hidden="true" />

      <div className={styles.formBlock}>
        <p className={`${styles.formBlockLabel} typo-caption-upper`}>Intestatario</p>
        <Input
          className={`${styles.input} typo-body`}
          placeholder={copy.firstName}
          value={draft.firstName}
          onChange={(event) => setDraft((prev) => ({ ...prev, firstName: event.target.value }))}
        />
        <Input
          className={`${styles.input} typo-body`}
          placeholder={copy.lastName}
          value={draft.lastName}
          onChange={(event) => setDraft((prev) => ({ ...prev, lastName: event.target.value }))}
        />
        <Input
          className={`${styles.input} typo-body`}
          placeholder={copy.company}
          value={draft.company}
          onChange={(event) => setDraft((prev) => ({ ...prev, company: event.target.value }))}
        />
      </div>

      <div className={styles.formBlockDivider} aria-hidden="true" />

      <div className={styles.formBlock}>
        <p className={`${styles.formBlockLabel} typo-caption-upper`}>Indirizzo</p>
        <Input
          className={`${styles.input} typo-body`}
          placeholder={copy.streetAddress}
          maxLength={30}
          value={draft.streetAddress}
          autoComplete="street-address"
          onChange={(event) => setDraft((prev) => ({ ...prev, streetAddress: event.target.value }))}
        />
        <Input
          className={`${styles.input} typo-body`}
          placeholder={copy.apartment}
          maxLength={30}
          value={draft.apartment}
          onChange={(event) => setDraft((prev) => ({ ...prev, apartment: event.target.value }))}
        />
        <Input
          className={`${styles.input} typo-body`}
          placeholder={copy.city}
          maxLength={30}
          value={draft.city}
          autoComplete="address-level2"
          onChange={(event) => setDraft((prev) => ({ ...prev, city: event.target.value }))}
        />
        <p className={`${styles.limitHint} typo-caption`}>{copy.limitHint}</p>
      </div>

      <div className={styles.formBlockDivider} aria-hidden="true" />

      <div className={styles.formBlock}>
        <p className={`${styles.formBlockLabel} typo-caption-upper`}>Consegna e contatti</p>
        <Select
          className={`${styles.select} typo-body`}
          value={draft.country}
          onChange={(event) => setDraft((prev) => ({ ...prev, country: event.target.value }))}
        >
          <option value="Italy">{copy.countryItaly}</option>
        </Select>
        <Select
          className={`${styles.select} typo-body`}
          value={draft.province}
          onChange={(event) => setDraft((prev) => ({ ...prev, province: event.target.value }))}
        >
          <option value="">{copy.province}</option>
          <option value="Monza and Brianza">{copy.provinceMonza}</option>
          <option value="Milano">{copy.provinceMilano}</option>
        </Select>
        <Input
          className={`${styles.input} typo-body`}
          placeholder={copy.postalCode}
          value={draft.postalCode}
          onChange={(event) => setDraft((prev) => ({ ...prev, postalCode: event.target.value }))}
        />
        <Input
          className={`${styles.input} typo-body`}
          placeholder={copy.phone}
          value={draft.phone}
          onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
        />
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={draft.isDefault}
            onChange={(event) => setDraft((prev) => ({ ...prev, isDefault: event.target.checked }))}
          />
          <span className={`${styles.checkboxLabel} typo-small`}>{copy.setDefaultAddress}</span>
        </label>
      </div>
      <div className={styles.formActions}>
        <AccountPillButton type="submit" className={`${styles.pillButton} typo-small-upper`}>
          {copy.saveAddress}
        </AccountPillButton>
        <button type="button" className={`${styles.cancelLink} typo-small-upper`} onClick={onCancel}>
          {copy.cancel}
        </button>
      </div>
    </form>
  )
}
