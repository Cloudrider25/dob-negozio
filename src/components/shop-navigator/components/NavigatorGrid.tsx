'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type {
  NavigatorState,
  NeedId,
  TextureId,
} from '@/components/shop-navigator/types/navigator'
import { ColumnNeed } from '@/components/shop-navigator/components/columns/ColumnNeed'
import { ColumnTexture } from '@/components/shop-navigator/components/columns/ColumnTexture'
import { ColumnProducts } from '@/components/shop-navigator/components/columns/ColumnProducts'
import { SidePreview } from '@/components/shop-navigator/components/SidePreview'
import { PathBreadcrumb } from '@/components/shop-navigator/components/PathBreadcrumb'
import { CenterImageDisplay } from '@/components/shop-navigator/components/CenterImageDisplay'
import { useShopNavigatorData } from '@/components/shop-navigator/data/shop-data-context'
import styles from './NavigatorGrid.module.css'

interface NavigatorGridProps {
  state: NavigatorState
  onUpdateState: (updates: Partial<NavigatorState>) => void
  onAddToCart: (product: NavigatorState['selectedProduct']) => void
  productBasePath: string
}

export function NavigatorGrid({
  state,
  onUpdateState,
  onAddToCart,
  productBasePath,
}: NavigatorGridProps) {
  const {
    getTexturesForFilters,
    getProductsForFilters,
  } = useShopNavigatorData()

  const [hoveredNeed, setHoveredNeed] = useState<NeedId | undefined>(undefined)
  const [clickedNeed, setClickedNeed] = useState<NeedId | undefined>(undefined)
  const [isNeedSlideOutAnimating, setIsNeedSlideOutAnimating] = useState(false)

  const getNextStepAfterNeed = (needId: NeedId) => {
    const textures = getTexturesForFilters({ needId })
    if (textures.length > 0) return 'texture'
    return 'products'
  }

  const handleSelectNeed = (need: NeedId) => {
    if (need === state.selectedNeed) return
    const nextStep = getNextStepAfterNeed(need)

    if (state.step === 'need') {
      if (!hoveredNeed || hoveredNeed !== need) {
        onUpdateState({
          selectedNeed: need,
          selectedTexture: undefined,
          selectedProduct: undefined,
          step: nextStep,
        })
        return
      }
      setClickedNeed(need)
      setIsNeedSlideOutAnimating(true)
    } else {
      onUpdateState({
        selectedNeed: need,
        selectedTexture: undefined,
        selectedProduct: undefined,
        step: nextStep,
      })
    }
  }

  const handleNeedSlideOutComplete = () => {
    setIsNeedSlideOutAnimating(false)
    if (!clickedNeed) return
    onUpdateState({
      selectedNeed: clickedNeed,
      selectedTexture: undefined,
      selectedProduct: undefined,
      step: getNextStepAfterNeed(clickedNeed),
    })
    setClickedNeed(undefined)
    setHoveredNeed(undefined)
  }

  const handleSelectTexture = (texture: TextureId) => {
    if (texture === state.selectedTexture) return
    onUpdateState({
      selectedTexture: texture,
      selectedProduct: undefined,
      step: 'products',
    })
  }

  const handleAddToCart = (product: NavigatorState['selectedProduct']) => {
    if (!product) return
    onAddToCart(product)
  }

  const handleNavigateToStep = (step: NavigatorState['step']) => {
    if (step === 'need') {
      onUpdateState({
        step: 'need',
        selectedNeed: undefined,
        selectedTexture: undefined,
        selectedProduct: undefined,
      })
      return
    }

    if (step === 'texture') {
      onUpdateState({
        step: 'texture',
        selectedTexture: undefined,
        selectedProduct: undefined,
      })
    }
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

  const products = useMemo(
    () =>
      getProductsForFilters({
        needId: state.selectedNeed,
        textureId: state.selectedTexture,
      }),
    [getProductsForFilters, state.selectedNeed, state.selectedTexture],
  )

  const preProductStep = useMemo(() => {
    if (!state.selectedNeed) return 'need'
    const textures = getTexturesForFilters({
      needId: state.selectedNeed,
    })
    if (textures.length > 0) return 'texture'
    return 'need'
  }, [getTexturesForFilters, state.selectedNeed])

  return (
    <div className={styles.wrapper}>
      {/* Breadcrumb */}
      <div className={styles.topSpacing}>
        <PathBreadcrumb state={state} onNavigateToStep={handleNavigateToStep} onBack={handleBack} />
      </div>

      {/* Grid Layout */}
      <div className={styles.grid}>
        <div className={styles.mainCol}>
          {state.step === 'need' ? (
            <div className={styles.columnsGrid}>
              <div>
                <AnimatePresence mode="wait">
                  <ColumnNeed
                    selectedNeed={state.selectedNeed}
                    onSelectNeed={handleSelectNeed}
                    onHoverNeed={setHoveredNeed}
                  />
                </AnimatePresence>
              </div>

              <div className={`${styles.splitCol} navigator-column`}>
                <div className={styles.hiddenTitleWrap} aria-hidden="true">
                  <h3 className={styles.hiddenTitle}>Spacer</h3>
                </div>
                <div className={styles.mainContent}>
                  <CenterImageDisplay
                    hoveredNeed={hoveredNeed}
                    shouldSlideOut={isNeedSlideOutAnimating}
                    onAnimationComplete={handleNeedSlideOutComplete}
                  />
                </div>
              </div>
            </div>
          ) : state.step !== 'products' ? (
            <div className={styles.relative}>
              <div className={styles.columnsGrid}>
                <div>
                  {state.step === 'texture' && state.selectedNeed && (
                    <ColumnNeed
                      selectedNeed={state.selectedNeed}
                      onSelectNeed={handleSelectNeed}
                      onHoverNeed={setHoveredNeed}
                    />
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {state.step === 'texture' && state.selectedNeed && (
                    <motion.div
                      key="texture-column"
                      initial={{ x: 400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -400, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <ColumnTexture
                        needId={state.selectedNeed}
                        selectedTexture={state.selectedTexture}
                        onSelectTexture={handleSelectTexture}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`${styles.relative} ${styles.minHeight} navigator-column`}>
                  <div className={styles.hiddenTitleWrap} aria-hidden="true">
                    <h3 className={styles.hiddenTitle}>Spacer</h3>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.relative}>
              <div className={styles.columnsGrid}>
                {state.selectedNeed && preProductStep === 'texture' && (
                  <div>
                    <ColumnTexture
                      needId={state.selectedNeed}
                      selectedTexture={state.selectedTexture}
                      onSelectTexture={handleSelectTexture}
                    />
                  </div>
                )}
                {state.selectedNeed && preProductStep === 'need' && (
                  <div>
                    <ColumnNeed
                      selectedNeed={state.selectedNeed}
                      onSelectNeed={handleSelectNeed}
                    />
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key="products-column"
                    className={styles.splitCol}
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <ColumnProducts
                      products={products}
                      onAddToCart={handleAddToCart}
                      productBasePath={productBasePath}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className={`${styles.sideCol} navigator-column`}>
          <SidePreview state={state} />
        </div>
      </div>
    </div>
  )
}
