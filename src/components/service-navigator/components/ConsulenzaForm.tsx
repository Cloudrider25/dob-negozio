'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/service-navigator/components/GlassCard";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skinType: string;
  concerns: string[];
  message: string;
};

const skinTypes = [
  { id: "normale", label: "Normale" },
  { id: "secca", label: "Secca" },
  { id: "grassa", label: "Grassa" },
  { id: "mista", label: "Mista" },
  { id: "sensibile", label: "Sensibile" },
];

const skinConcerns = [
  "Acne",
  "Rughe e linee sottili",
  "Macchie e iperpigmentazione",
  "Pelle opaca",
  "Pori dilatati",
  "Rossore e couperose",
  "Perdita di elasticità",
  "Borse e occhiaie",
];

export function ConsulenzaForm({
  phoneLink,
  whatsappLink,
  phoneDisplay,
  whatsappDisplay,
}: {
  phoneLink: string;
  whatsappLink: string;
  phoneDisplay: string;
  whatsappDisplay: string;
}) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    skinType: "",
    concerns: [],
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Collegare con sistema backend
    console.log("Form submitted:", formData);
    alert(
      `Richiesta di consulenza inviata!\n\nNome: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nTipo di pelle: ${formData.skinType}\nPreoccupazioni: ${formData.concerns.join(", ")}`
    );
  };

  const toggleConcern = (concern: string) => {
    setFormData((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header Section */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/40 mb-6"
        >
          <svg
            className="w-10 h-10 text-cyan-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl font-light text-text-primary mb-3"
        >
          Skin Analyzer & Consulenza Personalizzata
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-text-secondary max-w-2xl mx-auto"
        >
          Compila il form per richiedere un&apos;analisi professionale della tua
          pelle e ricevere una consulenza personalizzata con i nostri esperti.
        </motion.p>
      </div>

      {/* Contact Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
      >
        {/* Chiamaci Button */}
        <a href={phoneLink} className="w-full sm:w-auto">
          <GlassCard paddingClassName="flex items-center gap-3 px-6 py-3 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 transition-all duration-300">
              <svg
                className="w-5 h-5 text-accent-cyan"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm text-text-muted font-medium">Chiamaci</div>
              <div className="text-base text-text-primary font-medium">{phoneDisplay}</div>
            </div>
          </GlassCard>
        </a>

        {/* WhatsApp Button */}
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <GlassCard paddingClassName="flex items-center gap-3 px-6 py-3 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 group-hover:bg-green-500/20 transition-all duration-300">
              <svg
                className="w-5 h-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm text-text-muted font-medium">Scrivici su</div>
              <div className="text-base text-text-primary font-medium">{whatsappDisplay}</div>
            </div>
          </GlassCard>
        </a>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stroke"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-sm text-text-muted bg-paper">oppure</span>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="rounded-2xl"
      >
        <GlassCard paddingClassName="p-8 space-y-8">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-cyan" />
            Informazioni Personali
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-paper border border-stroke text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all duration-300"
                placeholder="Il tuo nome"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Cognome *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-paper border border-stroke text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all duration-300"
                placeholder="Il tuo cognome"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-paper border border-stroke text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all duration-300"
                placeholder="email@esempio.com"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Telefono *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-paper border border-stroke text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all duration-300"
                placeholder="+39 123 456 7890"
              />
            </div>
          </div>
        </div>

        {/* Skin Type */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-cyan" />
            Tipo di Pelle *
          </h3>
          <div className="flex flex-wrap gap-3">
            {skinTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, skinType: type.id })}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  formData.skinType === type.id
                    ? "border-accent-cyan bg-paper text-accent-cyan shadow-soft"
                    : "border-stroke bg-paper text-text-secondary"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skin Concerns */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-cyan" />
            Preoccupazioni della Pelle
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Seleziona una o più problematiche (opzionale)
          </p>
          <div className="flex flex-wrap gap-2">
            {skinConcerns.map((concern) => (
              <button
                key={concern}
                type="button"
                onClick={() => toggleConcern(concern)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${
                  formData.concerns.includes(concern)
                    ? "border-accent-cyan bg-paper text-accent-cyan"
                    : "border-stroke bg-paper text-text-muted"
                }`}
              >
                {concern}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-cyan" />
            Note Aggiuntive
          </h3>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows={5}
            className="w-full px-4 py-3 rounded-lg bg-paper border border-stroke text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all duration-300 resize-none"
            placeholder="Raccontaci di più sulle tue esigenze, obiettivi o domande specifiche..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-center pt-4">
          <button
            type="submit"
            className="button-base group relative px-12 py-4 font-medium bg-accent-cyan text-text-inverse overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Invia Richiesta di Consulenza
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            <span className="absolute inset-0 bg-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
        </GlassCard>
      </motion.form>

      {/* Info Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-sm text-text-muted"
      >
        <p>
          Riceverai una risposta entro 24 ore. I tuoi dati saranno trattati in
          conformità con la nostra Privacy Policy.
        </p>
      </motion.div>
    </motion.div>
  );
}
