import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-md px-4 py-2 text-base md:text-sm transition-colors outline-none',
        'bg-card-bg border border-line text-ink placeholder:text-ink-faint',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink',
        'selection:bg-accent selection:text-[#021319]',
        'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
        'aria-invalid:border-bad aria-invalid:ring-2 aria-invalid:ring-bad/30',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
