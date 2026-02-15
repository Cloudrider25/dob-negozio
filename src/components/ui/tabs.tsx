import type { ButtonHTMLAttributes } from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/cn"
import { tabsVariants } from "@/lib/ui-variants"

type TabsProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof tabsVariants>

export const TabsTrigger = ({ className, state, ...props }: TabsProps) => {
  return <button className={cn(tabsVariants({ state }), className)} {...props} />
}
