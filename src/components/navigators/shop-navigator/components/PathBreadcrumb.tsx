'use client'

import type { NavigatorState, Step } from '@/components/navigators/shop-navigator/types/navigator'
import { useShopNavigatorData } from '@/components/navigators/shop-navigator/data/shop-data-context'
import { ChevronLeft } from '@/components/navigators/core/icons'
import { PathBreadcrumbCore } from '@/components/navigators/core/PathBreadcrumb'
import styles from '@/components/navigators/core/PathBreadcrumb.module.css'

interface PathBreadcrumbProps {
  state: NavigatorState
  onNavigateToStep: (step: Step) => void
  onBack: () => void
}

export function PathBreadcrumb({ state, onNavigateToStep, onBack }: PathBreadcrumbProps) {
  const { getNeedById, getTextureById } = useShopNavigatorData()
  const { selectedNeed, selectedTexture } = state

  const nodes: Array<{ id: string; label: string; step: Step }> = []

  if (selectedNeed) {
    nodes.push({
      id: `need-${selectedNeed}`,
      label: getNeedById(selectedNeed)?.label || selectedNeed,
      step: 'need',
    })
  }

  if (selectedTexture) {
    nodes.push({
      id: `texture-${selectedTexture}`,
      label: getTextureById(selectedTexture)?.label || selectedTexture,
      step: 'texture',
    })
  }

  const getGuideMessage = () => {
    if (!selectedNeed) return 'Seleziona un esigenza per iniziare'
    if (!selectedTexture) return 'Scegli una texture'
    return ''
  }

  return (
    <PathBreadcrumbCore
      nodes={nodes}
      guideMessage={getGuideMessage()}
      onNavigateToStep={onNavigateToStep}
      onBack={onBack}
      BackIcon={ChevronLeft}
      classNames={{
        root: styles.breadcrumb,
        row: styles.row,
        backButton: styles.shopBackButton,
        backIcon: styles.icon,
        backLabel: styles.backLabel,
        connector: styles.separator,
        nodeWrap: styles.nodeRow,
        nodeButton: styles.shopNodeButton,
        nodeDot: styles.nodeDot,
        nodeLabel: styles.shopNodeLabel,
        guide: styles.guide,
        empty: styles.empty,
        fullWidth: styles.fullWidth,
      }}
    />
  )
}
