'use client'

import { useMemo, useRef, useState } from 'react'

import { Button } from '@/frontend/components/ui/primitives/button'
import { Input, Select, Textarea } from '@/frontend/components/ui/primitives/input'
import { Label } from '@/frontend/components/ui/primitives/label'
import { submitContactRequest } from '@/lib/frontend/contact/submitContactRequest'
import type { Locale } from '@/lib/i18n/core'
import styles from './ContactRequestForm.module.css'

type ContactReason = 'general' | 'booking' | 'order-support' | 'partnership'

type ContactRequestFormProps = {
  locale: Locale
}

type ContactRequestFormState = {
  firstName: string
  lastName: string
  email: string
  contactReason: ContactReason
  topic: string
  message: string
}

type SubmitStatus = 'idle' | 'success' | 'error'
const MAX_ATTACHMENTS = 10
const MAX_TOTAL_BYTES = 50 * 1024 * 1024

const copyByLocale: Record<
  Locale,
  {
    eyebrow: string
    title: string
    requiredNote: string
    firstName: string
    lastName: string
    email: string
    contactReason: string
    topic: string
    message: string
    submit: string
    submitting: string
    success: string
    error: string
    attachmentsLabel: string
    attachmentsHint: string
    uploadCta: string
    uploadDrop: string
    uploadInvalid: string
    uploadTooMany: string
    uploadTooLarge: string
    remove: string
    reasons: Array<{ value: ContactReason; label: string }>
  }
> = {
  it: {
    eyebrow: 'Contattaci',
    title: 'Scrivici',
    requiredNote: '* indicates a required field',
    firstName: 'Nome',
    lastName: 'Cognome',
    email: 'Email',
    contactReason: 'Motivo del contatto',
    topic: 'Argomento',
    message: 'Raccontaci i dettagli',
    submit: 'Invia messaggio',
    submitting: 'Invio in corso...',
    success: 'Messaggio inviato con successo. Ti ricontatteremo presto.',
    error: 'Impossibile inviare il messaggio al momento. Riprova tra poco.',
    attachmentsLabel: 'Allegati',
    attachmentsHint: '(Optional: 10 files max, total file size must be less than 50MB)',
    uploadCta: 'Upload',
    uploadDrop: 'Drag or paste image here',
    uploadInvalid: 'Puoi allegare solo immagini.',
    uploadTooMany: 'Puoi allegare massimo 10 file.',
    uploadTooLarge: 'La dimensione totale degli allegati deve restare sotto 50MB.',
    remove: 'Rimuovi',
    reasons: [
      { value: 'general', label: 'Informazioni generali' },
      { value: 'booking', label: 'Prenotazioni' },
      { value: 'order-support', label: 'Supporto ordini' },
      { value: 'partnership', label: 'Collaborazioni' },
    ],
  },
  en: {
    eyebrow: 'Contact',
    title: 'Get in touch',
    requiredNote: '* indicates a required field',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    contactReason: 'Contact reason',
    topic: 'Topic',
    message: 'Tell us the details',
    submit: 'Send message',
    submitting: 'Sending...',
    success: 'Message sent successfully. We will get back to you soon.',
    error: 'Unable to send your message right now. Please try again shortly.',
    attachmentsLabel: 'Attachments',
    attachmentsHint: '(Optional: 10 files max, total file size must be less than 50MB)',
    uploadCta: 'Upload',
    uploadDrop: 'Drag or paste image here',
    uploadInvalid: 'Only image attachments are allowed.',
    uploadTooMany: 'You can attach up to 10 files.',
    uploadTooLarge: 'Total attachment size must be less than 50MB.',
    remove: 'Remove',
    reasons: [
      { value: 'general', label: 'General information' },
      { value: 'booking', label: 'Bookings' },
      { value: 'order-support', label: 'Order support' },
      { value: 'partnership', label: 'Partnerships' },
    ],
  },
  ru: {
    eyebrow: 'Контакты',
    title: 'Свяжитесь с нами',
    requiredNote: '* indicates a required field',
    firstName: 'Имя',
    lastName: 'Фамилия',
    email: 'Email',
    contactReason: 'Причина обращения',
    topic: 'Тема',
    message: 'Расскажите подробнее',
    submit: 'Отправить сообщение',
    submitting: 'Отправка...',
    success: 'Сообщение отправлено. Мы скоро свяжемся с вами.',
    error: 'Сейчас не удалось отправить сообщение. Попробуйте позже.',
    attachmentsLabel: 'Вложения',
    attachmentsHint: '(Optional: 10 files max, total file size must be less than 50MB)',
    uploadCta: 'Upload',
    uploadDrop: 'Drag or paste image here',
    uploadInvalid: 'Допустимы только изображения.',
    uploadTooMany: 'Можно прикрепить не более 10 файлов.',
    uploadTooLarge: 'Общий размер вложений должен быть меньше 50MB.',
    remove: 'Удалить',
    reasons: [
      { value: 'general', label: 'Общая информация' },
      { value: 'booking', label: 'Бронирование' },
      { value: 'order-support', label: 'Поддержка заказов' },
      { value: 'partnership', label: 'Сотрудничество' },
    ],
  },
}

const INITIAL_STATE: ContactRequestFormState = {
  firstName: '',
  lastName: '',
  email: '',
  contactReason: 'general',
  topic: '',
  message: '',
}

export function ContactRequestForm({ locale }: ContactRequestFormProps) {
  const copy = copyByLocale[locale]
  const [formData, setFormData] = useState<ContactRequestFormState>(INITIAL_STATE)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const totalAttachmentBytes = useMemo(
    () => attachments.reduce((sum, file) => sum + file.size, 0),
    [attachments],
  )

  const updateField = <Field extends keyof ContactRequestFormState>(
    field: Field,
    value: ContactRequestFormState[Field],
  ) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const applyAttachments = (nextFiles: File[]) => {
    const imageFiles = nextFiles.filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length !== nextFiles.length) {
      setAttachmentError(copy.uploadInvalid)
      return
    }

    if (nextFiles.length > MAX_ATTACHMENTS) {
      setAttachmentError(copy.uploadTooMany)
      return
    }

    const totalBytes = nextFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalBytes > MAX_TOTAL_BYTES) {
      setAttachmentError(copy.uploadTooLarge)
      return
    }

    setAttachments(nextFiles)
    setAttachmentError(null)
  }

  const appendFiles = (incomingFiles: File[]) => {
    const deduped = [...attachments]
    for (const file of incomingFiles) {
      if (!deduped.some((existing) => existing.name === file.name && existing.size === file.size)) {
        deduped.push(file)
      }
    }

    applyAttachments(deduped)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setSubmitStatus('idle')
      await submitContactRequest({
        ...formData,
        attachments,
      })
      setFormData(INITIAL_STATE)
      setAttachments([])
      setAttachmentError(null)
      setSubmitStatus('success')
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openFilePicker = () => fileInputRef.current?.click()

  const removeAttachment = (targetIndex: number) => {
    setAttachments((current) => current.filter((_, index) => index !== targetIndex))
    setAttachmentError(null)
  }

  const formatSize = (size: number) => {
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${Math.ceil(size / 1024)} KB`
  }

  return (
    <section className={styles.wrapper}>
      <p className={`${styles.eyebrow} typo-caption-upper`}>{copy.eyebrow}</p>
      <h2 className={`${styles.title} typo-h3`}>{copy.title}</h2>
      <p className={`${styles.requiredNote} typo-small`}>{copy.requiredNote}</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <Label className={styles.label} variant="field" required>
              {copy.firstName}
            </Label>
            <Input
              className={styles.input}
              type="text"
              required
              value={formData.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <Label className={styles.label} variant="field" required>
              {copy.lastName}
            </Label>
            <Input
              className={styles.input}
              type="text"
              required
              value={formData.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
            />
          </div>

          <div className={styles.fieldFull}>
            <Label className={styles.label} variant="field" required>
              {copy.email}
            </Label>
            <Input
              className={styles.input}
              type="email"
              required
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <Label className={styles.label} variant="field" required>
              {copy.contactReason}
            </Label>
            <Select
              className={styles.input}
              required
              value={formData.contactReason}
              onChange={(event) => updateField('contactReason', event.target.value as ContactReason)}
            >
              {copy.reasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </Select>
          </div>

          <div className={styles.field}>
            <Label className={styles.label} variant="field" required>
              {copy.topic}
            </Label>
            <Input
              className={styles.input}
              type="text"
              required
              value={formData.topic}
              onChange={(event) => updateField('topic', event.target.value)}
            />
          </div>

          <div className={styles.fieldFull}>
            <Label className={styles.label} variant="field" required>
              {copy.message}
            </Label>
            <Textarea
              className={styles.textarea}
              required
              value={formData.message}
              onChange={(event) => updateField('message', event.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className={styles.label} variant="field">
            {copy.attachmentsLabel}
          </Label>
          <p className={`${styles.uploadMeta} typo-small`}>{copy.attachmentsHint}</p>
          <div
            className={`${styles.uploadArea} ${isDragActive ? styles.uploadAreaActive : ''}`}
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openFilePicker()
              }
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragActive(true)
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragActive(false)
              appendFiles(Array.from(event.dataTransfer.files))
            }}
            onPaste={(event) => {
              appendFiles(Array.from(event.clipboardData.files))
            }}
          >
            <div className={styles.uploadAreaLeft}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.uploadIcon}>
                <path
                  d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="m7.5 16.5 3.5-4 2.5 2.5 2-2 1.5 1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="15.75" cy="8.25" r="1.75" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <div className={styles.uploadCopy}>
                <p className={`${styles.uploadTitle} typo-body-lg`}>{copy.uploadDrop}</p>
                <p className={`${styles.uploadHint} typo-small`}>
                  {attachments.length > 0
                    ? `${attachments.length}/${MAX_ATTACHMENTS} files · ${formatSize(totalAttachmentBytes)}`
                    : copy.attachmentsHint}
                </p>
              </div>
            </div>

            <span className={`${styles.uploadButton} typo-body`}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.uploadButtonIcon}>
                <path
                  d="M12 16V5m0 0-3.5 3.5M12 5l3.5 3.5M5 15.5V18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {copy.uploadCta}
            </span>
            <input
              ref={fileInputRef}
              className={styles.hiddenInput}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => appendFiles(Array.from(event.target.files ?? []))}
            />
          </div>
          {attachmentError ? <p className={`${styles.submitError} typo-small`}>{attachmentError}</p> : null}
          {attachments.length > 0 ? (
            <ul className={styles.fileList}>
              {attachments.map((file, index) => (
                <li key={`${file.name}-${file.size}-${index}`} className={styles.fileItem}>
                  <span className={`${styles.fileName} typo-small`}>{file.name}</span>
                  <span className={`${styles.fileMeta} typo-small`}>{formatSize(file.size)}</span>
                  <button
                    type="button"
                    className={`${styles.removeButton} typo-small-upper`}
                    onClick={() => removeAttachment(index)}
                  >
                    {copy.remove}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className={styles.submitRow}>
          <Button kind="main" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? copy.submitting : copy.submit}
          </Button>
          {submitStatus === 'success' ? (
            <p className={`${styles.submitSuccess} typo-small`}>{copy.success}</p>
          ) : null}
          {submitStatus === 'error' ? (
            <p className={`${styles.submitError} typo-small`}>{copy.error}</p>
          ) : null}
        </div>
      </form>
    </section>
  )
}
