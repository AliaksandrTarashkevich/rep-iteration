import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium cursor-pointer transition-opacity disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-accent/40 focus-visible:ring-2 aria-invalid:ring-bad/30 aria-invalid:border-bad",
  {
    variants: {
      variant: {
        default:
          'bg-accent text-[#021319] font-semibold hover:opacity-90',
        destructive:
          'bg-bad text-white hover:opacity-90 focus-visible:ring-bad/30',
        outline:
          'bg-transparent border border-line-strong text-ink hover:bg-card-bg',
        secondary:
          'bg-card-bg border border-line text-ink hover:bg-card-bg-2',
        ghost:
          'bg-transparent text-ink-mute hover:text-ink hover:bg-card-bg',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2 has-[>svg]:px-4',
        sm: 'h-8 rounded-full gap-1.5 px-4 has-[>svg]:px-3 text-xs',
        lg: 'h-12 rounded-full px-8 has-[>svg]:px-6',
        icon: 'size-10 rounded-full',
        'icon-sm': 'size-8 rounded-full',
        'icon-lg': 'size-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
