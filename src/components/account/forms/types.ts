export type PhotonAddressSuggestion = {
  label: string
  streetAddress?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
}

export type AestheticFolderDraft = {
  lastAssessmentDate: string
  skinType: string
  skinSensitivity: string
  fitzpatrick: string
  hydrationLevel: string
  sebumLevel: string
  elasticityLevel: string
  acneTendency: boolean
  rosaceaTendency: boolean
  hyperpigmentationTendency: boolean
  allergies: string
  contraindications: string
  medications: string
  pregnancyOrBreastfeeding: string
  homeCareRoutine: string
  treatmentGoals: string
  estheticianNotes: string
  serviceRecommendations: string
  productRecommendations: string
}

export type AddressDraft = {
  firstName: string
  lastName: string
  company: string
  streetAddress: string
  apartment: string
  city: string
  country: string
  province: string
  postalCode: string
  phone: string
  isDefault: boolean
}

export type FormMessage = {
  type: 'success' | 'error'
  text: string
}
