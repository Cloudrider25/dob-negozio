import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@/frontend/components/ui/primitives/button'
import { cn } from '@/lib/shared/ui/cn'
import type { CheckoutCopy } from '@/frontend/page-domains/checkout/shared/contracts'
import styles from '@/frontend/page-domains/checkout/page/CheckoutClient.module.css'

type AppointmentStepProps = {
  copy: CheckoutCopy
  serviceAppointmentMode: 'requested_slot' | 'contact_later'
  setServiceAppointmentMode: Dispatch<SetStateAction<'requested_slot' | 'contact_later'>>
  serviceRequestedDate: string
  setServiceRequestedDate: Dispatch<SetStateAction<string>>
  serviceRequestedTime: string
  setServiceRequestedTime: Dispatch<SetStateAction<string>>
  isAppointmentComplete: boolean
  submitting: boolean
  onBack: () => void
  onGoToPaymentStep: () => void
  backLabel: string
}

export function AppointmentStep({
  copy,
  serviceAppointmentMode,
  setServiceAppointmentMode,
  serviceRequestedDate,
  setServiceRequestedDate,
  serviceRequestedTime,
  setServiceRequestedTime,
  isAppointmentComplete,
  submitting,
  onBack,
  onGoToPaymentStep,
  backLabel,
}: AppointmentStepProps) {
  return (
    <>
      <section className={styles.shippingMethodSection}>
        <h2 className={cn(styles.shippingMethodTitle, 'typo-h3')}>Prenotazione servizi</h2>
        <div className={styles.shippingMethodCard}>
          <div className={styles.shippingMethodList}>
            <button
              type="button"
              className={cn(
                styles.shippingMethodOption,
                serviceAppointmentMode === 'requested_slot' && styles.shippingMethodOptionActive,
              )}
              onClick={() => setServiceAppointmentMode('requested_slot')}
            >
              <div>
                <p className={cn(styles.shippingMethodName, 'typo-body-lg')}>
                  Scelgo data e ora preferita
                </p>
                <p className={cn(styles.shippingMethodEta, 'typo-body')}>Richiesta da confermare</p>
              </div>
            </button>
            <button
              type="button"
              className={cn(
                styles.shippingMethodOption,
                serviceAppointmentMode === 'contact_later' && styles.shippingMethodOptionActive,
              )}
              onClick={() => setServiceAppointmentMode('contact_later')}
            >
              <div>
                <p className={cn(styles.shippingMethodName, 'typo-body-lg')}>Vi contatto dopo</p>
                <p className={cn(styles.shippingMethodEta, 'typo-body')}>
                  Definiamo appuntamento successivamente
                </p>
              </div>
            </button>
          </div>
        </div>

        {serviceAppointmentMode === 'requested_slot' ? (
          <div className={styles.shippingMethodCard}>
            <div className={styles.splitRow}>
              <input
                className={cn(styles.input, 'typo-body')}
                type="date"
                value={serviceRequestedDate}
                onChange={(event) => setServiceRequestedDate(event.target.value)}
              />
              <input
                className={cn(styles.input, 'typo-body')}
                type="time"
                value={serviceRequestedTime}
                onChange={(event) => setServiceRequestedTime(event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </section>

      <div className={styles.actionsRow}>
        <button type="button" className={cn(styles.returnLinkButton, 'typo-body')} onClick={onBack}>
          <span className={cn(styles.returnIcon, 'typo-body-lg')}>‹</span>
          {backLabel}
        </button>
        <Button
          kind="main"
          size="md"
          type="button"
          disabled={submitting || !isAppointmentComplete}
          onClick={onGoToPaymentStep}
        >
          {copy.actions.continueToPayment}
        </Button>
      </div>
    </>
  )
}
