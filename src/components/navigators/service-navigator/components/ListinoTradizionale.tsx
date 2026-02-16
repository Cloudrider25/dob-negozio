'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/navigators/service-navigator/components/GlassCard";
import styles from "@/components/navigators/service-navigator/components/ListinoTradizionale.module.css";

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
      className={styles.wrapper}
    >
      {/* Category Tabs */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveCategory("manicure")}
          className={`button-base ${styles.tabButton} ${
            activeCategory === "manicure" ? styles.tabActive : styles.tabInactive
          }`}
        >
          MANICURE
        </button>
        <button
          onClick={() => setActiveCategory("viso")}
          className={`button-base ${styles.tabButton} ${
            activeCategory === "viso" ? styles.tabActive : styles.tabInactive
          }`}
        >
          TRATTAMENTI VISO
        </button>
        <button
          onClick={() => setActiveCategory("epilazione")}
          className={`button-base ${styles.tabButton} ${
            activeCategory === "epilazione" ? styles.tabActive : styles.tabInactive
          }`}
        >
          EPILAZIONE LASER
        </button>
      </div>

      {/* Filter Tags */}
      <div className={styles.tags}>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`${styles.tagButton} ${
              selectedTags.includes(tag) ? styles.tagActive : ""
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className={styles.list}>
        {filteredServices.length === 0 ? (
          <div className={styles.empty}>
            Nessun servizio trovato per i filtri selezionati
          </div>
        ) : (
          filteredServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className={styles.card} paddingClassName={styles.cardPadding}>
                <div className={styles.cardContent}>
                  <div className={styles.cardText}>
                    <h3 className={styles.cardTitle}>
                      {service.title}
                    </h3>
                    <p className={styles.cardDescription}>
                      {service.description}
                    </p>
                    <p className={styles.cardMeta}>
                      €{service.price} • {service.duration}
                    </p>
                  </div>

                  <button className={`button-base ${styles.bookButton}`}>
                    Book from €{service.price}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
