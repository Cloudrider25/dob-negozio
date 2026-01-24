'use client'

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { NavigatorState } from "@/components/service-navigator/types/navigator";
import type { NavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { NavigatorHeader } from "@/components/service-navigator/components/NavigatorHeader";
import { NavigatorGrid } from "@/components/service-navigator/components/NavigatorGrid";
import { MobileFlow } from "@/components/service-navigator/components/MobileFlow";
import { ListinoTradizionale } from "@/components/service-navigator/components/ListinoTradizionale";
import { ConsulenzaForm } from "@/components/service-navigator/components/ConsulenzaForm";
import { NavigatorDataProvider } from "@/components/service-navigator/data/navigator-data-context";

type ViewMode = "navigator" | "listino" | "consulenza";

type ContactLinks = {
  phoneLink: string;
  whatsappLink: string;
  phoneDisplay: string;
  whatsappDisplay: string;
};

export function ServiceNavigatorSection({
  data,
  contactLinks,
}: {
  data: NavigatorData;
  contactLinks: ContactLinks;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("navigator");
  const [state, setState] = useState<NavigatorState>({
    step: "area",
    cart: [], // Inizializza il carrello vuoto
  });

  const [showMobileFlow, setShowMobileFlow] = useState(false);

  const handleUpdateState = (updates: Partial<NavigatorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleBookNow = () => {
    // TODO: Collegare con sistema booking
    if (state.cart.length > 0) {
      console.log("Book services:", state.cart);
      const servicesList = state.cart.map(item => item.service.title).join(", ");
      alert(`Prenotazione di ${state.cart.length} servizi:\n${servicesList}`);
    } else {
      console.log("No services in cart");
      alert("Aggiungi almeno un servizio al carrello");
    }
  };

  const handleSkinAnalyzer = () => {
    // TODO: Collegare con pagina Skin Analyzer
    console.log("Open Skin Analyzer");
    alert("Skin Analyzer (Derma Test) & Consulenza");
  };

  return (
    <section className="service-navigator relative min-h-screen overflow-hidden">
      <NavigatorDataProvider data={data}>
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <NavigatorHeader 
            activeView={viewMode}
            onViewChange={setViewMode}
          />

        {/* Desktop View */}
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            {viewMode === "navigator" ? (
              <NavigatorGrid
                key="navigator"
                state={state}
                onUpdateState={handleUpdateState}
                onBookNow={handleBookNow}
                onSkinAnalyzer={handleSkinAnalyzer}
              />
            ) : viewMode === "listino" ? (
              <ListinoTradizionale key="listino" />
            ) : (
              <ConsulenzaForm
                key="consulenza"
                phoneLink={contactLinks.phoneLink}
                whatsappLink={contactLinks.whatsappLink}
                phoneDisplay={contactLinks.phoneDisplay}
                whatsappDisplay={contactLinks.whatsappDisplay}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Mobile CTA */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMobileFlow(true)}
            className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300"
          >
            Inizia la Configurazione
          </button>
        </div>
      </div>

        {/* Mobile Flow Overlay */}
        {showMobileFlow && (
          <MobileFlow
            state={state}
            onUpdateState={handleUpdateState}
            onBookNow={handleBookNow}
            onClose={() => setShowMobileFlow(false)}
          />
        )}
      </NavigatorDataProvider>
    </section>
  );
}
