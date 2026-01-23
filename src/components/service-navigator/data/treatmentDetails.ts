import type { TreatmentDetails } from "@/components/service-navigator/components/TreatmentHoverCard";

export const TREATMENT_DETAILS: Record<string, TreatmentDetails> = {
  laser: {
    id: "laser",
    title: "MedioStar Red Edition",
    subtitle: "Epilazione Laser Permanente",
    description:
      "Sistema laser a diodo di ultima generazione per epilazione permanente progressiva. Tecnologia indolore con raffreddamento integrato, adatta a tutti i fototipi.",
    imageUrl:
      "https://images.unsplash.com/photo-1682663947127-ac9d59d7f312?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwbGFzZXIlMjB0cmVhdG1lbnQlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzY5MDcxMTY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Risultati permanenti progressivi",
      "Tecnologia indolore con raffreddamento",
      "Adatto a tutti i fototipi",
      "Sessioni rapide e confortevoli",
    ],
  },

  ceretta: {
    id: "ceretta",
    title: "Elastique",
    subtitle: "Ceretta Professionale Premium",
    description:
      "Cera liposolubile di nuova generazione a bassa temperatura. Formula elastica e delicata che rispetta la pelle, riducendo rossori e irritazioni.",
    imageUrl:
      "https://images.unsplash.com/photo-1752313383425-dbb686dcc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXglMjBkZXBpbGF0aW9uJTIwYmVhdXR5fGVufDF8fHx8MTc2OTA3MTE2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Cera liposolubile a bassa temperatura",
      "Formula elastica e delicata",
      "Riduce rossori e irritazioni",
      "Risultato liscio fino a 4 settimane",
    ],
  },

  hydrafacial: {
    id: "hydrafacial",
    title: "HydraFacial MD",
    subtitle: "Pulizia Profonda & Idratazione",
    description:
      "Trattamento brevettato in 3 fasi: pulizia, estrazione ed idratazione con sieri personalizzati. Risultati visibili immediati per una pelle luminosa e rivitalizzata.",
    imageUrl:
      "https://images.unsplash.com/photo-1665791566033-83bdc55a42c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWRyYWZhY2lhbCUyMHNraW5jYXJlJTIwdHJlYXRtZW50fGVufDF8fHx8MTc2OTA3MTE2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Pulizia profonda non invasiva",
      "Estrazione di impurità senza dolore",
      "Idratazione con sieri personalizzati",
      "Risultati visibili immediati",
    ],
  },

  radiofrequenza: {
    id: "radiofrequenza",
    title: "Radiofrequency Pro",
    subtitle: "Stimolazione Collagene & Lifting",
    description:
      "Tecnologia a radiofrequenza monopolare per stimolare la produzione di collagene. Effetto lifting naturale e progressivo con risultati duraturi nel tempo.",
    imageUrl:
      "https://images.unsplash.com/photo-1691333367319-5ad90fcdee14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpb2ZyZXF1ZW5jeSUyMGJlYXV0eSUyMGRldmljZXxlbnwxfHx8fDE3NjkwNzExNjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Stimola produzione naturale di collagene",
      "Effetto lifting progressivo e duraturo",
      "Trattamento non invasivo e indolore",
      "Risultati visibili dopo 4-6 sessioni",
    ],
  },

  ultrasuoni: {
    id: "ultrasuoni",
    title: "Ultrasound Lift",
    subtitle: "Trattamento Ultrasuoni Microfocalizzati",
    description:
      "Tecnologia HIFU (High Intensity Focused Ultrasound) per lifting profondo. Agisce sugli strati dermici senza chirurgia per risultati anti-età naturali.",
    imageUrl:
      "https://images.unsplash.com/photo-1663229049147-30f47be043ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bHRyYXNvdW5kJTIwZmFjaWFsJTIwdHJlYXRtZW50fGVufDF8fHx8MTc2OTA3MTE2OHww&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Lifting profondo senza chirurgia",
      "Tecnologia HIFU microfocalizzata",
      "Stimola rigenerazione tissutale",
      "Risultati progressivi fino a 6 mesi",
    ],
  },

  manuale: {
    id: "manuale",
    title: "Trattamento Manuale",
    subtitle: "Tecniche Estetiche Tradizionali",
    description:
      "Trattamento viso manuale con tecniche tradizionali: pulizia profonda, massaggio, maschera personalizzata. L'esperienza classica per la cura del viso.",
    imageUrl:
      "https://images.unsplash.com/photo-1722350766824-f8520e9676ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW51YWwlMjBmYWNpYWwlMjBtYXNzYWdlfGVufDF8fHx8MTc2OTA3MTE3MXww&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Pulizia viso profonda manuale",
      "Massaggio rilassante e tonificante",
      "Maschera personalizzata per tipo di pelle",
      "Esperienza rilassante e rigenerante",
    ],
  },

  icoone: {
    id: "icoone",
    title: "Icoone Laser",
    subtitle: "Multi Micro Alveolar Stimulation",
    description:
      "Tecnologia brevettata MMAS con oltre 21.000 micro-stimolazioni al minuto. Trattamento corpo completo per cellulite, rimodellamento e tonificazione profonda.",
    imageUrl:
      "https://images.unsplash.com/photo-1632057828761-4944fab0600e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2R5JTIwc2N1bHB0aW5nJTIwbWFjaGluZXxlbnwxfHx8fDE3NjkwNzExNzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "21.000+ micro-stimolazioni al minuto",
      "Tecnologia MMAS brevettata",
      "Risultati visibili da prima seduta",
      "Trattamento completo viso e corpo",
    ],
  },

  relax: {
    id: "relax",
    title: "Massaggio Relax",
    subtitle: "Benessere & Rilassamento",
    description:
      "Massaggio rilassante total body con oli essenziali selezionati. Tecniche dolci per sciogliere tensioni, ridurre stress e favorire il benessere psico-fisico.",
    imageUrl:
      "https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYXNzYWdlJTIwdGhlcmFweXxlbnwxfHx8fDE3NjkwNTg2MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Massaggio total body rilassante",
      "Oli essenziali naturali selezionati",
      "Tecniche dolci anti-stress",
      "Favorisce il benessere psico-fisico",
    ],
  },

  decontrattura: {
    id: "decontrattura",
    title: "Massaggio Decontratturante",
    subtitle: "Sciogliere Tensioni Muscolari",
    description:
      "Massaggio terapeutico profondo per sciogliere contratture e tensioni muscolari. Tecniche specifiche per recuperare mobilità e alleviare dolori localizzati.",
    imageUrl:
      "https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYXNzYWdlJTIwdGhlcmFweXxlbnwxfHx8fDE3NjkwNTg2MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Massaggio terapeutico profondo",
      "Scioglie contratture muscolari",
      "Allevia dolori localizzati",
      "Recupera mobilità e flessibilità",
    ],
  },

  drenaggio: {
    id: "drenaggio",
    title: "Drenaggio Linfatico",
    subtitle: "Metodo Vodder Manuale",
    description:
      "Massaggio linfodrenante manuale secondo metodo Vodder. Favorisce il drenaggio dei liquidi, riduce ritenzione idrica e gonfiore per gambe leggere.",
    imageUrl:
      "https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYXNzYWdlJTIwdGhlcmFweXxlbnwxfHx8fDE3NjkwNTg2MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Metodo Vodder certificato",
      "Riduce ritenzione idrica e gonfiore",
      "Favorisce circolazione linfatica",
      "Gambe leggere e sgonfie",
    ],
  },

  recovery: {
    id: "recovery",
    title: "Recovery Sportivo",
    subtitle: "Recupero Post-Allenamento",
    description:
      "Massaggio sportivo specifico per recupero muscolare post-allenamento. Tecniche profonde per ridurre acido lattico, prevenire infortuni e migliorare performance.",
    imageUrl:
      "https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYXNzYWdlJTIwdGhlcmFweXxlbnwxfHx8fDE3NjkwNTg2MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Massaggio sportivo specifico",
      "Riduce acido lattico",
      "Previene infortuni muscolari",
      "Migliora recupero e performance",
    ],
  },
};
