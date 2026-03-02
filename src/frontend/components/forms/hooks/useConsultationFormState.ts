'use client'

import { useState } from 'react'
import { toggleConcernSelection } from '../shared/state'
import type { ConsultationFormState, ConsultationSubmitStatus } from '../shared/types'

const INITIAL_FORM_STATE: ConsultationFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  skinType: '',
  concerns: [],
  message: '',
}

export const useConsultationFormState = () => {
  const [formData, setFormData] = useState<ConsultationFormState>(INITIAL_FORM_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<ConsultationSubmitStatus>('idle')

  const clearSubmitStatus = () => {
    setSubmitStatus((prev) => (prev === 'idle' ? prev : 'idle'))
  }

  const updateField = (field: keyof ConsultationFormState, value: string) => {
    clearSubmitStatus()
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const setSkinType = (skinType: string) => {
    clearSubmitStatus()
    setFormData((prev) => ({ ...prev, skinType }))
  }

  const toggleConcern = (concern: string) => {
    clearSubmitStatus()
    setFormData((prev) => ({
      ...prev,
      concerns: toggleConcernSelection(prev.concerns, concern),
    }))
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE)
  }

  return {
    formData,
    isSubmitting,
    submitStatus,
    setIsSubmitting,
    setSubmitStatus,
    updateField,
    setSkinType,
    toggleConcern,
    resetForm,
  }
}
