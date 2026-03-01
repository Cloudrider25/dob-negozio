import { SectionTitle } from '@/components/sections/SectionTitle'
import { cn } from '@/lib/cn'
import { SKIN_TYPES } from '../shared/config'
import styles from './ConsultationForm.module.css'

type SkinTypeSelectorProps = {
  selectedSkinType: string
  onSelectSkinType: (skinType: string) => void
}

export function SkinTypeSelector({ selectedSkinType, onSelectSkinType }: SkinTypeSelectorProps) {
  return (
    <div>
      <SectionTitle as="h4" size="h4" className={styles.sectionTitle}>
        <span className={styles.sectionDot} />
        Tipo di Pelle *
      </SectionTitle>
      <div className={styles.choiceRow}>
        {SKIN_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelectSkinType(type.id)}
            className={cn(
              styles.choiceButton,
              'typo-small',
              selectedSkinType === type.id ? styles.choiceActive : undefined,
            )}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  )
}
