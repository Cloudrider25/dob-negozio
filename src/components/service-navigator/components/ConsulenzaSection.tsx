'use client'

import { ConsulenzaForm } from '@/components/service-navigator/components/ConsulenzaForm'

type ContactLinks = {
  phoneLink: string
  whatsappLink: string
  phoneDisplay: string
  whatsappDisplay: string
}

export function ConsulenzaSection({ contactLinks }: { contactLinks: ContactLinks }) {
  return (
    <ConsulenzaForm
      phoneLink={contactLinks.phoneLink}
      whatsappLink={contactLinks.whatsappLink}
      phoneDisplay={contactLinks.phoneDisplay}
      whatsappDisplay={contactLinks.whatsappDisplay}
    />
  )
}
