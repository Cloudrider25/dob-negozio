'use client'

import type { NavigatorState, SelectedServiceItem } from '@/components/navigators/service-navigator/types/navigator'
import { useNavigatorData } from '@/components/navigators/service-navigator/data/navigator-data-context'
import { Minus, Plus, ShoppingBag, Trash } from '@/components/ui/icons'
import { GlassCard } from '@/components/navigators/service-navigator/components/GlassCard'
import { SidePreviewSection } from '@/components/navigators/core/SidePreviewSection'
import { Button } from '@/components/ui/button'
import styles from '@/components/navigators/service-navigator/components/SidePreview.module.css'

interface SidePreviewProps {
  state: NavigatorState
  onBookNow: () => void
  onSkinAnalyzer: () => void
  onAddToCartItem: (item: SelectedServiceItem) => void
  onRemoveFromCartItem: (item: SelectedServiceItem) => void
  onResetSelection: () => void
}

export function SidePreview({
  state,
  onBookNow,
  onSkinAnalyzer,
  onAddToCartItem,
  onRemoveFromCartItem,
  onResetSelection,
}: SidePreviewProps) {
  const { getAreaById, getGoalById, getTreatmentById } = useNavigatorData()
  const { selectedArea, selectedGoal, selectedTreatment, selectedService, cart } = state

  const areaData = getAreaById(selectedArea)

  const canAddToCart = state.step === 'final' && selectedService
  const canBook = cart.length > 0

  const groupedCart = cart.reduce<Record<string, { item: SelectedServiceItem; count: number }>>(
    (acc, item) => {
      const key = item.service.id
      if (!acc[key]) {
        acc[key] = { item, count: 0 }
      }
      acc[key].count += 1
      return acc
    },
    {},
  )

  const groupedItems = Object.values(groupedCart)

  const totalDuration = cart.reduce((sum, item) => sum + item.service.durationMin, 0)
  const totalPrice = cart.reduce((sum, item) => sum + (item.service.price || 0), 0)

  return (
    <div className={styles.column}>
      {cart.length > 0 && (
        <SidePreviewSection
          title="Carrello"
          classNames={{
            section: styles.section,
            heading: styles.heading,
            headingText: styles.headingText,
            panel: styles.panel,
          }}
        >
          <GlassCard paddingClassName="p-6">
            <div className={styles.cartHeader}>
              <ShoppingBag className={styles.cartHeaderIcon} />
              <h3 className={styles.cartHeaderText}>Servizi Selezionati ({cart.length})</h3>
            </div>

            <div className={styles.cartList}>
              {groupedItems.map(({ item, count }) => {
                const itemAreaData = getAreaById(item.area)
                return (
                  <GlassCard key={item.service.id} paddingClassName="p-3">
                    <div className={styles.cartItem}>
                      <div className={styles.cartItemText}>
                        <div className={styles.cartItemTitle}>{item.service.title}</div>
                        <div className={styles.cartItemMeta}>
                          <div className={styles.summaryValueCaps}>
                            {itemAreaData?.label}
                            {item.goal && ` • ${getGoalById(item.goal)?.label || item.goal}`}
                          </div>
                          <div className={styles.summaryValueCaps}>
                            {getTreatmentById(item.treatment)?.label || item.treatment}
                          </div>
                          <div className={styles.cartItemMetaRow}>
                            <span>{item.service.durationMin} min</span>
                            {item.service.price && <span>€ {item.service.price}</span>}
                          </div>
                        </div>
                      </div>
                      {count > 1 ? (
                        <div className={styles.cartItemActions}>
                          <button
                            onClick={() => onRemoveFromCartItem(item)}
                            className={`${styles.cartActionButton} ${styles.cartActionButtonRemove}`}
                          >
                            <Minus className={`${styles.cartActionIcon} ${styles.cartActionIconRemove}`} />
                          </button>
                          <span className={styles.cartCount}>{count}</span>
                          <button
                            onClick={() => onAddToCartItem(item)}
                            className={`${styles.cartActionButton} ${styles.cartActionButtonAdd}`}
                          >
                            <Plus className={`${styles.cartActionIcon} ${styles.cartActionIconAdd}`} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onRemoveFromCartItem(item)}
                          className={`${styles.cartActionButton} ${styles.cartActionButtonRemove}`}
                        >
                          <Trash className={`${styles.cartActionIcon} ${styles.cartActionIconRemove}`} />
                        </button>
                      )}
                    </div>
                  </GlassCard>
                )
              })}
            </div>

            <div className={styles.cartTotals}>
              <div className={styles.cartTotalRow}>
                <span className={styles.cartTotalLabel}>Durata Totale</span>
                <span className={styles.cartTotalValue}>{totalDuration} min</span>
              </div>
              {totalPrice > 0 && (
                <div className={styles.cartTotalRow}>
                  <span className={styles.cartTotalLabel}>Prezzo Totale</span>
                  <span className={styles.cartTotalValue}>€ {totalPrice}</span>
                </div>
              )}
            </div>
          </GlassCard>
        </SidePreviewSection>
      )}

      <SidePreviewSection
        title="Riepilogo"
        classNames={{
          section: styles.section,
          heading: styles.heading,
          headingText: styles.headingText,
          panel: styles.panel,
        }}
      >
        <GlassCard paddingClassName="p-6">
          <div className={styles.summaryList}>
            <div>
              <div className={styles.summaryLabel}>Area</div>
              <div className={styles.summaryValue}>{areaData?.label || '—'}</div>
            </div>

            {(selectedArea === 'viso' || selectedArea === 'corpo') && (
              <div>
                <div className={styles.summaryLabel}>Obiettivo</div>
                <div className={`${styles.summaryValue} ${styles.summaryValueCaps}`}>
                  {selectedGoal ? getGoalById(selectedGoal)?.label || selectedGoal : '—'}
                </div>
              </div>
            )}

            <div>
              <div className={styles.summaryLabel}>Trattamento</div>
              <div className={`${styles.summaryValue} ${styles.summaryValueCaps}`}>
                {selectedTreatment ? getTreatmentById(selectedTreatment)?.label || selectedTreatment : '—'}
              </div>
            </div>

            <div>
              <div className={styles.summaryLabel}>Servizio</div>
              <div className={styles.summaryValue}>{selectedService?.title || '—'}</div>
            </div>
          </div>

          {selectedService && (
            <div className={styles.summaryInfo}>
              <div className={styles.summaryInfoRow}>
                <span className={styles.cartTotalLabel}>Durata</span>
                <span className={styles.summaryValue}>{selectedService.durationMin} min</span>
              </div>
              <div className={styles.summaryInfoRow}>
                <span className={styles.cartTotalLabel}>Tecnologia</span>
                <span className={`${styles.summaryValue} ${styles.summaryValueCaps}`}>{selectedTreatment}</span>
              </div>
              {selectedService.price && (
                <div className={styles.summaryInfoRow}>
                  <span className={styles.cartTotalLabel}>Prezzo</span>
                  <span className={styles.summaryValue}>€ {selectedService.price}</span>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </SidePreviewSection>

      <div className={styles.ctaStack}>
        {cart.length > 0 && !canAddToCart && (
          <Button onClick={onResetSelection} className={`glass-pill ${styles.pillButton}`} kind="main" size="sm">
            + Aggiungi Altro Servizio
          </Button>
        )}

        <Button
          onClick={onBookNow}
          disabled={!canBook}
          className={`glass-pill ${styles.pillButton} ${canBook ? '' : styles.pillMuted}`}
          kind="main"
          size="sm"
        >
          Prenota Ora {cart.length > 0 && `(${cart.length} ${cart.length === 1 ? 'servizio' : 'servizi'})`}
        </Button>

        <Button onClick={onSkinAnalyzer} className={styles.skinButton} kind="main" interactive>
          <span className={styles.skinTitle}>Skin Analyzer (Derma Test)</span>
          <span className={styles.skinSubtitle}>& Consulenza Gratuita</span>
        </Button>
      </div>
    </div>
  )
}
