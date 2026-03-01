import { SectionSubtitle } from '@/components/sections/SectionSubtitle'
import { SectionTitle } from '@/components/sections/SectionTitle'
import { cn } from '@/lib/cn'
import { SKIN_CONCERNS } from '../shared/config'
import styles from './ConsultationForm.module.css'

type ConcernsSelectorProps = {
  selectedConcerns: string[]
  onToggleConcern: (concern: string) => void
}

export function ConcernsSelector({ selectedConcerns, onToggleConcern }: ConcernsSelectorProps) {
  return (
    <div>
      <SectionTitle as="h4" size="h4" className={styles.sectionTitle}>
        <span className={styles.sectionDot} />
        Preoccupazioni della Pelle
      </SectionTitle>
      <SectionSubtitle className={styles.sectionHint}>
        Seleziona una o piu problematiche (opzionale)
      </SectionSubtitle>
      <div className={styles.pillRow}>
        {SKIN_CONCERNS.map((concern) => (
          <button
            key={concern}
            type="button"
            onClick={() => onToggleConcern(concern)}
            className={cn(
              styles.pill,
              'typo-caption',
              selectedConcerns.includes(concern) ? styles.pillActive : undefined,
            )}
          >
            {concern}
          </button>
        ))}
      </div>
    </div>
  )
}
