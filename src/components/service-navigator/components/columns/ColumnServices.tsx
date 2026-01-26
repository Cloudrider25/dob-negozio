'use client'

import { motion } from "framer-motion";
import type { ServiceFinal } from "@/components/service-navigator/types/navigator";

interface ServiceCardProps {
  service: ServiceFinal;
  onSelect: () => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="navigator-box group relative p-4 rounded-lg transition-all duration-300 w-full h-full min-h-[120px] text-left flex items-center"
    >
      <div className="flex-1 space-y-2">
        <div>
          <h4 className="text-base font-medium text-text-primary leading-tight">
            {service.title}
          </h4>
          {service.description && (
            <p className="text-sm text-text-muted leading-snug">{service.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span>{service.durationMin} min</span>
          {service.price && <span>€ {service.price}</span>}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full text-[var(--text-muted)] border border-[var(--stroke)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

interface ColumnServicesProps {
  services: ServiceFinal[];
  selectedService?: ServiceFinal;
  onSelectService: (service: ServiceFinal) => void;
}

export function ColumnServices({
  services,
  selectedService,
  onSelectService,
}: ColumnServicesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3 }}
      className="navigator-column"
    >
      <div className="mb-1">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          Servizio
        </h3>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 auto-rows-[120px] max-h-[600px] overflow-y-auto overflow-x-visible">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={() => onSelectService(service)}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-text-muted text-sm">
          Nessun servizio disponibile per questa selezione
        </div>
      )}
    </motion.div>
  );
}
