export type Area = string
export type Goal = string
export type Treatment = string
export type ServiceId = string

export type Step = "area" | "goal" | "treatment" | "final";

// Servizio finale
export interface ServiceFinal {
  id: ServiceId;
  title: string;
  slug?: string;
  durationMin: number;
  tags: string[];
  treatmentIds: Treatment[];
  recommendedForGoal?: Goal[];
  bookingSlug?: string; // TODO: collegare con sistema booking
  description?: string;
  price?: number; // TODO: collegare con listino reale
  imageUrl?: string;
}

// Servizio selezionato con contesto completo
export interface SelectedServiceItem {
  area: Area;
  goal?: Goal;
  treatment: Treatment;
  service: ServiceFinal;
}

// Stato del navigator
export interface NavigatorState {
  step: Step;
  selectedArea?: Area;
  selectedGoal?: Goal;
  selectedTreatment?: Treatment;
  selectedService?: ServiceFinal;
  cart: SelectedServiceItem[]; // Servizi aggiunti al carrello
}

// Dati per le aree
export interface AreaData {
  id: Area;
  label: string;
  icon?: string;
  description?: string;
  subtitle?: string;
  imageUrl?: string;
  features?: string[];
  cardTitle?: string;
  cardTagline?: string;
  cardDescription?: string;
  slug?: string;
}

// Dati per i goals
export interface GoalData {
  id: Goal;
  label: string;
  description?: string;
  subtitle?: string;
  benefits?: string[];
  areaId?: Area;
  imageUrl?: string;
  cardTitle?: string;
  cardTagline?: string;
  cardDescription?: string;
  slug?: string;
}

// Dati per i treatments
export interface TreatmentData {
  id: Treatment;
  label: string;
  description?: string;
  subtitle?: string;
  imageUrl?: string;
  features?: string[];
  referenceIds: string[];
  cardTitle?: string;
  cardTagline?: string;
  cardDescription?: string;
  slug?: string;
  badge?: {
    label: string;
    type: "best-seller" | "economico" | "duraturo" | "novita" | "premium";
  };
}
