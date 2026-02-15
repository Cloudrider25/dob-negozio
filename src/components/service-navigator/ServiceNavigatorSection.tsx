'use client'

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { NavigatorState } from "@/components/service-navigator/types/navigator";
import type { NavigatorData } from "@/components/service-navigator/data/navigator-data-context";
import { NavigatorHeader } from "@/components/service-navigator/components/NavigatorHeader";
import { NavigatorGrid } from "@/components/service-navigator/components/NavigatorGrid";
import { MobileFlow } from "@/components/service-navigator/components/MobileFlow";
import { ListinoTradizionale } from "@/components/service-navigator/components/ListinoTradizionale";
import { ConsulenzaSection } from "@/components/service-navigator/components/ConsulenzaSection";
import { NavigatorDataProvider } from "@/components/service-navigator/data/navigator-data-context";
import styles from "./ServiceNavigatorSection.module.css";

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
    setViewMode("consulenza");
    setShowMobileFlow(false);
  };

  return (
    <section className={`service-navigator ${styles.section}`}>
      <NavigatorDataProvider data={data}>
        {/* Content */}
        <div className={styles.content}>
          <NavigatorHeader 
            activeView={viewMode}
            onViewChange={setViewMode}
          />

        {/* Desktop View */}
        <div className={styles.desktopOnly}>
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
              <ConsulenzaSection
                key="consulenza"
                contactLinks={contactLinks}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Mobile CTA */}
        <div className={styles.mobileOnly}>
          <button
            onClick={() => setShowMobileFlow(true)}
            className={styles.mobileCta}
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
