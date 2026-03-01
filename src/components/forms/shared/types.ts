import type { ConsultationLeadInput } from '@/lib/consultation/types'

export type ConsultationFormData = ConsultationLeadInput

export type ConsultationFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  skinType: string
  concerns: string[]
  message: string
}

export type ConsultationSubmitStatus = 'idle' | 'success' | 'error'

export type ConsultationFormProps = {
  phoneLink: string
  whatsappLink: string
  phoneDisplay: string
  whatsappDisplay: string
  onSubmit?: (data: ConsultationFormData) => Promise<void> | void
  submitSuccessMessage?: string
  submitErrorMessage?: string
}
