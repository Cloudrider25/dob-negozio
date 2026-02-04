'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type {
  CategoryId,
  LineId,
  NavigatorState,
  NeedId,
  TextureId,
} from '@/components/shop-navigator/types/navigator'
import { ColumnNeed } from '@/components/shop-navigator/components/columns/ColumnNeed'
import { ColumnCategory } from '@/components/shop-navigator/components/columns/ColumnCategory'
import { ColumnLine } from '@/components/shop-navigator/components/columns/ColumnLine'
import { ColumnTexture } from '@/components/shop-navigator/components/columns/ColumnTexture'
import { ColumnProducts } from '@/components/shop-navigator/components/columns/ColumnProducts'
import { SidePreview } from '@/components/shop-navigator/components/SidePreview'
import { PathBreadcrumb } from '@/components/shop-navigator/components/PathBreadcrumb'
import { CenterImageDisplay } from '@/components/shop-navigator/components/CenterImageDisplay'
import { CategoryHoverCard } from '@/components/shop-navigator/components/CategoryHoverCard'
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
    getLinesForFilters,
    getTexturesForFilters,
    getProductsForFilters,
    getCategoryById,
    getLineById,
    getTextureById,
  } = useShopNavigatorData()

  const [hoveredNeed, setHoveredNeed] = useState<NeedId | undefined>(undefined)
  const [clickedNeed, setClickedNeed] = useState<NeedId | undefined>(undefined)
  const [isNeedSlideOutAnimating, setIsNeedSlideOutAnimating] = useState(false)

  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null)
  const [clickedCategory, setClickedCategory] = useState<CategoryId | undefined>(undefined)
  const [isCategorySlideOutAnimating, setIsCategorySlideOutAnimating] = useState(false)

  const [hoveredLine, setHoveredLine] = useState<LineId | null>(null)
  const [clickedLine, setClickedLine] = useState<LineId | undefined>(undefined)
  const [isLineSlideOutAnimating, setIsLineSlideOutAnimating] = useState(false)

  const [hoveredTexture, setHoveredTexture] = useState<TextureId | null>(null)
  const [clickedTexture, setClickedTexture] = useState<TextureId | undefined>(undefined)
  const [isTextureSlideOutAnimating, setIsTextureSlideOutAnimating] = useState(false)

  const getNextStepAfterCategory = (needId: NeedId, categoryId: CategoryId) => {
    const lines = getLinesForFilters({ needId, categoryId })
    if (lines.length > 0) return 'line'
    const textures = getTexturesForFilters({ needId, categoryId })
    if (textures.length > 0) return 'texture'
    return 'products'
  }

  const getNextStepAfterLine = (needId: NeedId, categoryId: CategoryId, lineId: LineId) => {
    const textures = getTexturesForFilters({ needId, categoryId, lineId })
    if (textures.length > 0) return 'texture'
    return 'products'
  }

  const handleSelectNeed = (need: NeedId) => {
    if (need === state.selectedNeed) return
    if (state.step === 'need') {
      if (!hoveredNeed || hoveredNeed !== need) {
        onUpdateState({
          selectedNeed: need,
          selectedCategory: undefined,
          selectedLine: undefined,
          selectedTexture: undefined,
          selectedProduct: undefined,
          step: 'category',
        })
        return
      }
      setClickedNeed(need)
      setIsNeedSlideOutAnimating(true)
    } else {
      onUpdateState({
        selectedNeed: need,
        selectedCategory: undefined,
        selectedLine: undefined,
        selectedTexture: undefined,
        selectedProduct: undefined,
        step: 'category',
      })
    }
  }

  const handleNeedSlideOutComplete = () => {
    setIsNeedSlideOutAnimating(false)
    if (!clickedNeed) return
    onUpdateState({
      selectedNeed: clickedNeed,
      selectedCategory: undefined,
      selectedLine: undefined,
      selectedTexture: undefined,
      selectedProduct: undefined,
      step: 'category',
    })
    setClickedNeed(undefined)
    setHoveredNeed(undefined)
  }

  const handleSelectCategory = (category: CategoryId) => {
    if (category === state.selectedCategory) return
    if (state.step === 'category') {
      if (!hoveredCategory || hoveredCategory !== category) {
        if (!state.selectedNeed) return
        onUpdateState({
          selectedCategory: category,
          selectedLine: undefined,
          selectedTexture: undefined,
          selectedProduct: undefined,
          step: getNextStepAfterCategory(state.selectedNeed, category),
        })
        return
      }
      setClickedCategory(category)
      setIsCategorySlideOutAnimating(true)
    } else if (state.selectedNeed) {
      onUpdateState({
        selectedCategory: category,
        selectedLine: undefined,
        selectedTexture: undefined,
        selectedProduct: undefined,
        step: getNextStepAfterCategory(state.selectedNeed, category),
      })
    }
  }

  const handleCategorySlideOutComplete = () => {
    setIsCategorySlideOutAnimating(false)
    if (!clickedCategory || !state.selectedNeed) return
    onUpdateState({
      selectedCategory: clickedCategory,
      selectedLine: undefined,
      selectedTexture: undefined,
      selectedProduct: undefined,
      step: getNextStepAfterCategory(state.selectedNeed, clickedCategory),
    })
    setClickedCategory(undefined)
  }

  const handleSelectLine = (line: LineId) => {
    if (line === state.selectedLine) return
    if (state.step === 'line') {
      if (!hoveredLine || hoveredLine !== line) {
        if (!state.selectedNeed || !state.selectedCategory) return
        onUpdateState({
          selectedLine: line,
          selectedTexture: undefined,
          selectedProduct: undefined,
          step: getNextStepAfterLine(state.selectedNeed, state.selectedCategory, line),
        })
        return
      }
      setClickedLine(line)
      setIsLineSlideOutAnimating(true)
    } else if (state.selectedNeed && state.selectedCategory) {
      onUpdateState({
        selectedLine: line,
        selectedTexture: undefined,
        selectedProduct: undefined,
        step: getNextStepAfterLine(state.selectedNeed, state.selectedCategory, line),
      })
    }
  }

  const handleLineSlideOutComplete = () => {
    setIsLineSlideOutAnimating(false)
    if (!clickedLine || !state.selectedNeed || !state.selectedCategory) return
    onUpdateState({
      selectedLine: clickedLine,
      selectedTexture: undefined,
      selectedProduct: undefined,
      step: getNextStepAfterLine(state.selectedNeed, state.selectedCategory, clickedLine),
    })
    setClickedLine(undefined)
  }

  const handleSelectTexture = (texture: TextureId) => {
    if (texture === state.selectedTexture) return
    if (state.step === 'texture') {
      if (!hoveredTexture || hoveredTexture !== texture) {
        onUpdateState({
          selectedTexture: texture,
          selectedProduct: undefined,
          step: 'products',
        })
        return
      }
      setClickedTexture(texture)
      setIsTextureSlideOutAnimating(true)
    } else {
      onUpdateState({
        selectedTexture: texture,
        selectedProduct: undefined,
        step: 'products',
      })
    }
  }

  const handleTextureSlideOutComplete = () => {
    setIsTextureSlideOutAnimating(false)
    if (!clickedTexture) return
    onUpdateState({
      selectedTexture: clickedTexture,
      selectedProduct: undefined,
      step: 'products',
    })
    setClickedTexture(undefined)
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
        selectedCategory: undefined,
        selectedLine: undefined,
        selectedTexture: undefined,
        selectedProduct: undefined,
      })
      return
    }

    if (step === 'category') {
      onUpdateState({
        step: 'category',
        selectedCategory: undefined,
        selectedLine: undefined,
        selectedTexture: undefined,
        selectedProduct: undefined,
      })
      return
    }

    if (step === 'line') {
      onUpdateState({
        step: 'line',
        selectedLine: undefined,
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

  const products = useMemo(
    () =>
      getProductsForFilters({
        needId: state.selectedNeed,
        categoryId: state.selectedCategory,
        lineId: state.selectedLine,
        textureId: state.selectedTexture,
      }),
    [
      getProductsForFilters,
      state.selectedNeed,
      state.selectedCategory,
      state.selectedLine,
      state.selectedTexture,
    ],
  )

  const preProductStep = useMemo(() => {
    if (!state.selectedNeed || !state.selectedCategory) return 'category'
    const textures = getTexturesForFilters({
      needId: state.selectedNeed,
      categoryId: state.selectedCategory,
      lineId: state.selectedLine,
    })
    if (textures.length > 0) return 'texture'
    const lines = getLinesForFilters({
      needId: state.selectedNeed,
      categoryId: state.selectedCategory,
    })
    if (lines.length > 0) return 'line'
    return 'category'
  }, [
    getLinesForFilters,
    getTexturesForFilters,
    state.selectedCategory,
    state.selectedLine,
    state.selectedNeed,
  ])

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
                  <h3 className={styles.hiddenTitle}>
                    Spacer
                  </h3>
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
                  {state.step === 'category' && state.selectedNeed && (
                    <ColumnNeed
                      selectedNeed={state.selectedNeed}
                      onSelectNeed={handleSelectNeed}
                      onHoverNeed={setHoveredNeed}
                    />
                  )}
                  {state.step === 'line' &&
                    state.selectedNeed &&
                    state.selectedCategory && (
                      <ColumnCategory
                        needId={state.selectedNeed}
                        selectedCategory={state.selectedCategory}
                        onSelectCategory={handleSelectCategory}
                        onHoverCategory={setHoveredCategory}
                      />
                    )}
                  {state.step === 'texture' && state.selectedNeed && state.selectedCategory && (
                    <ColumnLine
                      needId={state.selectedNeed}
                      categoryId={state.selectedCategory}
                      selectedLine={state.selectedLine}
                      onSelectLine={handleSelectLine}
                      onHoverLine={setHoveredLine}
                    />
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {state.step === 'category' && state.selectedNeed && (
                    <motion.div
                      key="category-column"
                      initial={{ x: 400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -400, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <ColumnCategory
                        needId={state.selectedNeed}
                        selectedCategory={state.selectedCategory}
                        onSelectCategory={handleSelectCategory}
                        onHoverCategory={setHoveredCategory}
                      />
                    </motion.div>
                  )}
                  {state.step === 'line' && state.selectedNeed && state.selectedCategory && (
                    <motion.div
                      key="line-column"
                      initial={{ x: 400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -400, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <ColumnLine
                        needId={state.selectedNeed}
                        categoryId={state.selectedCategory}
                        selectedLine={state.selectedLine}
                        onSelectLine={handleSelectLine}
                        onHoverLine={setHoveredLine}
                      />
                    </motion.div>
                  )}
                  {state.step === 'texture' && state.selectedNeed && state.selectedCategory && (
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
                        categoryId={state.selectedCategory}
                        lineId={state.selectedLine}
                        selectedTexture={state.selectedTexture}
                        onSelectTexture={handleSelectTexture}
                        onHoverTexture={setHoveredTexture}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`${styles.relative} ${styles.minHeight} navigator-column`}>
                  <div className={styles.hiddenTitleWrap} aria-hidden="true">
                    <h3 className={styles.hiddenTitle}>
                      Spacer
                    </h3>
                  </div>

                  {state.step === 'category' && state.selectedNeed && (
                    <CategoryHoverCard
                      item={
                        hoveredCategory
                          ? {
                              id: hoveredCategory,
                              title:
                                getCategoryById(hoveredCategory)?.cardTitle ||
                                getCategoryById(hoveredCategory)?.label ||
                                hoveredCategory,
                              tagline: getCategoryById(hoveredCategory)?.cardTagline,
                              description: getCategoryById(hoveredCategory)?.description || '',
                              imageUrl: getCategoryById(hoveredCategory)?.cardMedia?.url,
                            }
                          : null
                      }
                      shouldSlideOut={isCategorySlideOutAnimating}
                      onAnimationComplete={handleCategorySlideOutComplete}
                    />
                  )}

                  {state.step === 'line' && (
                    <CategoryHoverCard
                      item={
                        hoveredLine
                          ? {
                              id: hoveredLine,
                              title:
                                getLineById(hoveredLine)?.cardTitle ||
                                getLineById(hoveredLine)?.label ||
                                hoveredLine,
                              tagline: getLineById(hoveredLine)?.cardTagline,
                              description: getLineById(hoveredLine)?.description || '',
                              imageUrl: getLineById(hoveredLine)?.cardMedia?.url,
                            }
                          : null
                      }
                      shouldSlideOut={isLineSlideOutAnimating}
                      onAnimationComplete={handleLineSlideOutComplete}
                    />
                  )}

                  {state.step === 'texture' && (
                    <CategoryHoverCard
                      item={
                        hoveredTexture
                          ? {
                              id: hoveredTexture,
                              title:
                                getTextureById(hoveredTexture)?.cardTitle ||
                                getTextureById(hoveredTexture)?.label ||
                                hoveredTexture,
                              tagline: getTextureById(hoveredTexture)?.cardTagline,
                              description: getTextureById(hoveredTexture)?.description || '',
                              imageUrl: getTextureById(hoveredTexture)?.cardMedia?.url,
                            }
                          : null
                      }
                      shouldSlideOut={isTextureSlideOutAnimating}
                      onAnimationComplete={handleTextureSlideOutComplete}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.relative}>
              <div className={styles.columnsGrid}>
                {state.selectedNeed && state.selectedCategory && preProductStep === 'texture' && (
                  <div>
                    <ColumnTexture
                      needId={state.selectedNeed}
                      categoryId={state.selectedCategory}
                      lineId={state.selectedLine}
                      selectedTexture={state.selectedTexture}
                      onSelectTexture={handleSelectTexture}
                      onHoverTexture={setHoveredTexture}
                    />
                  </div>
                )}
                {state.selectedNeed && state.selectedCategory && preProductStep === 'line' && (
                  <div>
                    <ColumnLine
                      needId={state.selectedNeed}
                      categoryId={state.selectedCategory}
                      selectedLine={state.selectedLine}
                      onSelectLine={handleSelectLine}
                      onHoverLine={setHoveredLine}
                    />
                  </div>
                )}
                {state.selectedNeed && state.selectedCategory && preProductStep === 'category' && (
                  <div>
                    <ColumnCategory
                      needId={state.selectedNeed}
                      selectedCategory={state.selectedCategory}
                      onSelectCategory={handleSelectCategory}
                      onHoverCategory={setHoveredCategory}
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
