import type { ComponentProps } from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/cn"
import { cardVariants } from "@/lib/ui-variants"

type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>

export const Card = ({ className, variant, padding, ...props }: CardProps) => {
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
}
