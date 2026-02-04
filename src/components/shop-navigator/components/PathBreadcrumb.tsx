'use client'

import { motion } from 'framer-motion'
import type { NavigatorState, Step } from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { ChevronLeft } from '@/components/shop-navigator/icons'
import styles from './PathBreadcrumb.module.css'

interface PathBreadcrumbProps {
  state: NavigatorState
  onNavigateToStep: (step: Step) => void
  onBack: () => void
}

export function PathBreadcrumb({ state, onNavigateToStep, onBack }: PathBreadcrumbProps) {
  const {
    getNeedById,
    getCategoryById,
    getLineById,
    getTextureById,
  } = useShopNavigatorData()

  const {
    selectedNeed,
    selectedCategory,
    selectedLine,
    selectedTexture,
  } = state

  const nodes: { label: string; step: Step }[] = []

  if (selectedNeed) {
    nodes.push({ label: getNeedById(selectedNeed)?.label || selectedNeed, step: 'need' })
  }
  if (selectedCategory) {
    nodes.push({
      label: getCategoryById(selectedCategory)?.label || selectedCategory,
      step: 'category',
    })
  }
  if (selectedLine) {
    nodes.push({ label: getLineById(selectedLine)?.label || selectedLine, step: 'line' })
  }
  if (selectedTexture) {
    nodes.push({
      label: getTextureById(selectedTexture)?.label || selectedTexture,
      step: 'texture',
    })
  }

  const getGuideMessage = () => {
    if (!selectedNeed) return 'Seleziona un’esigenza per iniziare'
    if (!selectedCategory) return 'Scegli una categoria'
    if (!selectedLine) return 'Seleziona una linea'
    if (!selectedTexture) return 'Scegli una texture'
    return ''
  }

  const guideMessage = getGuideMessage()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.breadcrumb}
    >
      {nodes.length > 0 ? (
        <div className={styles.fullWidth}>
          <div className={styles.row}>
            <button
              onClick={onBack}
              className={styles.backButton}
            >
              <ChevronLeft className={styles.icon} />
              <span className={styles.backLabel}>Indietro</span>
            </button>

            <div className={styles.separator} />

            {nodes.map((node, index) => (
              <div key={node.step} className={styles.nodeRow}>
                <button
                  onClick={() => onNavigateToStep(node.step)}
                  className={styles.nodeButton}
                >
                  <div className={styles.nodeDot} />
                  <span className={styles.nodeLabel}>{node.label}</span>
                </button>

                {index < nodes.length - 1 && (
                  <div className={styles.separator} />
                )}
              </div>
            ))}

            {guideMessage !== '' && (
              <>
                <div className={styles.separator} />
                <span className={styles.guide}>{guideMessage}</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <p className={styles.guide}>{guideMessage}</p>
        </div>
      )}
    </motion.div>
  )
}
