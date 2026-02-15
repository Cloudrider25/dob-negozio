'use client'

import type { NavigatorState, SelectedServiceItem } from "@/components/service-navigator/types/navigator";
import { useNavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { Minus, Plus, ShoppingBag, Trash } from "@/components/service-navigator/icons";
import { GlassCard } from "@/components/service-navigator/components/GlassCard";
import styles from "@/components/service-navigator/components/SidePreview.module.css";

interface SidePreviewProps {
  state: NavigatorState;
  onBookNow: () => void;
  onSkinAnalyzer: () => void;
  onAddToCartItem: (item: SelectedServiceItem) => void;
  onRemoveFromCartItem: (item: SelectedServiceItem) => void;
  onResetSelection: () => void;
}

export function SidePreview({
  state,
  onBookNow,
  onSkinAnalyzer,
  onAddToCartItem,
  onRemoveFromCartItem,
  onResetSelection,
}: SidePreviewProps) {
  const { getAreaById, getGoalById, getTreatmentById } = useNavigatorData();
  const {
    selectedArea,
    selectedGoal,
    selectedTreatment,
    selectedService,
    cart,
  } = state;

  const areaData = getAreaById(selectedArea);

  const canAddToCart =
    state.step === "final" && selectedService;
  const canBook = cart.length > 0;

  const groupedCart = cart.reduce<Record<string, { item: SelectedServiceItem; count: number }>>(
    (acc, item) => {
      const key = item.service.id;
      if (!acc[key]) {
        acc[key] = { item, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    },
    {},
  );

  const groupedItems = Object.values(groupedCart);

  const totalDuration = cart.reduce((sum, item) => sum + item.service.durationMin, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.service.price || 0), 0);

  return (
    <div className={styles.column}>
      {/* Carrello Servizi */}
      {cart.length > 0 && (
        <div className={styles.section}>
          {/* Titolo allineato con le colonne */}
          <div className={styles.heading}>
            <h3 className={styles.headingText}>Carrello</h3>
          </div>

          <div className={styles.panel}>
            <GlassCard paddingClassName="p-6">
              <div className={styles.cartHeader}>
                <ShoppingBag className={styles.cartHeaderIcon} />
                <h3 className={styles.cartHeaderText}>
                  Servizi Selezionati ({cart.length})
                </h3>
              </div>

              <div className={styles.cartList}>
                {groupedItems.map(({ item, count }) => {
                  const itemAreaData = getAreaById(item.area);
                  return (
                    <GlassCard key={item.service.id} paddingClassName="p-3">
                      <div className={styles.cartItem}>
                        <div className={styles.cartItemText}>
                          <div className={styles.cartItemTitle}>
                            {item.service.title}
                          </div>
                          <div className={styles.cartItemMeta}>
                            <div className={styles.summaryValueCaps}>
                              {itemAreaData?.label}
                              {item.goal &&
                                ` • ${getGoalById(item.goal)?.label || item.goal}`}
                            </div>
                            <div className={styles.summaryValueCaps}>
                              {getTreatmentById(item.treatment)?.label || item.treatment}
                            </div>
                            <div className={styles.cartItemMetaRow}>
                              <span>
                                {item.service.durationMin} min
                              </span>
                              {item.service.price && (
                                <span>
                                  € {item.service.price}
                                </span>
                              )}
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
                  );
                })}
              </div>

              {/* Totali */}
              <div className={styles.cartTotals}>
                <div className={styles.cartTotalRow}>
                  <span className={styles.cartTotalLabel}>
                    Durata Totale
                  </span>
                  <span className={styles.cartTotalValue}>
                    {totalDuration} min
                  </span>
                </div>
                {totalPrice > 0 && (
                  <div className={styles.cartTotalRow}>
                    <span className={styles.cartTotalLabel}>
                      Prezzo Totale
                    </span>
                    <span className={styles.cartTotalValue}>
                      € {totalPrice}
                    </span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Selezione Corrente */}
      <div className={styles.section}>
        {/* Titolo allineato con le colonne */}
        <div className={styles.heading}>
          <h3 className={styles.headingText}>Riepilogo</h3>
        </div>

        <div className={styles.panel}>
          <GlassCard paddingClassName="p-6">
            <div className={styles.summaryList}>
              {/* Area */}
              <div>
                <div className={styles.summaryLabel}>Area</div>
                <div className={styles.summaryValue}>
                  {areaData?.label || "—"}
                </div>
              </div>

              {/* Goal (solo viso/corpo) */}
              {(selectedArea === "viso" ||
                selectedArea === "corpo") && (
                <div>
                  <div className={styles.summaryLabel}>Obiettivo</div>
                  <div className={`${styles.summaryValue} ${styles.summaryValueCaps}`}>
                  {selectedGoal ? getGoalById(selectedGoal)?.label || selectedGoal : "—"}
                  </div>
                </div>
              )}

              {/* Treatment */}
              <div>
                <div className={styles.summaryLabel}>Trattamento</div>
                <div className={`${styles.summaryValue} ${styles.summaryValueCaps}`}>
                  {selectedTreatment ? getTreatmentById(selectedTreatment)?.label || selectedTreatment : "—"}
                </div>
              </div>

              {/* Service */}
              <div>
                <div className={styles.summaryLabel}>Servizio</div>
                <div className={styles.summaryValue}>
                  {selectedService?.title || "—"}
                </div>
              </div>
            </div>

            {/* Premium info sempre visibili */}
            {selectedService && (
              <div className={styles.summaryInfo}>
                <div className={styles.summaryInfoRow}>
                  <span className={styles.cartTotalLabel}>
                    Durata
                  </span>
                  <span className={styles.summaryValue}>
                    {selectedService.durationMin} min
                  </span>
                </div>
                <div className={styles.summaryInfoRow}>
                  <span className={styles.cartTotalLabel}>
                    Tecnologia
                  </span>
                  <span className={`${styles.summaryValue} ${styles.summaryValueCaps}`}>
                    {selectedTreatment}
                  </span>
                </div>
                {selectedService.price && (
                  <div className={styles.summaryInfoRow}>
                    <span className={styles.cartTotalLabel}>
                      Prezzo
                    </span>
                    <span className={styles.summaryValue}>
                      € {selectedService.price}
                    </span>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* CTAs */}
      <div className={styles.ctaStack}>
        {/* Add Another Service - Solo se ci sono già servizi nel carrello */}
        {cart.length > 0 && !canAddToCart && (
          <button
            onClick={onResetSelection}
            className={`glass-pill ${styles.pillButton}`}
          >
            + Aggiungi Altro Servizio
          </button>
        )}

        {/* Primary CTA - Book */}
        <button
          onClick={onBookNow}
          disabled={!canBook}
          className={`glass-pill ${styles.pillButton} ${canBook ? '' : styles.pillMuted}`}
        >
          Prenota Ora{" "}
          {cart.length > 0 &&
            `(${cart.length} ${cart.length === 1 ? "servizio" : "servizi"})`}
        </button>

        {/* Secondary CTA - Skin Analyzer */}
        <button
          onClick={onSkinAnalyzer}
          className={`button-base ${styles.skinButton}`}
        >
          <span className={styles.skinTitle}>
            Skin Analyzer (Derma Test)
          </span>
          <span className={styles.skinSubtitle}>
            & Consulenza Gratuita
          </span>
        </button>
      </div>
    </div>
  );
}
