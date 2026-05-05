import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-md px-3 py-2 text-base md:text-sm transition-colors outline-none',
        'bg-card-bg border border-line text-ink placeholder:text-ink-faint',
        'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
        'aria-invalid:border-bad aria-invalid:ring-2 aria-invalid:ring-bad/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
