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
    getCategoriesForNeed,
    getLinesForFilters,
    getTexturesForFilters,
    getProductsForFilters,
    getNeedById,
    getCategoryById,
    getLineById,
    getTextureById,
  } = useShopNavigatorData()

  const needs = getNeeds()

  const getNextStepAfterCategory = (needId: string, categoryId: string) => {
    const lines = getLinesForFilters({ needId, categoryId })
    if (lines.length > 0) return 'line'
    const textures = getTexturesForFilters({ needId, categoryId })
    if (textures.length > 0) return 'texture'
    return 'products'
  }

  const getNextStepAfterLine = (needId: string, categoryId: string, lineId: string) => {
    const textures = getTexturesForFilters({ needId, categoryId, lineId })
    if (textures.length > 0) return 'texture'
    return 'products'
  }

  const handleBack = () => {
    if (state.step === 'products') {
      const textures = state.selectedNeed && state.selectedCategory
        ? getTexturesForFilters({
            needId: state.selectedNeed,
            categoryId: state.selectedCategory,
            lineId: state.selectedLine,
          })
        : []
      if (textures.length > 0) {
        onUpdateState({ step: 'texture', selectedProduct: undefined })
        return
      }

      const lines = state.selectedNeed && state.selectedCategory
        ? getLinesForFilters({
            needId: state.selectedNeed,
            categoryId: state.selectedCategory,
          })
        : []
      if (lines.length > 0) {
        onUpdateState({ step: 'line', selectedProduct: undefined })
        return
      }

      onUpdateState({ step: 'category', selectedProduct: undefined })
      return
    }

    if (state.step === 'texture') {
      const lines = state.selectedNeed && state.selectedCategory
        ? getLinesForFilters({
            needId: state.selectedNeed,
            categoryId: state.selectedCategory,
          })
        : []
      if (lines.length > 0) {
        onUpdateState({ step: 'line', selectedTexture: undefined })
        return
      }

      onUpdateState({ step: 'category', selectedTexture: undefined })
      return
    }

    if (state.step === 'line') {
      onUpdateState({ step: 'category', selectedLine: undefined })
      return
    }

    if (state.step === 'category') {
      onUpdateState({
        step: 'need',
        selectedNeed: undefined,
        selectedCategory: undefined,
        selectedLine: undefined,
        selectedTexture: undefined,
        selectedProduct: undefined,
      })
    }
  }

  const getBreadcrumb = () => {
    const parts: string[] = []
    if (state.selectedNeed) parts.push(getNeedById(state.selectedNeed)?.label || '')
    if (state.selectedCategory) parts.push(getCategoryById(state.selectedCategory)?.label || '')
    if (state.selectedLine) parts.push(getLineById(state.selectedLine)?.label || '')
    if (state.selectedTexture) parts.push(getTextureById(state.selectedTexture)?.label || '')
    return parts.filter(Boolean).join(' → ')
  }

  const categories = state.selectedNeed ? getCategoriesForNeed(state.selectedNeed) : []
  const lines =
    state.selectedNeed && state.selectedCategory
      ? getLinesForFilters({
          needId: state.selectedNeed,
          categoryId: state.selectedCategory,
        })
      : []
  const textures =
    state.selectedNeed && state.selectedCategory
      ? getTexturesForFilters({
          needId: state.selectedNeed,
          categoryId: state.selectedCategory,
          lineId: state.selectedLine,
        })
      : []
  const products = getProductsForFilters({
    needId: state.selectedNeed,
    categoryId: state.selectedCategory,
    lineId: state.selectedLine,
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
              {state.step === 'category' && 'Seleziona Categoria'}
              {state.step === 'line' && 'Seleziona Linea'}
              {state.step === 'texture' && 'Seleziona Texture'}
              {state.step === 'products' && 'Scegli Prodotto'}
            </div>
            {getBreadcrumb() && (
              <div className={styles.breadcrumb}>{getBreadcrumb()}</div>
            )}
          </div>

          <button
            onClick={onClose}
            className={styles.iconButton}
          >
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
                      step: 'category',
                    })
                  }}
                  className={styles.itemButton}
                >
                  <div className={styles.itemTitle}>{need.label}</div>
                  {need.boxTagline && (
                    <div className={styles.itemSubtitle}>{need.boxTagline}</div>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {state.step === 'category' && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.list}
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    if (!state.selectedNeed) return
                    onUpdateState({
                      selectedCategory: category.id,
                      step: getNextStepAfterCategory(state.selectedNeed, category.id),
                    })
                  }}
                  className={styles.itemButton}
                >
                  <div className={styles.itemTitle}>
                    {category.label}
                  </div>
                  {category.boxTagline && (
                    <div className={styles.itemSubtitle}>{category.boxTagline}</div>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {state.step === 'line' && (
            <motion.div
              key="line"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.list}
            >
              {lines.map((line) => (
                <button
                  key={line.id}
                  onClick={() => {
                    if (!state.selectedNeed || !state.selectedCategory) return
                    onUpdateState({
                      selectedLine: line.id,
                      step: getNextStepAfterLine(state.selectedNeed, state.selectedCategory, line.id),
                    })
                  }}
                  className={styles.itemButton}
                >
                  <div className={styles.itemTitle}>{line.label}</div>
                  {line.boxTagline && (
                    <div className={styles.itemSubtitle}>{line.boxTagline}</div>
                  )}
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
                  <div className={styles.itemTitle}>
                    {texture.label}
                  </div>
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
                  <div className={styles.itemTitle}>
                    {product.title}
                  </div>
                  {product.brand && (
                    <div className={styles.itemSubtitle}>{product.brand}</div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
