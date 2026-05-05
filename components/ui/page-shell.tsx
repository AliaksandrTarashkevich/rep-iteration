import * as React from "react"
import { cn } from "@/lib/utils"
import { Kicker, Title, MonoCap } from "@/components/ui/primitives"

// Page shell used by authenticated, sidebar-adjacent screens.
// Sets consistent padding, max width, and title block (kicker + H1 + subtitle).
export function PageShell({
  kicker,
  title,
  subtitle,
  action,
  className,
  children,
}: {
  kicker?: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("mx-auto max-w-[1360px] px-6 py-8 md:px-12 md:py-12", className)}>
      {(kicker || title || action) && (
        <header className="mb-10 flex items-start justify-between gap-8">
          <div>
            {kicker && (
              <div className="mb-4">
                <Kicker>{kicker}</Kicker>
              </div>
            )}
            {title && <Title className="text-[40px] md:text-[56px]">{title}</Title>}
            {subtitle && (
              <div className="mt-3 max-w-[680px] text-[18px] leading-[1.4] text-ink-mute md:text-[22px]">
                {subtitle}
              </div>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </div>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string
  title: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-line pb-3">
      <div>
        {eyebrow && (
          <MonoCap size="sm" className="mb-1.5">
            {eyebrow}
          </MonoCap>
        )}
        <div className="text-[22px] font-medium tracking-tight text-ink">{title}</div>
      </div>
      {right}
    </div>
  )
}
