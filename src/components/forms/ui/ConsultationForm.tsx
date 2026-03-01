'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { useConsultationFormState } from '../hooks/useConsultationFormState'
import { toConsultationSubmitPayload } from '../shared/payload'
import { mapSubmitErrorToStatus } from '../shared/submit'
import type { ConsultationFormProps } from '../shared/types'
import { ConcernsSelector } from './ConcernsSelector'
import { ContactActions } from './ContactActions'
import styles from './ConsultationForm.module.css'
import { PersonalInfoFields } from './PersonalInfoFields'
import { SkinTypeSelector } from './SkinTypeSelector'
import { SubmitState } from './SubmitState'

const DEFAULT_SUBMIT_SUCCESS_MESSAGE =
  'Richiesta inviata con successo. Ti ricontatteremo entro 24 ore.'
const DEFAULT_SUBMIT_ERROR_MESSAGE =
  'Impossibile inviare la richiesta al momento. Riprova tra poco.'

export function ConsultationForm({
  phoneLink,
  whatsappLink,
  phoneDisplay,
  whatsappDisplay,
  onSubmit,
  submitSuccessMessage = DEFAULT_SUBMIT_SUCCESS_MESSAGE,
  submitErrorMessage = DEFAULT_SUBMIT_ERROR_MESSAGE,
}: ConsultationFormProps) {
  const {
    formData,
    isSubmitting,
    submitStatus,
    setIsSubmitting,
    setSubmitStatus,
    updateField,
    setSkinType,
    toggleConcern,
    resetForm,
  } = useConsultationFormState()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setSubmitStatus('idle')
      await onSubmit?.(toConsultationSubmitPayload(formData))
      setSubmitStatus('success')
      resetForm()
    } catch (error) {
      setSubmitStatus(mapSubmitErrorToStatus(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={styles.wrapper}
    >
      <div className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SectionTitle as="h2" size="h2" className={styles.heroTitle}>
            Skin Analyzer & Consulenza Personalizzata
          </SectionTitle>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionSubtitle className={styles.heroSubtitle}>
            Compila il form per richiedere un&apos;analisi professionale della tua pelle e ricevere
            una consulenza personalizzata con i nostri esperti.
          </SectionSubtitle>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <ContactActions
          phoneLink={phoneLink}
          whatsappLink={whatsappLink}
          phoneDisplay={phoneDisplay}
          whatsappDisplay={whatsappDisplay}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className={styles.divider}
      >
        <div className={styles.dividerLine} />
        <div className={styles.dividerLabelWrap}>
          <span className={`${styles.dividerLabel} typo-small`}>oppure</span>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className={styles.form}
      >
        <PersonalInfoFields formData={formData} onFieldChange={updateField} />
        <SkinTypeSelector selectedSkinType={formData.skinType} onSelectSkinType={setSkinType} />
        <ConcernsSelector selectedConcerns={formData.concerns} onToggleConcern={toggleConcern} />

        <div>
          <SectionTitle as="h4" size="h4" className={styles.sectionTitle}>
            <span className={styles.sectionDot} />
            Note Aggiuntive
          </SectionTitle>
          <Textarea
            value={formData.message}
            onChange={(event) => updateField('message', event.target.value)}
            rows={5}
            className={styles.textarea}
            placeholder="Raccontaci di piu sulle tue esigenze, obiettivi o domande specifiche..."
          />
        </div>

        <div className={styles.submitRow}>
          <Button kind="main" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Invio in corso...' : 'Invia Richiesta di Consulenza'}
          </Button>
        </div>

        <SubmitState
          submitStatus={submitStatus}
          submitSuccessMessage={submitSuccessMessage}
          submitErrorMessage={submitErrorMessage}
        />
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={styles.footer}
      >
        <p className="typo-small">
          Riceverai una risposta entro 24 ore. I tuoi dati saranno trattati in conformita con la
          nostra Privacy Policy.
        </p>
      </motion.div>
    </motion.div>
  )
}
