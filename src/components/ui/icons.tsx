import type { SVGProps } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  TrashIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  PhoneIcon,
  BeakerIcon,
  ArrowRightIcon,
  FlagIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

const withSize = ({ size = 24, ...props }: IconProps) => ({
  width: size,
  height: size,
  'aria-hidden': true as const,
  ...props,
})

export const ChevronLeft = (props: IconProps) => <ChevronLeftIcon {...withSize(props)} />
export const ChevronRight = (props: IconProps) => <ChevronRightIcon {...withSize(props)} />
export const X = (props: IconProps) => <XMarkIcon {...withSize(props)} />
export const Plus = (props: IconProps) => <PlusIcon {...withSize(props)} />
export const Minus = (props: IconProps) => <MinusIcon {...withSize(props)} />
export const ShoppingBag = (props: IconProps) => <ShoppingBagIcon {...withSize(props)} />
export const Trash = (props: IconProps) => <TrashIcon {...withSize(props)} />
export const Sparkles = (props: IconProps) => <SparklesIcon {...withSize(props)} />
export const Sun = (props: IconProps) => <SunIcon {...withSize(props)} />
export const Moon = (props: IconProps) => <MoonIcon {...withSize(props)} />
export const User = (props: IconProps) => <UserIcon {...withSize(props)} />
export const Phone = (props: IconProps) => <PhoneIcon {...withSize(props)} />
export const Beaker = (props: IconProps) => <BeakerIcon {...withSize(props)} />
export const ArrowRight = (props: IconProps) => <ArrowRightIcon {...withSize(props)} />
export const Flag = (props: IconProps) => <FlagIcon {...withSize(props)} />
export const WhatsApp = (props: IconProps) => (
  <ChatBubbleOvalLeftEllipsisIcon {...withSize(props)} />
)
export const Search = (props: IconProps) => <MagnifyingGlassIcon {...withSize(props)} />
export const CircleArrowLeft = ({ size = 48, ...props }: IconProps) => (
  <ArrowLeftCircleIcon {...withSize({ size, ...props })} />
)
export const CircleArrowRight = ({ size = 48, ...props }: IconProps) => (
  <ArrowRightCircleIcon {...withSize({ size, ...props })} />
)
