'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import type { ServiceFinal } from '@/components/navigators/service-navigator/types/navigator'
import { GlassCard } from '@/components/navigators/service-navigator/components/GlassCard'
import styles from '@/components/navigators/service-navigator/components/columns/ColumnServices.module.css'

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
      className={styles.card}
    >
      <GlassCard className={styles.card} paddingClassName="">
        <div className={styles.cardInner}>
          {service.imageUrl && (
            <div className={styles.media}>
              <Image
                src={service.imageUrl}
                alt={service.title}
                fill
                sizes="96px"
                className={styles.mediaImage}
              />
            </div>
          )}

          <div className={styles.content}>
            <div className={styles.titleBlock}>
              <h4 className={styles.serviceTitle}>{service.title}</h4>
              {service.description && (
                <p className={styles.serviceDescription}>{service.description}</p>
              )}
            </div>

            <div className={styles.meta}>
              <span>{service.durationMin} min</span>
              {service.price && <span>€ {service.price}</span>}
            </div>

            <div className={styles.tags}>
              {service.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Link
              href={serviceHref}
              className={`glass-pill ${styles.pill} ${styles.pillWide}`}
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
              className={`glass-pill ${styles.pill} ${styles.pillNarrow}`}
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
      className={styles.column}
    >
      <div className={styles.heading}>
        <h3 className={styles.title}>Servizio</h3>
      </div>

      {services.length > 0 ? (
        <div className={styles.list}>
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
        <div className={styles.empty}>
          Nessun servizio disponibile per questa selezione
        </div>
      )}
    </motion.div>
  )
}
