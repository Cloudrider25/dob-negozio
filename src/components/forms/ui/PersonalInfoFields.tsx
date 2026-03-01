import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionTitle } from '@/components/sections/SectionTitle'
import type { ConsultationFormState } from '../shared/types'
import styles from './ConsultationForm.module.css'

type PersonalInfoFieldsProps = {
  formData: ConsultationFormState
  onFieldChange: (field: keyof ConsultationFormState, value: string) => void
}

type PersonalInfoFieldKey = 'firstName' | 'lastName' | 'email' | 'phone'

type FieldConfig = {
  key: PersonalInfoFieldKey
  label: string
  type: 'text' | 'email' | 'tel'
  placeholder: string
}

const FIELDS: FieldConfig[] = [
  { key: 'firstName', label: 'Nome', type: 'text', placeholder: 'Il tuo nome' },
  { key: 'lastName', label: 'Cognome', type: 'text', placeholder: 'Il tuo cognome' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'email@esempio.com' },
  { key: 'phone', label: 'Telefono', type: 'tel', placeholder: '+39 123 456 7890' },
]

export function PersonalInfoFields({ formData, onFieldChange }: PersonalInfoFieldsProps) {
  return (
    <div>
      <SectionTitle as="h4" size="h4" className={styles.sectionTitle}>
        <span className={styles.sectionDot} />
        Informazioni Personali
      </SectionTitle>
      <div className={styles.formGrid}>
        {FIELDS.map((field) => (
          <div key={field.key}>
            <Label className={styles.label} variant="field" required>
              {field.label}
            </Label>
            <Input
              type={field.type}
              required
              value={formData[field.key]}
              onChange={(event) => onFieldChange(field.key, event.target.value)}
              className={styles.input}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
