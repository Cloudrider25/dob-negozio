'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { getAccountDictionary } from '@/lib/account-i18n'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { LabelText } from '@/components/ui/label'
import { Input, Select } from '@/components/ui/input'

import { AccountLogoutButton } from './AccountLogoutButton'
import styles from './AccountDashboardClient.module.css'

type AccountSection = 'overview' | 'orders' | 'addresses'

type AddressItem = {
  id: string
  fullName: string
  address: string
  postalCode: string
  city: string
  province: string
  country: string
}

type OrderItem = {
  id: number
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  currency: string
  createdAt: string
}

type AccountDashboardClientProps = {
  locale: string
  userId: number
  email: string
  firstName: string
  lastName: string
  phone: string
  initialOrders: OrderItem[]
  initialAddresses: AddressItem[]
}

export function AccountDashboardClient({
  locale,
  userId,
  email,
  firstName,
  lastName,
  phone,
  initialOrders,
  initialAddresses,
}: AccountDashboardClientProps) {
  const copy = getAccountDictionary(locale).account
  const [section, setSection] = useState<AccountSection>('overview')
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [profileDraft, setProfileDraft] = useState({
    firstName,
    lastName,
    phone,
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [addressDraft, setAddressDraft] = useState({
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
  })

  const defaultAddress = addresses[0] ?? null

  const formatMoney = (value: number, currency: string) =>
    new Intl.NumberFormat(locale === 'it' ? 'it-IT' : locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(value)

  const sortedOrders = useMemo(
    () =>
      [...initialOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [initialOrders],
  )

  const onDeleteAddress = () => {
    if (addresses.length === 0) return
    setAddresses((prev) => prev.slice(1))
  }

  const onSaveAddress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const required = [
      addressDraft.firstName,
      addressDraft.lastName,
      addressDraft.streetAddress,
      addressDraft.city,
      addressDraft.country,
      addressDraft.province,
      addressDraft.postalCode,
    ]
    if (required.some((value) => value.trim().length === 0)) return

    const newAddress: AddressItem = {
      id: `${Date.now()}`,
      fullName: `${addressDraft.firstName} ${addressDraft.lastName}`.trim(),
      address: [addressDraft.streetAddress, addressDraft.apartment].filter(Boolean).join(', '),
      postalCode: addressDraft.postalCode,
      city: addressDraft.city,
      province: addressDraft.province,
      country: addressDraft.country,
    }

    setAddresses((prev) => (addressDraft.isDefault ? [newAddress, ...prev] : [...prev, newAddress]))
    setShowAddressForm(false)
    setAddressDraft({
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
    })
  }

  const onSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (profileSaving) return

    setProfileSaving(true)
    setProfileMessage(null)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: profileDraft.firstName.trim(),
          lastName: profileDraft.lastName.trim(),
          phone: profileDraft.phone.trim(),
        }),
      })

      const data = (await response.json().catch(() => ({}))) as {
        message?: string
        errors?: Array<{ message?: string }>
      }
      if (!response.ok) {
        const message =
          data.message ||
          data.errors?.find((entry) => typeof entry?.message === 'string')?.message ||
          copy.overview.profileSaveError
        setProfileMessage({ type: 'error', text: message })
        return
      }

      setProfileMessage({ type: 'success', text: copy.overview.profileSaved })
    } catch {
      setProfileMessage({ type: 'error', text: copy.overview.profileNetworkError })
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <nav className={styles.menu} aria-label={copy.nav.ariaLabel}>
          <button className={`${styles.menuButton} typo-body-lg`} type="button" onClick={() => setSection('overview')}>
            <span className="typo-body-lg">{copy.nav.overview}</span>
            <span className={`${styles.menuDot} ${section === 'overview' ? styles.menuDotActive : ''}`} />
          </button>
          <button className={`${styles.menuButton} typo-body-lg`} type="button" onClick={() => setSection('orders')}>
            <span className="typo-body-lg">{copy.nav.orders}</span>
            <span className={`${styles.menuDot} ${section === 'orders' ? styles.menuDotActive : ''}`} />
          </button>
          <button className={`${styles.menuButton} typo-body-lg`} type="button" onClick={() => setSection('addresses')}>
            <span className="typo-body-lg">{copy.nav.addresses}</span>
            <span className={`${styles.menuDot} ${section === 'addresses' ? styles.menuDotActive : ''}`} />
          </button>
        </nav>

        <p className={`${styles.help} typo-body-lg`}>
          {copy.help}{' '}
          <Link href={`/${locale}/contact`}>
            {copy.contactUs}
          </Link>
        </p>

        <div className={styles.logoutWrap}>
          <AccountLogoutButton locale={locale} className="typo-small-upper" label="LOG OUT" />
        </div>
      </aside>

      <section className={styles.content}>
        {section === 'overview' ? (
          <>
            <SectionTitle as="h2" size="h2" className={styles.title}>
              {copy.overview.greeting}, {firstName || copy.fallbackCustomer}
            </SectionTitle>
            <hr className={styles.sectionDivider} />

            <div className={styles.block}>
              <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                {copy.overview.yourInfo}
              </SectionTitle>
              <form className={styles.profileForm} onSubmit={onSaveProfile}>
                <div className={styles.infoGrid}>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      {copy.overview.firstName}
                    </LabelText>
                    <Input
                      className={`${styles.profileInput} typo-body`}
                      value={profileDraft.firstName}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({ ...prev, firstName: event.target.value }))
                      }
                      autoComplete="given-name"
                    />
                  </label>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      {copy.overview.lastName}
                    </LabelText>
                    <Input
                      className={`${styles.profileInput} typo-body`}
                      value={profileDraft.lastName}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({ ...prev, lastName: event.target.value }))
                      }
                      autoComplete="family-name"
                    />
                  </label>
                  <label className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      {copy.overview.phone}
                    </LabelText>
                    <Input
                      className={`${styles.profileInput} typo-body`}
                      value={profileDraft.phone}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      autoComplete="tel"
                    />
                  </label>
                  <div className={styles.profileField}>
                    <LabelText className={styles.label} variant="field">
                      {copy.overview.email}
                    </LabelText>
                    <p className={`${styles.value} typo-body-lg`}>{email}</p>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={`${styles.pillButton} typo-small-upper`} disabled={profileSaving}>
                    {profileSaving ? copy.overview.savingProfile : copy.overview.saveProfile}
                  </button>
                </div>
                {profileMessage ? (
                  <p className={`${profileMessage.type === 'success' ? styles.successText : styles.errorText} typo-caption`}>
                    {profileMessage.text}
                  </p>
                ) : null}
              </form>
            </div>

            <div className={styles.block}>
              <div className={styles.rowBetween}>
                <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                  {copy.overview.defaultAddress}
                </SectionTitle>
                <button
                  type="button"
                  className={`${styles.inlineLink} typo-caption-upper`}
                  onClick={() => setSection('addresses')}
                >
                  {copy.overview.viewAddressBook}
                </button>
              </div>
              <p className={`${styles.value} typo-body-lg`}>
                {defaultAddress
                  ? `${defaultAddress.country}`
                  : copy.overview.noDefaultAddress}
              </p>
              <button type="button" className={`${styles.pillButton} typo-small-upper`} onClick={() => setSection('addresses')}>
                {copy.overview.changeDefaultAddress}
              </button>
            </div>
          </>
        ) : null}

        {section === 'orders' ? (
          <>
            {sortedOrders.length === 0 ? (
              <SectionTitle as="h2" size="h2" className={styles.title}>
                {copy.orders.empty}
              </SectionTitle>
            ) : (
              <>
                <SectionTitle as="h2" size="h2" className={styles.title}>
                  {copy.orders.title}, {firstName || copy.fallbackCustomer}
                </SectionTitle>
                <hr className={styles.sectionDivider} />
                <div className={styles.ordersList}>
                  {sortedOrders.map((order) => (
                    <article key={order.id} className={styles.orderCard}>
                      <div className={styles.orderPrimary}>
                        <p className={`${styles.orderNumber} typo-small`}>{order.orderNumber}</p>
                        <p className={`${styles.orderAmount} typo-small`}>{formatMoney(order.total, order.currency)}</p>
                      </div>
                      <p className={`${styles.orderMeta} typo-caption`}>
                        {order.status} · {order.paymentStatus}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        ) : null}

        {section === 'addresses' ? (
          <>
            <SectionTitle as="h2" size="h2" className={styles.title}>
              {copy.addresses.title}, {firstName || copy.fallbackCustomer}
            </SectionTitle>
            <hr className={styles.sectionDivider} />
            <div className={styles.block}>
              <div className={styles.rowBetween}>
                <div>
                  <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
                    {copy.addresses.defaultAddress}
                  </SectionTitle>
                  <p className={`${styles.value} typo-body-lg`}>
                    {defaultAddress
                      ? `${defaultAddress.address}, ${defaultAddress.postalCode} ${defaultAddress.city} ${defaultAddress.province}, ${defaultAddress.country}`
                      : copy.addresses.noAddress}
                  </p>
                </div>
                {defaultAddress ? (
                  <div className={styles.addressActions}>
                    <button type="button" className={`${styles.pillButton} typo-small-upper`} onClick={() => setShowAddressForm(true)}>
                      {copy.addresses.edit}
                    </button>
                    <button type="button" className={`${styles.pillButton} typo-small-upper`} onClick={onDeleteAddress}>
                      {copy.addresses.delete}
                    </button>
                  </div>
                ) : null}
              </div>
              <button type="button" className={`${styles.pillButton} typo-small-upper`} onClick={() => setShowAddressForm((value) => !value)}>
                {copy.addresses.addNewAddress}
              </button>
            </div>

            {showAddressForm ? (
              <form className={styles.addressForm} onSubmit={onSaveAddress}>
                <SectionTitle as="h3" size="h3" className={styles.addressFormTitle}>
                  {copy.addresses.formTitle}
                </SectionTitle>
                <Input
                  className={`${styles.input} typo-body`}
                  placeholder={copy.addresses.firstName}
                  value={addressDraft.firstName}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                />
                <Input
                  className={`${styles.input} typo-body`}
                  placeholder={copy.addresses.lastName}
                  value={addressDraft.lastName}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                />
                <Input
                  className={`${styles.input} typo-body`}
                  placeholder={copy.addresses.company}
                  value={addressDraft.company}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, company: event.target.value }))
                  }
                />
                <Input
                  className={`${styles.input} typo-body`}
                  placeholder={copy.addresses.streetAddress}
                  maxLength={30}
                  value={addressDraft.streetAddress}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, streetAddress: event.target.value }))
                  }
                />
                <p className={`${styles.limitHint} typo-caption`}>{copy.addresses.limitHint}</p>
                <Input
                  className={`${styles.input} typo-body`}
                  placeholder={copy.addresses.apartment}
                  maxLength={30}
                  value={addressDraft.apartment}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, apartment: event.target.value }))
                  }
                />
                <p className={`${styles.limitHint} typo-caption`}>{copy.addresses.limitHint}</p>
                <input
                  className={`${styles.input} typo-body`}
                  placeholder={copy.addresses.city}
                  maxLength={30}
                  value={addressDraft.city}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, city: event.target.value }))
                  }
                />
                <p className={`${styles.limitHint} typo-caption`}>{copy.addresses.limitHint}</p>
                <Select
                  className={`${styles.select} typo-body`}
                  value={addressDraft.country}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, country: event.target.value }))
                  }
                >
                  <option value="Italy">{copy.addresses.countryItaly}</option>
                </Select>
                <Select
                  className={`${styles.select} typo-body`}
                  value={addressDraft.province}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, province: event.target.value }))
                  }
                >
                  <option value="">{copy.addresses.province}</option>
                  <option value="Monza and Brianza">{copy.addresses.provinceMonza}</option>
                  <option value="Milano">{copy.addresses.provinceMilano}</option>
                </Select>
                <Input
                  className={`${styles.input} typo-body`}
                  placeholder={copy.addresses.postalCode}
                  value={addressDraft.postalCode}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, postalCode: event.target.value }))
                  }
                />
                <Input
                  className={`${styles.input} typo-body`}
                  placeholder={copy.addresses.phone}
                  value={addressDraft.phone}
                  onChange={(event) =>
                    setAddressDraft((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={addressDraft.isDefault}
                    onChange={(event) =>
                      setAddressDraft((prev) => ({ ...prev, isDefault: event.target.checked }))
                    }
                  />
                  <span className={`${styles.checkboxLabel} typo-small`}>{copy.addresses.setDefaultAddress}</span>
                </label>
                <div className={styles.formActions}>
                  <button type="submit" className={`${styles.pillButton} typo-small-upper`}>
                    {copy.addresses.saveAddress}
                  </button>
                  <button
                    type="button"
                    className={`${styles.cancelLink} typo-small-upper`}
                    onClick={() => setShowAddressForm(false)}
                  >
                    {copy.addresses.cancel}
                  </button>
                </div>
              </form>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  )
}
