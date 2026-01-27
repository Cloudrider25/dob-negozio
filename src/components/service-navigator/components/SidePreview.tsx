'use client'

import type { NavigatorState } from "@/components/service-navigator/types/navigator";
import { useNavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { Minus, Plus, ShoppingBag, Trash } from "@/components/service-navigator/icons";
import { GlassCard } from "@/components/service-navigator/components/GlassCard";

interface SidePreviewProps {
  state: NavigatorState;
  onBookNow: () => void;
  onSkinAnalyzer: () => void;
  onAddToCart: () => void;
  onAddToCartItem: (item: SelectedServiceItem) => void;
  onRemoveFromCart: (index: number) => void;
  onRemoveFromCartItem: (item: SelectedServiceItem) => void;
  onResetSelection: () => void;
}

export function SidePreview({
  state,
  onBookNow,
  onSkinAnalyzer,
  onAddToCart,
  onAddToCartItem,
  onRemoveFromCart,
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
    <div className="navigator-column">
      {/* Carrello Servizi */}
      {cart.length > 0 && (
        <div className="mb-6 navigator-column">
          {/* Titolo allineato con le colonne */}
          <div className="mb-1">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
              Carrello
            </h3>
          </div>

          <div className="relative w-full">
            <GlassCard paddingClassName="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-4 h-4 text-accent-cyan" />
                <h3 className="text-sm font-medium text-accent-cyan uppercase tracking-wider">
                  Servizi Selezionati ({cart.length})
                </h3>
              </div>

              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {groupedItems.map(({ item, count }) => {
                  const itemAreaData = getAreaById(item.area);
                  return (
                    <GlassCard key={item.service.id} paddingClassName="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-text-primary font-medium mb-1 truncate">
                            {item.service.title}
                          </div>
                          <div className="text-xs text-text-muted space-y-0.5">
                            <div className="capitalize">
                              {itemAreaData?.label}
                              {item.goal &&
                                ` • ${getGoalById(item.goal)?.label || item.goal}`}
                            </div>
                            <div className="capitalize">
                              {getTreatmentById(item.treatment)?.label || item.treatment}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
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
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onRemoveFromCartItem(item)}
                              className="p-1 rounded hover:bg-red-500/20 transition-colors"
                            >
                              <Minus className="w-4 h-4 text-accent-red" />
                            </button>
                            <span className="text-xs text-text-muted tabular-nums">{count}</span>
                            <button
                              onClick={() => onAddToCartItem(item)}
                              className="p-1 rounded hover:bg-cyan-500/20 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-accent-cyan" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onRemoveFromCartItem(item)}
                            className="p-1 rounded hover:bg-red-500/20 transition-colors"
                          >
                            <Trash className="w-4 h-4 text-accent-red" />
                          </button>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              {/* Totali */}
              <div className="pt-4 border-t border-cyan-500/20 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">
                    Durata Totale
                  </span>
                  <span className="text-accent-cyan font-medium">
                    {totalDuration} min
                  </span>
                </div>
                {totalPrice > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">
                      Prezzo Totale
                    </span>
                    <span className="text-accent-cyan font-medium">
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
      <div className="mb-6 navigator-column">
        {/* Titolo allineato con le colonne */}
        <div className="mb-1">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            Riepilogo
          </h3>
        </div>

        <div className="relative w-full">
          <GlassCard paddingClassName="p-6">
            <div className="space-y-3">
              {/* Area */}
              <div>
                <div className="text-xs text-text-muted mb-1">
                  Area
                </div>
                <div className="text-base text-text-primary">
                  {areaData?.label || "—"}
                </div>
              </div>

              {/* Goal (solo viso/corpo) */}
              {(selectedArea === "viso" ||
                selectedArea === "corpo") && (
                <div>
                  <div className="text-xs text-text-muted mb-1">
                    Obiettivo
                  </div>
                  <div className="text-base text-text-primary capitalize">
                  {selectedGoal ? getGoalById(selectedGoal)?.label || selectedGoal : "—"}
                  </div>
                </div>
              )}

              {/* Treatment */}
              <div>
                <div className="text-xs text-text-muted mb-1">
                  Trattamento
                </div>
                <div className="text-base text-text-primary capitalize">
                  {selectedTreatment ? getTreatmentById(selectedTreatment)?.label || selectedTreatment : "—"}
                </div>
              </div>

              {/* Service */}
              <div>
                <div className="text-xs text-text-muted mb-1">
                  Servizio
                </div>
                <div className="text-base text-text-primary">
                  {selectedService?.title || "—"}
                </div>
              </div>
            </div>

            {/* Premium info sempre visibili */}
            {selectedService && (
              <div className="mt-6 pt-6 border-t border-stroke space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">
                    Durata
                  </span>
                  <span className="text-sm text-text-primary font-medium">
                    {selectedService.durationMin} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">
                    Tecnologia
                  </span>
                  <span className="text-sm text-text-primary font-medium capitalize">
                    {selectedTreatment}
                  </span>
                </div>
                {selectedService.price && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">
                      Prezzo
                    </span>
                    <span className="text-sm text-text-primary font-medium">
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
      <div className="space-y-3">
        {/* Add Another Service - Solo se ci sono già servizi nel carrello */}
        {cart.length > 0 && !canAddToCart && (
          <button
            onClick={onResetSelection}
            className="glass-pill w-full justify-center text-sm font-medium text-text-primary"
          >
            + Aggiungi Altro Servizio
          </button>
        )}

        {/* Primary CTA - Book */}
        <button
          onClick={onBookNow}
          disabled={!canBook}
          className={`glass-pill w-full justify-center text-sm font-medium ${
            canBook ? 'text-text-primary' : 'text-text-muted cursor-not-allowed opacity-60'
          }`}
        >
          Prenota Ora{" "}
          {cart.length > 0 &&
            `(${cart.length} ${cart.length === 1 ? "servizio" : "servizi"})`}
        </button>

        {/* Secondary CTA - Skin Analyzer */}
        <button
          onClick={onSkinAnalyzer}
          className="button-base w-full px-6 py-3 font-medium text-text-primary"
        >
          <span className="block text-sm">
            Skin Analyzer (Derma Test)
          </span>
          <span className="block text-xs text-text-muted mt-1">
            & Consulenza Gratuita
          </span>
        </button>
      </div>
    </div>
  );
}
