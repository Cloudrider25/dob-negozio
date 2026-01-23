'use client'

import { useState } from "react";
import { motion } from "framer-motion";

type Category = "manicure" | "viso" | "epilazione";

type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  category: Category;
  tags: string[];
};

const mockServices: Service[] = [
  {
    id: "1",
    title: "Baffetti + sopracciglia",
    description: "Depilazione precisa labbro superiore e sopracciglia per un aspetto armonioso.",
    price: 50,
    duration: "15-20 min",
    category: "epilazione",
    tags: ["CERA"],
  },
  {
    id: "2",
    title: "Cera addome / Cera brasiliana",
    description: "Depilazione addome per comfort e pelle perfettamente liscia.",
    price: 40,
    duration: "65",
    category: "epilazione",
    tags: ["CERA"],
  },
  {
    id: "3",
    title: "Cera ascelle / Cera brasiliana",
    description: "Depilazione delicata ascelle per pulizia e comfort.",
    price: 25,
    duration: "10 min",
    category: "epilazione",
    tags: ["CERA"],
  },
  {
    id: "4",
    title: "Manicure professionale",
    description: "Trattamento completo con limatura, cuticole e smalto.",
    price: 35,
    duration: "45 min",
    category: "manicure",
    tags: ["MANICURE CON PROFESSIONISTA TOP DONNE"],
  },
  {
    id: "5",
    title: "Trattamento viso idratante",
    description: "Pulizia profonda e idratazione per pelle luminosa.",
    price: 80,
    duration: "60 min",
    category: "viso",
    tags: ["TRATTAMENTI VISO BASE"],
  },
  {
    id: "6",
    title: "Massaggio corpo rilassante",
    description: "Massaggio completo per rilassamento muscolare profondo.",
    price: 90,
    duration: "75 min",
    category: "viso",
    tags: ["MASSAGGI CORPO"],
  },
];

const allTags = [
  "CERA",
  "CIGLIA E SOPRACCIGLIA",
  "EPILAZIONE LASER MEDIOSTAR",
  "EXTENSION CIGLIA",
  "ICOONE LASER",
  "MANICURE CON PROFESSIONISTA TOP DONNE",
  "MANICURE DONNE",
  "MANICURE E PEDICURE UOMINI",
  "MASSAGGI CORPO",
  "MASSAGGI VISO",
  "PEDICURE DONNE",
  "PRESSOTERAPIA",
  "TRATTAMENTI VAGHEGGI",
  "TRATTAMENTI VISO BASE",
  "TRATTAMENTI VISO IS CLINICAL",
];

export function ListinoTradizionale() {
  const [activeCategory, setActiveCategory] = useState<Category>("epilazione");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredServices = mockServices.filter((service) => {
    const matchesCategory = service.category === activeCategory;
    const matchesTags =
      selectedTags.length === 0 ||
      service.tags.some((tag) => selectedTags.includes(tag));
    return matchesCategory && matchesTags;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <button
          onClick={() => setActiveCategory("manicure")}
          className={`px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
            activeCategory === "manicure"
              ? "bg-white text-black"
              : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          }`}
        >
          MANICURE
        </button>
        <button
          onClick={() => setActiveCategory("viso")}
          className={`px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
            activeCategory === "viso"
              ? "bg-white text-black"
              : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          }`}
        >
          TRATTAMENTI VISO
        </button>
        <button
          onClick={() => setActiveCategory("epilazione")}
          className={`px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
            activeCategory === "epilazione"
              ? "bg-white text-black"
              : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          }`}
        >
          EPILAZIONE LASER
        </button>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-5xl mx-auto">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
              selectedTags.includes(tag)
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            Nessun servizio trovato per i filtri selezionati
          </div>
        ) : (
          filteredServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-3">
                    {service.description}
                  </p>
                  <p className="text-sm text-white/40">
                    €{service.price} • {service.duration}
                  </p>
                </div>

                <button className="shrink-0 px-6 py-2.5 rounded-lg border border-white/20 text-white/80 text-sm font-medium hover:bg-white/5 hover:text-white hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300">
                  Book from €{service.price}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
