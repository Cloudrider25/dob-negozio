import type { ButtonHTMLAttributes } from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/cn"
import { buttonVariants } from "@/lib/ui-variants"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
