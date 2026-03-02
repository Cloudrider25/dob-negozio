import type { AccountSection, ProductSort, ServicesFilter, ServicesSubFilter } from './types'

export type AccountMenuEntry =
  | {
      kind: 'tab'
      section: AccountSection
      label: string
      fullWidth?: boolean
    }
  | {
      kind: 'divider'
      label: string
    }

export const PRODUCT_SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: 'newest', label: 'Più recenti' },
  { value: 'oldest', label: 'Meno recenti' },
  { value: 'total_desc', label: 'Totale alto-basso' },
  { value: 'total_asc', label: 'Totale basso-alto' },
]

export const SERVICES_PRIMARY_OPTIONS: Array<{ value: ServicesFilter; label: string }> = [
  { value: 'not_used', label: 'Non usufruiti' },
  { value: 'used', label: 'Usufruiti' },
]

export const SERVICES_SUB_OPTIONS: Array<{ value: ServicesSubFilter; label: string }> = [
  { value: 'all', label: 'Tutti' },
  { value: 'requested_date', label: 'Data richiesta' },
  { value: 'awaiting_confirmation', label: 'In attesa di conferma' },
  { value: 'date_to_request', label: 'Data da richiedere' },
  { value: 'confirmed_date', label: 'Data confermata' },
]

export const getAccountMenuEntries = (addressesLabel: string): AccountMenuEntry[] => [
  { kind: 'tab', section: 'overview', label: 'Account' },
  { kind: 'tab', section: 'addresses', label: addressesLabel },
  { kind: 'tab', section: 'aesthetic', label: 'Cartella Estetica', fullWidth: true },
  { kind: 'divider', label: 'Ordini' },
  { kind: 'tab', section: 'services', label: 'Servizi' },
  { kind: 'tab', section: 'orders', label: 'Prodotti' },
]

