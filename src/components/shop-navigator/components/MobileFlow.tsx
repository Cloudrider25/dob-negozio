'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { NavigatorState } from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { ChevronLeft, X } from '@/components/shop-navigator/icons'
import styles from './MobileFlow.module.css'

interface MobileFlowProps {
  state: NavigatorState
  onUpdateState: (updates: Partial<NavigatorState>) => void
  onClose: () => void
}

export function MobileFlow({ state, onUpdateState, onClose }: MobileFlowProps) {
  const {
    getNeeds,
    getTexturesForFilters,
    getProductsForFilters,
    getNeedById,
    getTextureById,
  } = useShopNavigatorData()

  const needs = getNeeds()

  const getNextStepAfterNeed = (needId: string) => {
    const textures = getTexturesForFilters({ needId })
    if (textures.length > 0) return 'texture'
    return 'products'
  }

  const handleBack = () => {
    if (state.step === 'products') {
      const textures = state.selectedNeed
        ? getTexturesForFilters({ needId: state.selectedNeed })
        : []
      if (textures.length > 0) {
        onUpdateState({ step: 'texture', selectedProduct: undefined })
        return
      }

      onUpdateState({ step: 'need', selectedProduct: undefined })
      return
    }

    if (state.step === 'texture') {
      onUpdateState({ step: 'need', selectedTexture: undefined })
    }
  }

  const getBreadcrumb = () => {
    const parts: string[] = []
    if (state.selectedNeed) parts.push(getNeedById(state.selectedNeed)?.label || '')
    if (state.selectedTexture) parts.push(getTextureById(state.selectedTexture)?.label || '')
    return parts.filter(Boolean).join(' → ')
  }

  const textures = state.selectedNeed
    ? getTexturesForFilters({ needId: state.selectedNeed })
    : []
  const products = getProductsForFilters({
    needId: state.selectedNeed,
    textureId: state.selectedTexture,
  })

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <button
            onClick={handleBack}
            className={styles.iconButton}
            disabled={state.step === 'need'}
          >
            {state.step !== 'need' && <ChevronLeft className={styles.icon} />}
          </button>

          <div className={styles.headerTitle}>
            <div className={styles.stepLabel}>
              {state.step === 'need' && 'Seleziona Esigenza'}
              {state.step === 'texture' && 'Seleziona Texture'}
              {state.step === 'products' && 'Scegli Prodotto'}
            </div>
            {getBreadcrumb() && <div className={styles.breadcrumb}>{getBreadcrumb()}</div>}
          </div>

          <button onClick={onClose} className={styles.iconButton}>
            <X className={styles.icon} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {state.step === 'need' && (
            <motion.div
              key="need"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.list}
            >
              {needs.map((need) => (
                <button
                  key={need.id}
                  onClick={() => {
                    onUpdateState({
                      selectedNeed: need.id,
                      step: getNextStepAfterNeed(need.id),
                    })
                  }}
                  className={styles.itemButton}
                >
                  <div className={styles.itemTitle}>{need.label}</div>
                  {need.boxTagline && <div className={styles.itemSubtitle}>{need.boxTagline}</div>}
                </button>
              ))}
            </motion.div>
          )}

          {state.step === 'texture' && (
            <motion.div
              key="texture"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.list}
            >
              {textures.map((texture) => (
                <button
                  key={texture.id}
                  onClick={() => {
                    onUpdateState({
                      selectedTexture: texture.id,
                      step: 'products',
                    })
                  }}
                  className={styles.itemButton}
                >
                  <div className={styles.itemTitle}>{texture.label}</div>
                  {texture.boxTagline && (
                    <div className={styles.itemSubtitle}>{texture.boxTagline}</div>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {state.step === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.listWithBottom}
            >
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onUpdateState({ selectedProduct: product })}
                  className={styles.itemButton}
                >
                  <div className={styles.itemTitle}>{product.title}</div>
                  {product.brand && <div className={styles.itemSubtitle}>{product.brand}</div>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
