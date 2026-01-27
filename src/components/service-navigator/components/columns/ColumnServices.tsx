'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import type { ServiceFinal } from '@/components/service-navigator/types/navigator'
import { GlassCard } from '@/components/service-navigator/components/GlassCard'

interface ServiceCardProps {
  service: ServiceFinal
  onSelect: () => void
  onAddToCart: (service: ServiceFinal) => void
}

export function ServiceCard({ service, onSelect, onAddToCart }: ServiceCardProps) {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale ?? 'it'
  const serviceHref = service.slug ? `/${locale}/services/service/${service.slug}` : '#'
  return (
    <motion.div
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
      className="group relative rounded-lg transition-all duration-300 w-full h-full min-h-[120px] text-left"
    >
      <GlassCard className="w-full min-h-[120px] max-h-[120px]" paddingClassName="">
        <div className="flex items-stretch gap-4 h-full">
          {service.imageUrl && (
            <div className="relative shrink-0 self-stretch w-24 min-h-[120px] overflow-hidden">
              <Image
                src={service.imageUrl}
                alt={service.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          )}

          <div className="flex-1 space-y-2 p-4">
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

          <div className="flex flex-col items-end justify-center gap-2 pr-4">
            <Link
              href={serviceHref}
              className="glass-pill text-xs text-text-primary"
              onClick={(event) => {
                event.stopPropagation()
                if (!service.slug) event.preventDefault()
              }}
            >
              Scopri di più
            </Link>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onAddToCart(service)
              }}
              className="glass-pill text-xs text-text-primary"
            >
              Aggiungi al carrello
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

interface ColumnServicesProps {
  services: ServiceFinal[]
  selectedService?: ServiceFinal
  onSelectService: (service: ServiceFinal) => void
  onAddToCartService: (service: ServiceFinal) => void
}

export function ColumnServices({
  services,
  selectedService: _selectedService,
  onSelectService,
  onAddToCartService,
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
        <div className="space-y-3 max-h-[600px] overflow-y-auto overflow-x-visible bg-transparent">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={() => onSelectService(service)}
              onAddToCart={onAddToCartService}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-text-muted text-sm">
          Nessun servizio disponibile per questa selezione
        </div>
      )}
    </motion.div>
  )
}
