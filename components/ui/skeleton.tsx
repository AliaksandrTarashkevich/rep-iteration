import { cn } from '@/lib/utils'

// Wraps @dancingteeth/rep-design's `rep-skeleton` shimmer utility
// (rep-primitives.css). Use `rep-skeleton-circle` via className for a circular
// avatar placeholder.
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('rep-skeleton', className)}
      {...props}
    />
  )
}

export { Skeleton }
