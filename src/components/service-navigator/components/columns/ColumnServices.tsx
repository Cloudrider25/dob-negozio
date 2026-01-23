'use client'

import { motion } from "framer-motion";
import type { ServiceFinal } from "@/components/service-navigator/types/navigator";

interface ServiceCardProps {
  service: ServiceFinal;
  isSelected: boolean;
  onSelect: () => void;
}

export function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative p-5 rounded-lg border transition-all duration-300 w-full text-left
        ${
          isSelected
            ? "bg-white/5 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            : "bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-white/20"
        }
      `}
    >
      {/* Glow effect on selected */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
      )}

      <div className="relative">
        <div className="mb-3">
          <h4 className="text-lg font-medium text-white mb-1">
            {service.title}
          </h4>
          {service.description && (
            <p className="text-sm text-white/50">{service.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-white/40 mb-3">
          <span>{service.durationMin} min</span>
          {service.price && <span>€ {service.price}</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-white/5 text-white/60 border border-white/10"
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
      className="flex flex-col gap-3"
    >
      <div className="mb-2">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
          Servizio
        </h3>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-1">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={selectedService?.id === service.id}
              onSelect={() => onSelectService(service)}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-white/40 text-sm">
          Nessun servizio disponibile per questa selezione
        </div>
      )}
    </motion.div>
  );
}