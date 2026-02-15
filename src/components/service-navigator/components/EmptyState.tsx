'use client'

import { Sparkles } from "@/components/service-navigator/icons";
import styles from "@/components/service-navigator/components/EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        {icon || <Sparkles className={styles.iconSvg} />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
