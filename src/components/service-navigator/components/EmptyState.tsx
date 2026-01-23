'use client'

import { Sparkles } from "@/components/service-navigator/icons";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-4 text-white/20">
        {icon || <Sparkles className="w-12 h-12" />}
      </div>
      <h3 className="text-lg font-medium text-white/60 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/40 max-w-sm">{description}</p>
      )}
    </div>
  );
}
