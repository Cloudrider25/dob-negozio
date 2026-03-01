import type { ReactNode } from 'react'
import { Phone, WhatsApp, type IconProps } from '@/components/ui/icons'
import styles from './ConsultationForm.module.css'

type IconComponent = (props: IconProps) => ReactNode

type ContactButton = {
  href: string
  label: string
  value: string
  iconClassName: string
  Icon: IconComponent
  external?: boolean
}

type ContactActionsProps = {
  phoneLink: string
  whatsappLink: string
  phoneDisplay: string
  whatsappDisplay: string
}

const CONTACT_BUTTONS = ({
  phoneLink,
  whatsappLink,
  phoneDisplay,
  whatsappDisplay,
}: ContactActionsProps): ContactButton[] => [
  {
    href: phoneLink,
    label: 'Chiamaci',
    value: phoneDisplay,
    iconClassName: styles.contactIcon,
    Icon: Phone,
  },
  {
    href: whatsappLink,
    label: 'Scrivici su',
    value: whatsappDisplay,
    iconClassName: styles.contactIconWhatsapp,
    external: true,
    Icon: WhatsApp,
  },
]

export function ContactActions(props: ContactActionsProps) {
  return (
    <div className={styles.contactRow}>
      {CONTACT_BUTTONS(props).map(({ href, label, value, iconClassName, Icon, external }) => (
        <a
          key={label}
          href={href}
          className={styles.contactButton}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          <div className={styles.contactIconWrap}>
            <Icon className={iconClassName} />
          </div>
          <div className={styles.contactText}>
            <div className={`${styles.contactLabel} typo-small`}>{label}</div>
            <div className={`${styles.contactValue} typo-body`}>{value}</div>
          </div>
        </a>
      ))}
    </div>
  )
}
