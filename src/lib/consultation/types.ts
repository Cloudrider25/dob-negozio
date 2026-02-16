export type ConsultationLeadInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  skinType?: string
  concerns?: string[]
  message?: string
  source?: string
  locale?: string
  pagePath?: string
}
