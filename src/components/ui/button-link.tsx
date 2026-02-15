import Link from "next/link"
import type { AnchorHTMLAttributes } from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/cn"
import { buttonVariants } from "@/lib/ui-variants"

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof buttonVariants> & {
    href: string
    external?: boolean
  }

export const ButtonLink = ({
  className,
  variant,
  size,
  href,
  external,
  ...props
}: ButtonLinkProps) => {
  const classes = cn(buttonVariants({ variant, size }), className)

  if (external) {
    return <a className={classes} href={href} {...props} />
  }

  return <Link className={classes} href={href} {...props} />
}
