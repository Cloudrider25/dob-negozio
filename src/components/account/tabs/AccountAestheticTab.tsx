'use client'

import { SectionTitle } from '@/components/sections/SectionTitle'

import { AestheticForm } from '../forms/AestheticForm'
import type { AestheticFolderDraft, FormMessage } from '../forms/types'

type AccountAestheticTabProps = {
  styles: Record<string, string>
  identity: {
    firstName: string
    fallbackCustomer: string
  }
  form: {
    draft: AestheticFolderDraft
    setDraft: React.Dispatch<React.SetStateAction<AestheticFolderDraft>>
    saving: boolean
    message: FormMessage | null
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  }
}

export default function AccountAestheticTab({
  styles,
  identity,
  form,
}: AccountAestheticTabProps) {
  return (
    <>
      <SectionTitle as="h2" size="h2" className={styles.title}>
        Cartella Estetica, {identity.firstName || identity.fallbackCustomer}
      </SectionTitle>
      <hr className={styles.sectionDivider} />
      <AestheticForm
        draft={form.draft}
        setDraft={form.setDraft}
        saving={form.saving}
        message={form.message}
        onSubmit={form.onSubmit}
      />
    </>
  )
}
