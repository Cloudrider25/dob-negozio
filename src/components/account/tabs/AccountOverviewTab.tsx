'use client'

import { SectionTitle } from '@/components/sections/SectionTitle'
import { LabelText } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { AccountPillButton } from '../AccountButtons'
import type { FormMessage } from '../forms/types'

type AccountOverviewTabProps = {
  styles: Record<string, string>
  copy: {
    overview: {
      greeting: string
      yourInfo: string
      firstName: string
      lastName: string
      phone: string
      email: string
      saveProfile: string
      savingProfile: string
    }
    fallbackCustomer: string
  }
  identity: {
    firstName: string
    email: string
  }
  data: {
    profileDraft: {
      firstName: string
      lastName: string
      phone: string
    }
    profileSaving: boolean
    profileMessage: FormMessage | null
  }
  actions: {
    setProfileDraft: React.Dispatch<
      React.SetStateAction<{
        firstName: string
        lastName: string
        phone: string
      }>
    >
    onSaveProfile: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  }
}

export default function AccountOverviewTab({
  styles,
  copy,
  identity,
  data,
  actions,
}: AccountOverviewTabProps) {
  return (
    <>
      <SectionTitle as="h2" size="h2" className={styles.title}>
        {copy.overview.greeting}, {identity.firstName || copy.fallbackCustomer}
      </SectionTitle>
      <hr className={styles.sectionDivider} />

      <div className={styles.block}>
        <SectionTitle as="h3" size="h3" uppercase className={styles.subHeading}>
          {copy.overview.yourInfo}
        </SectionTitle>
        <form className={styles.profileForm} onSubmit={actions.onSaveProfile}>
          <div className={styles.infoGrid}>
            <label className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                {copy.overview.firstName}
              </LabelText>
              <Input
                className={`${styles.profileInput} typo-body`}
                value={data.profileDraft.firstName}
                onChange={(event) =>
                  actions.setProfileDraft((prev) => ({ ...prev, firstName: event.target.value }))
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
                value={data.profileDraft.lastName}
                onChange={(event) =>
                  actions.setProfileDraft((prev) => ({ ...prev, lastName: event.target.value }))
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
                value={data.profileDraft.phone}
                onChange={(event) =>
                  actions.setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))
                }
                autoComplete="tel"
              />
            </label>
            <div className={styles.profileField}>
              <LabelText className={styles.label} variant="field">
                {copy.overview.email}
              </LabelText>
              <p className={`${styles.value} typo-body-lg`}>{identity.email}</p>
            </div>
          </div>
          <div className={styles.formActions}>
            <AccountPillButton
              type="submit"
              className="typo-small-upper"
              disabled={data.profileSaving}
            >
              {data.profileSaving ? copy.overview.savingProfile : copy.overview.saveProfile}
            </AccountPillButton>
          </div>
          {data.profileMessage ? (
            <p
              className={`${data.profileMessage.type === 'success' ? styles.successText : styles.errorText} typo-caption`}
            >
              {data.profileMessage.text}
            </p>
          ) : null}
        </form>
      </div>
    </>
  )
}
