import type { ConsultationFormData, ConsultationFormState } from './types'

const sanitizeValue = (value: string) => value.trim()

const toOptionalValue = (value: string) => {
  const sanitized = sanitizeValue(value)
  return sanitized ? sanitized : undefined
}

export const toConsultationSubmitPayload = (
  formData: ConsultationFormState,
): ConsultationFormData => ({
  firstName: sanitizeValue(formData.firstName),
  lastName: sanitizeValue(formData.lastName),
  email: sanitizeValue(formData.email),
  phone: sanitizeValue(formData.phone),
  skinType: toOptionalValue(formData.skinType),
  concerns: formData.concerns.length > 0 ? formData.concerns : undefined,
  message: toOptionalValue(formData.message),
})
