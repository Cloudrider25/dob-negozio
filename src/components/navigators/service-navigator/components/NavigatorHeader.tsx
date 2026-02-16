'use client'

import { GlassCard } from './GlassCard'
import styles from './NavigatorHeader.module.css'

type NavigatorHeaderProps = {
  activeView: 'navigator' | 'listino' | 'consulenza'
  onViewChange: (view: 'navigator' | 'listino' | 'consulenza') => void
  showActions?: boolean
  showIntro?: boolean
}

export function NavigatorHeader({
  activeView,
  onViewChange,
  showActions = true,
  showIntro = true,
}: NavigatorHeaderProps) {
  return (
    <div className={styles.header}>
      {showIntro ? (
        <>
          <h1 className={styles.title}>
            Scegli il risultato.{' '}
            <span className={styles.titleHighlight}>
              Al resto pensiamo noi.
              <span className={styles.titleUnderline} />
            </span>
          </h1>

          <p className={styles.subtitle}>
            Seleziona l&apos;area, definisci l&apos;obiettivo, scopri il trattamento più adatto.
          </p>
        </>
      ) : null}

      {showActions ? (
      <div className={styles.actions}>
        {/* Service Navigator - Default/Active */}
        <button
          onClick={() => onViewChange('navigator')}
          className={styles.actionButton}
        >
          <GlassCard
            variant="pill"
            className={`${styles.pill} ${
              activeView === 'navigator' ? styles.pillActive : styles.pillInactive
            }`}
            paddingClassName={styles.pillPadding}
          >
            <span
              className={`${styles.pillLabel} ${
                activeView === 'navigator'
                  ? styles.pillLabelActive
                  : styles.pillLabelInactive
              }`}
            >
              Service Navigator
            </span>
          </GlassCard>
        </button>

        {/* Consulenza */}
        <button
          onClick={() => onViewChange('consulenza')}
          className={styles.actionButton}
        >
          <GlassCard
            variant="pill"
            className={`${styles.pill} ${
              activeView === 'consulenza' ? styles.pillActive : styles.pillInactive
            }`}
            paddingClassName={styles.pillPadding}
          >
            <span
              className={`${styles.pillLabel} ${
                activeView === 'consulenza'
                  ? styles.pillLabelActive
                  : styles.pillLabelInactive
              }`}
            >
              Consulenza
            </span>
            {activeView !== 'consulenza' && (
              <span className={styles.pillArrow}>
                →
              </span>
            )}
          </GlassCard>
        </button>

        {/* Tutti i servizi */}
        <button
          onClick={() => onViewChange('listino')}
          className={styles.actionButton}
        >
          <GlassCard
            variant="pill"
            className={`${styles.pill} ${
              activeView === 'listino' ? styles.pillActive : styles.pillInactive
            }`}
            paddingClassName={styles.pillPadding}
          >
            <span
              className={`${styles.pillLabel} ${
                activeView === 'listino' ? styles.pillLabelActive : styles.pillLabelInactive
              }`}
            >
              Tutti i servizi
            </span>
            {activeView !== 'listino' && (
              <span className={styles.pillArrow}>
                →
              </span>
            )}
          </GlassCard>
        </button>
      </div>
      ) : null}
    </div>
  )
}
