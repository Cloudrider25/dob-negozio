'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { NavigatorState } from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { ChevronLeft, X } from '@/components/shop-navigator/icons'

interface MobileFlowProps {
  state: NavigatorState
  onUpdateState: (updates: Partial<NavigatorState>) => void
  onClose: () => void
}

export function MobileFlow({ state, onUpdateState, onClose }: MobileFlowProps) {
  const {
    getNeeds,
    getCategoriesForNeed,
    getRoutineStepsForFilters,
    getLinesForFilters,
    getTexturesForFilters,
    getProductsForFilters,
    getNeedById,
    getCategoryById,
    getRoutineStepById,
    getLineById,
    getTextureById,
  } = useShopNavigatorData()

  const needs = getNeeds()

  const getNextStepAfterCategory = (needId: string, categoryId: string) => {
    const routines = getRoutineStepsForFilters({ needId, categoryId })
    if (routines.length > 0) return 'routine'
    const lines = getLinesForFilters({ needId, categoryId })
    if (lines.length > 0) return 'line'
    const textures = getTexturesForFilters({ needId, categoryId })
    if (textures.length > 0) return 'texture'
    return 'products'
  }

  const getNextStepAfterRoutine = (needId: string, categoryId: string, routineStepId: string) => {
    const lines = getLinesForFilters({ needId, categoryId, routineStepId })
    if (lines.length > 0) return 'line'
    const textures = getTexturesForFilters({ needId, categoryId, routineStepId })
    if (textures.length > 0) return 'texture'
    return 'products'
  }

  const getNextStepAfterLine = (
    needId: string,
    categoryId: string,
    routineStepId: string | undefined,
    lineId: string,
  ) => {
    const textures = getTexturesForFilters({ needId, categoryId, routineStepId, lineId })
    if (textures.length > 0) return 'texture'
    return 'products'
  }

  const handleBack = () => {
    if (state.step === 'products') {
      const textures = state.selectedNeed && state.selectedCategory
        ? getTexturesForFilters({
            needId: state.selectedNeed,
            categoryId: state.selectedCategory,
            routineStepId: state.selectedRoutineStep,
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
            routineStepId: state.selectedRoutineStep,
          })
        : []
      if (lines.length > 0) {
        onUpdateState({ step: 'line', selectedProduct: undefined })
        return
      }

      const routines = state.selectedNeed && state.selectedCategory
        ? getRoutineStepsForFilters({ needId: state.selectedNeed, categoryId: state.selectedCategory })
        : []
      if (routines.length > 0) {
        onUpdateState({ step: 'routine', selectedProduct: undefined })
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
            routineStepId: state.selectedRoutineStep,
          })
        : []
      if (lines.length > 0) {
        onUpdateState({ step: 'line', selectedTexture: undefined })
        return
      }

      const routines = state.selectedNeed && state.selectedCategory
        ? getRoutineStepsForFilters({ needId: state.selectedNeed, categoryId: state.selectedCategory })
        : []
      if (routines.length > 0) {
        onUpdateState({ step: 'routine', selectedTexture: undefined })
        return
      }

      onUpdateState({ step: 'category', selectedTexture: undefined })
      return
    }

    if (state.step === 'line') {
      const routines = state.selectedNeed && state.selectedCategory
        ? getRoutineStepsForFilters({ needId: state.selectedNeed, categoryId: state.selectedCategory })
        : []
      if (routines.length > 0) {
        onUpdateState({ step: 'routine', selectedLine: undefined })
        return
      }
      onUpdateState({ step: 'category', selectedLine: undefined })
      return
    }

    if (state.step === 'routine') {
      onUpdateState({ step: 'category', selectedRoutineStep: undefined })
      return
    }

    if (state.step === 'category') {
      onUpdateState({
        step: 'need',
        selectedNeed: undefined,
        selectedCategory: undefined,
        selectedRoutineStep: undefined,
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
    if (state.selectedRoutineStep)
      parts.push(getRoutineStepById(state.selectedRoutineStep)?.label || '')
    if (state.selectedLine) parts.push(getLineById(state.selectedLine)?.label || '')
    if (state.selectedTexture) parts.push(getTextureById(state.selectedTexture)?.label || '')
    return parts.filter(Boolean).join(' → ')
  }

  const categories = state.selectedNeed ? getCategoriesForNeed(state.selectedNeed) : []
  const routines =
    state.selectedNeed && state.selectedCategory
      ? getRoutineStepsForFilters({ needId: state.selectedNeed, categoryId: state.selectedCategory })
      : []
  const lines =
    state.selectedNeed && state.selectedCategory
      ? getLinesForFilters({
          needId: state.selectedNeed,
          categoryId: state.selectedCategory,
          routineStepId: state.selectedRoutineStep,
        })
      : []
  const textures =
    state.selectedNeed && state.selectedCategory
      ? getTexturesForFilters({
          needId: state.selectedNeed,
          categoryId: state.selectedCategory,
          routineStepId: state.selectedRoutineStep,
          lineId: state.selectedLine,
        })
      : []
  const products = getProductsForFilters({
    needId: state.selectedNeed,
    categoryId: state.selectedCategory,
    routineStepId: state.selectedRoutineStep,
    lineId: state.selectedLine,
    textureId: state.selectedTexture,
  })

  return (
    <div className="fixed inset-0 bg-bg z-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-bg-2 backdrop-blur-lg border-b border-stroke">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            disabled={state.step === 'need'}
          >
            {state.step !== 'need' && <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex-1 text-center">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">
              {state.step === 'need' && 'Seleziona Esigenza'}
              {state.step === 'category' && 'Seleziona Categoria'}
              {state.step === 'routine' && 'Seleziona Routine'}
              {state.step === 'line' && 'Seleziona Linea'}
              {state.step === 'texture' && 'Seleziona Texture'}
              {state.step === 'products' && 'Scegli Prodotto'}
            </div>
            {getBreadcrumb() && (
              <div className="text-xs text-text-secondary capitalize">{getBreadcrumb()}</div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {state.step === 'need' && (
            <motion.div
              key="need"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
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
                  className="w-full p-5 rounded-lg border border-stroke transition-all duration-300 text-left"
                >
                  <div className="text-lg font-medium text-text-primary mb-1">{need.label}</div>
                  {need.boxTagline && (
                    <div className="text-sm text-text-muted">{need.boxTagline}</div>
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
              className="space-y-3"
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
                  className="w-full p-5 rounded-lg border border-stroke transition-all duration-300 text-left"
                >
                  <div className="text-lg font-medium text-text-primary mb-1">
                    {category.label}
                  </div>
                  {category.boxTagline && (
                    <div className="text-sm text-text-muted">{category.boxTagline}</div>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {state.step === 'routine' && (
            <motion.div
              key="routine"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {routines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => {
                    if (!state.selectedNeed || !state.selectedCategory) return
                    onUpdateState({
                      selectedRoutineStep: routine.id,
                      step: getNextStepAfterRoutine(
                        state.selectedNeed,
                        state.selectedCategory,
                        routine.id,
                      ),
                    })
                  }}
                  className="w-full p-5 rounded-lg border border-stroke transition-all duration-300 text-left"
                >
                  <div className="text-lg font-medium text-text-primary mb-1">
                    {routine.label}
                  </div>
                  {routine.boxTagline && (
                    <div className="text-sm text-text-muted">{routine.boxTagline}</div>
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
              className="space-y-3"
            >
              {lines.map((line) => (
                <button
                  key={line.id}
                  onClick={() => {
                    if (!state.selectedNeed || !state.selectedCategory) return
                    onUpdateState({
                      selectedLine: line.id,
                      step: getNextStepAfterLine(
                        state.selectedNeed,
                        state.selectedCategory,
                        state.selectedRoutineStep,
                        line.id,
                      ),
                    })
                  }}
                  className="w-full p-5 rounded-lg border border-stroke transition-all duration-300 text-left"
                >
                  <div className="text-lg font-medium text-text-primary mb-1">{line.label}</div>
                  {line.boxTagline && (
                    <div className="text-sm text-text-muted">{line.boxTagline}</div>
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
              className="space-y-3"
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
                  className="w-full p-5 rounded-lg border border-stroke transition-all duration-300 text-left"
                >
                  <div className="text-lg font-medium text-text-primary mb-1">
                    {texture.label}
                  </div>
                  {texture.boxTagline && (
                    <div className="text-sm text-text-muted">{texture.boxTagline}</div>
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
              className="space-y-3 pb-20"
            >
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onUpdateState({ selectedProduct: product })}
                  className="w-full p-5 rounded-lg border border-stroke transition-all duration-300 text-left"
                >
                  <div className="text-lg font-medium text-text-primary mb-1">
                    {product.title}
                  </div>
                  {product.brand && (
                    <div className="text-sm text-text-muted">{product.brand}</div>
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
