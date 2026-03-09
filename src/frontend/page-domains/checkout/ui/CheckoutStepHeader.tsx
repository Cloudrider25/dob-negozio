import type { ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/shared/ui/cn'
import type { CheckoutCopy, CheckoutStep } from '@/frontend/page-domains/checkout/shared/contracts'
import styles from '@/frontend/page-domains/checkout/page/CheckoutClient.module.css'

type CheckoutStepHeaderProps = {
  activeStep: CheckoutStep
  copy: CheckoutCopy
  hasProducts: boolean
  hasServices: boolean
  mobileSummary?: ReactNode
}

export function CheckoutStepHeader({
  activeStep,
  copy,
  hasProducts,
  hasServices,
  mobileSummary,
}: CheckoutStepHeaderProps) {
  const steps = [
    { key: 'information', label: copy.stepper.information },
    ...(hasProducts ? [{ key: 'shipping' as const, label: copy.stepper.shipping }] : []),
    ...(hasServices ? [{ key: 'appointment' as const, label: copy.stepper.appointment }] : []),
    { key: 'payment' as const, label: copy.stepper.payment },
  ]

  return (
    <div className={styles.brand}>
      <div className={styles.brandLockup}>
        <span className={styles.brandMark}>
          <Image
            className={styles.logoDark}
            src="/brand/logo-black.png"
            alt=""
            width={54}
            height={54}
            priority
          />
          <Image
            className={styles.logoLight}
            src="/brand/logo-white.png"
            alt=""
            width={54}
            height={54}
            priority
          />
        </span>
        <p className={cn(styles.brandTitle, 'dob-font', 'typo-display-upper')}>DOB</p>
      </div>
      {mobileSummary}
      <div className={cn(styles.steps, 'typo-caption-upper')}>
        <span className={styles.stepItem}>{copy.stepper.cart}</span>
        {steps.map((step, index) => {
          const activeIndex = steps.findIndex((entry) => entry.key === activeStep)
          const stepIndex = index
          const stateClass =
            activeStep === step.key
              ? styles.stepItemActive
              : stepIndex < activeIndex
                ? styles.stepItemDone
                : undefined

          return (
            <span key={step.key} className={styles.stepCluster}>
              <span className={styles.stepSeparator}>›</span>
              <span className={cn(styles.stepItem, stateClass)}>{step.label}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
