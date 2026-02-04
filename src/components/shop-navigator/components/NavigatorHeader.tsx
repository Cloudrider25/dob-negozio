'use client'

import styles from './NavigatorHeader.module.css'

type NavigatorHeaderProps = {
  activeView: 'navigator' | 'classic'
  onViewChange: (view: 'navigator' | 'classic') => void
}

export function ShopNavigatorHeader({ activeView, onViewChange }: NavigatorHeaderProps) {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        Trova il prodotto giusto.{' '}
        <span className={styles.titleEmphasis}>
          Inizia dal bisogno.
          <span className={styles.titleUnderline} />
        </span>
      </h1>

      <p className={styles.subtitle}>
        Seleziona esigenze, categorie e dettagli per arrivare al prodotto più adatto.
      </p>

      <div className={styles.actions}>
        <button
          onClick={() => onViewChange('navigator')}
          className={`${styles.toggleButton} ${
            activeView === 'navigator' ? styles.toggleActive : ''
          }`}
        >
          <span>Shop Navigator</span>
        </button>

        <button
          onClick={() => onViewChange('classic')}
          className={`${styles.toggleButton} ${
            activeView === 'classic' ? styles.toggleActive : ''
          }`}
        >
          <span>Shop Classico</span>
          {activeView !== 'classic' && (
            <span className={styles.toggleArrow}>
              →
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
