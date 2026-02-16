'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { ArrowRight, Beaker, Phone, WhatsApp, type IconProps } from '@/components/ui/icons'

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  skinType: string
  concerns: string[]
  message: string
}

type ContactStyleVariant = 'glass-card' | 'plain'

type ConsultationFormStyles = Record<string, string>
type IconComponent = (props: IconProps) => ReactNode

type GlassCardComponent = (props: { paddingClassName?: string; children: ReactNode }) => ReactNode

export type ConsultationFormProps = {
  phoneLink: string
  whatsappLink: string
  phoneDisplay: string
  whatsappDisplay: string
  styles: ConsultationFormStyles
  contactStyleVariant?: ContactStyleVariant
  includeButtonBaseClass?: boolean
  GlassCard?: GlassCardComponent
}

const skinTypes = [
  { id: 'normale', label: 'Normale' },
  { id: 'secca', label: 'Secca' },
  { id: 'grassa', label: 'Grassa' },
  { id: 'mista', label: 'Mista' },
  { id: 'sensibile', label: 'Sensibile' },
]

const skinConcerns = [
  'Acne',
  'Rughe e linee sottili',
  'Macchie e iperpigmentazione',
  'Pelle opaca',
  'Pori dilatati',
  'Rossore e couperose',
  'Perdita di elasticita',
  'Borse e occhiaie',
]

const joinClassNames = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(' ')

export function ConsultationForm({
  phoneLink,
  whatsappLink,
  phoneDisplay,
  whatsappDisplay,
  styles,
  contactStyleVariant = 'plain',
  includeButtonBaseClass = false,
  GlassCard,
}: ConsultationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skinType: '',
    concerns: [],
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Collegare con sistema backend
    console.log('Form submitted:', formData)
    alert(
      `Richiesta di consulenza inviata!\n\nNome: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nTipo di pelle: ${formData.skinType}\nPreoccupazioni: ${formData.concerns.join(', ')}`,
    )
  }

  const toggleConcern = (concern: string) => {
    setFormData((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }))
  }

  const renderContactButton = ({
    href,
    label,
    value,
    iconClassName,
    Icon,
    external = false,
  }: {
    href: string
    label: string
    value: string
    iconClassName: string
    Icon: IconComponent
    external?: boolean
  }) => {
    const buttonContent = (
      <>
        <div className={styles.contactIconWrap}>
          <Icon className={iconClassName} />
        </div>
        <div className={styles.contactText}>
          <div className={styles.contactLabel}>{label}</div>
          <div className={styles.contactValue}>{value}</div>
        </div>
      </>
    )

    if (contactStyleVariant === 'glass-card' && GlassCard) {
      return (
        <a
          href={href}
          className={styles.contactLink}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {GlassCard({ paddingClassName: styles.contactButton, children: buttonContent })}
        </a>
      )
    }

    return (
      <a
        href={href}
        className={styles.contactButton}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {buttonContent}
      </a>
    )
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
          transition={{ delay: 0.1 }}
          className={styles.heroBadge}
        >
          <Beaker className={styles.heroIcon} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={styles.heroTitle}
        >
          Skin Analyzer & Consulenza Personalizzata
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles.heroSubtitle}
        >
          Compila il form per richiedere un&apos;analisi professionale della tua pelle e ricevere
          una consulenza personalizzata con i nostri esperti.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={styles.contactRow}
      >
        {renderContactButton({
          href: phoneLink,
          label: 'Chiamaci',
          value: phoneDisplay,
          iconClassName: styles.contactIcon,
          Icon: Phone,
        })}
        {renderContactButton({
          href: whatsappLink,
          label: 'Scrivici su',
          value: whatsappDisplay,
          iconClassName: styles.contactIconWhatsapp,
          external: true,
          Icon: WhatsApp,
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className={styles.divider}
      >
        <div className={styles.dividerLine} />
        <div className={styles.dividerLabelWrap}>
          <span className={styles.dividerLabel}>oppure</span>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className={styles.form}
      >
        <div>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionDot} />
            Informazioni Personali
          </h3>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>Nome *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={styles.input}
                placeholder="Il tuo nome"
              />
            </div>
            <div>
              <label className={styles.label}>Cognome *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={styles.input}
                placeholder="Il tuo cognome"
              />
            </div>
            <div>
              <label className={styles.label}>Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={styles.input}
                placeholder="email@esempio.com"
              />
            </div>
            <div>
              <label className={styles.label}>Telefono *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={styles.input}
                placeholder="+39 123 456 7890"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionDot} />
            Tipo di Pelle *
          </h3>
          <div className={styles.choiceRow}>
            {skinTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, skinType: type.id })}
                className={joinClassNames(
                  styles.choiceButton,
                  formData.skinType === type.id ? styles.choiceActive : undefined,
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionDot} />
            Preoccupazioni della Pelle
          </h3>
          <p className={styles.heroSubtitle}>Seleziona una o piu problematiche (opzionale)</p>
          <div className={styles.pillRow}>
            {skinConcerns.map((concern) => (
              <button
                key={concern}
                type="button"
                onClick={() => toggleConcern(concern)}
                className={joinClassNames(
                  styles.pill,
                  formData.concerns.includes(concern) ? styles.pillActive : undefined,
                )}
              >
                {concern}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionDot} />
            Note Aggiuntive
          </h3>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={5}
            className={styles.textarea}
            placeholder="Raccontaci di piu sulle tue esigenze, obiettivi o domande specifiche..."
          />
        </div>

        <div className={styles.submitRow}>
          <button
            type="submit"
            className={joinClassNames(includeButtonBaseClass ? 'button-base' : undefined, styles.submitButton)}
          >
            <span className={styles.submitContent}>
              Invia Richiesta di Consulenza
              <ArrowRight className={styles.submitIcon} />
            </span>
            <span className={styles.submitGlow} />
          </button>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={styles.footer}
      >
        <p>
          Riceverai una risposta entro 24 ore. I tuoi dati saranno trattati in conformita con la
          nostra Privacy Policy.
        </p>
      </motion.div>
    </motion.div>
  )
}
