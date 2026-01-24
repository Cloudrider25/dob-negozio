'use client'

import type { NavigatorState } from "@/components/service-navigator/types/navigator";
import { useNavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { X, Plus, ShoppingBag } from "@/components/service-navigator/icons";

interface SidePreviewProps {
  state: NavigatorState;
  onBookNow: () => void;
  onSkinAnalyzer: () => void;
  onAddToCart: () => void;
  onRemoveFromCart: (index: number) => void;
  onResetSelection: () => void;
}

export function SidePreview({
  state,
  onBookNow,
  onSkinAnalyzer,
  onAddToCart,
  onRemoveFromCart,
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

  // Calcola durata e prezzo totale del carrello
  const totalDuration = cart.reduce(
    (sum, item) => sum + item.service.durationMin,
    0,
  );
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.service.price || 0),
    0,
  );

  return (
    <div className="navigator-column">
      {/* Carrello Servizi */}
      {cart.length > 0 && (
        <div className="mb-6">
          {/* Titolo allineato con le colonne */}
          <div className="mb-1">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
              Carrello
            </h3>
          </div>

          <div className="relative w-full">
            <div className="navigator-box p-6 rounded-lg bg-cyan-500/5 backdrop-blur-sm h-full">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-cyan-400 uppercase tracking-wider">
                  Servizi Selezionati ({cart.length})
                </h3>
              </div>

              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {cart.map((item, index) => {
                  const itemAreaData = getAreaById(item.area);
                  return (
                    <div
                      key={index}
                      className="navigator-box p-3 rounded-lg bg-white/5 group hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium mb-1 truncate">
                            {item.service.title}
                          </div>
                          <div className="text-xs text-white/50 space-y-0.5">
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
                        <button
                          onClick={() => onRemoveFromCart(index)}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totali */}
              <div className="pt-4 border-t border-cyan-500/20 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">
                    Durata Totale
                  </span>
                  <span className="text-cyan-400 font-medium">
                    {totalDuration} min
                  </span>
                </div>
                {totalPrice > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">
                      Prezzo Totale
                    </span>
                    <span className="text-cyan-400 font-medium">
                      € {totalPrice}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selezione Corrente */}
      <div className="mb-6">
        {/* Titolo allineato con le colonne */}
        <div className="mb-1">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
            Riepilogo
          </h3>
        </div>

        <div className="relative w-full">
          <div className="navigator-box p-6 rounded-lg bg-white/[0.02] backdrop-blur-sm h-full">
            <div className="space-y-3">
              {/* Area */}
              <div>
                <div className="text-xs text-white/40 mb-1">
                  Area
                </div>
                <div className="text-base text-white">
                  {areaData?.label || "—"}
                </div>
              </div>

              {/* Goal (solo viso/corpo) */}
              {(selectedArea === "viso" ||
                selectedArea === "corpo") && (
                <div>
                  <div className="text-xs text-white/40 mb-1">
                    Obiettivo
                  </div>
                  <div className="text-base text-white capitalize">
                  {selectedGoal ? getGoalById(selectedGoal)?.label || selectedGoal : "—"}
                  </div>
                </div>
              )}

              {/* Treatment */}
              <div>
                <div className="text-xs text-white/40 mb-1">
                  Trattamento
                </div>
                <div className="text-base text-white capitalize">
                  {selectedTreatment ? getTreatmentById(selectedTreatment)?.label || selectedTreatment : "—"}
                </div>
              </div>

              {/* Service */}
              <div>
                <div className="text-xs text-white/40 mb-1">
                  Servizio
                </div>
                <div className="text-base text-white">
                  {selectedService?.title || "—"}
                </div>
              </div>
            </div>

            {/* Premium info sempre visibili */}
            {selectedService && (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">
                    Durata
                  </span>
                  <span className="text-sm text-white font-medium">
                    {selectedService.durationMin} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">
                    Tecnologia
                  </span>
                  <span className="text-sm text-white font-medium capitalize">
                    {selectedTreatment}
                  </span>
                </div>
                {selectedService.price && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">
                      Prezzo
                    </span>
                    <span className="text-sm text-white font-medium">
                      € {selectedService.price}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        {/* Add to Cart - Solo se c'è un servizio selezionato */}
        {canAddToCart && (
          <button
            onClick={onAddToCart}
            className="w-full px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Aggiungi al Carrello
          </button>
        )}

        {/* Add Another Service - Solo se ci sono già servizi nel carrello */}
        {cart.length > 0 && !canAddToCart && (
          <button
            onClick={onResetSelection}
            className="w-full px-6 py-3 rounded-lg font-medium border border-white/20 text-white hover:bg-white/5 transition-all duration-300"
          >
            + Aggiungi Altro Servizio
          </button>
        )}

        {/* Primary CTA - Book */}
        <button
          onClick={onBookNow}
          disabled={!canBook}
          className={`
            w-full px-6 py-3 rounded-lg font-medium transition-all duration-300
            ${
              canBook
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
                : "bg-white/5 text-white/30 cursor-not-allowed"
            }
          `}
        >
          Prenota Ora{" "}
          {cart.length > 0 &&
            `(${cart.length} ${cart.length === 1 ? "servizio" : "servizi"})`}
        </button>

        {/* Secondary CTA - Skin Analyzer */}
        <button
          onClick={onSkinAnalyzer}
          className="w-full px-6 py-3 rounded-lg font-medium border border-white/20 text-white hover:bg-white/5 transition-all duration-300"
        >
          <span className="block text-sm">
            Skin Analyzer (Derma Test)
          </span>
          <span className="block text-xs text-white/50 mt-1">
            & Consulenza Gratuita
          </span>
        </button>
      </div>
    </div>
  );
}
