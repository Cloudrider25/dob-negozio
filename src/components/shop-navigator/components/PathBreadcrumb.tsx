'use client'

import { motion } from 'framer-motion'
import type { NavigatorState, Step } from '@/components/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import { ChevronLeft } from '@/components/shop-navigator/icons'

interface PathBreadcrumbProps {
  state: NavigatorState
  onNavigateToStep: (step: Step) => void
  onBack: () => void
}

export function PathBreadcrumb({ state, onNavigateToStep, onBack }: PathBreadcrumbProps) {
  const {
    getNeedById,
    getCategoryById,
    getRoutineStepById,
    getLineById,
    getTextureById,
    getRoutineStepsForFilters,
  } = useShopNavigatorData()

  const {
    selectedNeed,
    selectedCategory,
    selectedRoutineStep,
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
  if (selectedRoutineStep) {
    nodes.push({
      label: getRoutineStepById(selectedRoutineStep)?.label || selectedRoutineStep,
      step: 'routine',
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
    const hasRoutine =
      getRoutineStepsForFilters({ needId: selectedNeed, categoryId: selectedCategory }).length > 0
    if (!selectedRoutineStep && hasRoutine) return 'Seleziona lo step della routine'
    if (!selectedLine) return 'Seleziona una linea'
    if (!selectedTexture) return 'Scegli una texture'
    return ''
  }

  const guideMessage = getGuideMessage()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 rounded-lg border border-stroke shadow-soft backdrop-blur-sm min-h-[88px] flex items-center"
    >
      {nodes.length > 0 ? (
        <div className="w-full">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4 text-accent-cyan" />
              <span className="text-sm text-text-primary">Indietro</span>
            </button>

            <div className="w-8 h-[2px] bg-gradient-to-r from-cyan-500/50 to-cyan-500/20" />

            {nodes.map((node, index) => (
              <div key={node.step} className="flex items-center gap-3">
                <button
                  onClick={() => onNavigateToStep(node.step)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_color-mix(in_srgb,var(--tech-cyan)_60%,transparent)]" />
                  <span className="text-sm text-text-primary capitalize">{node.label}</span>
                </button>

                {index < nodes.length - 1 && (
                  <div className="w-8 h-[2px] bg-gradient-to-r from-cyan-500/50 to-cyan-500/20" />
                )}
              </div>
            ))}

            {guideMessage !== '' && (
              <>
                <div className="w-8 h-[2px] bg-gradient-to-r from-cyan-500/50 to-cyan-500/20" />
                <span className="text-sm text-accent-cyan">{guideMessage}</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center w-full">
          <p className="text-accent-cyan text-sm">{guideMessage}</p>
        </div>
      )}
    </motion.div>
  )
}
