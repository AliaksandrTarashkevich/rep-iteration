import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0 transition-colors [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:ring-accent/40 focus-visible:ring-2 outline-none',
  {
    variants: {
      variant: {
        default: 'chip chip--accent',
        secondary: 'chip',
        destructive:
          'chip border-bad/40 bg-bad/10 text-bad',
        outline: 'chip border-line-strong bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
