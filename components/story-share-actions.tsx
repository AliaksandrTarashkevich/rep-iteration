"use client"

import { useEffect, useRef, useState } from "react"
import { Share2, Twitter, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StoryShareActionsProps {
  /** Stat line, e.g. "448 smart followers". Ignored when `shareText` is set. */
  stat?: string
  /** Memorable tagline / pull quote. Ignored when `shareText` is set. */
  tagline?: string
  /** Full pre-composed share copy. Wins over stat+tagline when present. */
  shareText?: string
  /** Handle used in the rep.xyz URL tail. */
  handle: string
  /** Visual variant - inline (full-width button pair) or icon (top-right). */
  variant?: "inline" | "icon"
  /**
   * Story type id (e.g. "smart-followers"). When supplied, the X intent
   * is opened with a `url` param pointing to the `/share/{storyId}/{handle}`
   * landing page, which serves an OG image via `/api/og/story`. Twitter
   * auto-expands this into a rich preview card.
   */
  storyId?: string
}

/**
 * Two-action share control: "Share to X" opens an X intent with the
 * pre-filled stat + tagline + rep.xyz/handle link; "Save Image" is the
 * mock screenshot export (shows a local toast on success, as per spec).
 *
 * Both variants share the same underlying logic so any story slide can
 * use either the inline footer or the top-right icon version.
 */
export function StoryShareActions({
  stat,
  tagline,
  shareText,
  handle,
  variant = "inline",
  storyId,
}: StoryShareActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Auto-dismiss the toast after 1.8s.
  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 1800)
    return () => clearTimeout(t)
  }, [toastMsg])

  // Close the icon-variant popover when the user clicks outside of it.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [menuOpen])

  const composeText = () => shareText ?? `${stat ?? ""} - ${tagline ?? ""}`

  /**
   * Build the public share URL for this story. We prefer the current
   * page origin at runtime so previews work in dev / preview / prod.
   * If `storyId` isn't supplied we just fall back to copying the text.
   */
  const composeShareUrl = (): string | null => {
    if (!storyId) return null
    const origin =
      typeof window !== "undefined" ? window.location.origin : ""
    return `${origin}/share/${storyId}/${handle}`
  }

  const handleShareX = () => {
    const text = composeText()
    const shareUrl = composeShareUrl()

    // Copy the composed text so users with a clipboard manager / mobile
    // share sheet can paste it alongside any screenshot.
    try {
      void navigator.clipboard?.writeText(
        shareUrl ? `${text} ${shareUrl}` : text,
      )
    } catch {
      /* clipboard unavailable — intent still fires */
    }

    const intentParams = new URLSearchParams({ text })
    if (shareUrl) {
      // Twitter auto-fetches the OG image from this URL and builds a
      // rich `summary_large_image` card beneath the tweet copy.
      intentParams.set("url", shareUrl)
    }

    window.open(
      `https://twitter.com/intent/tweet?${intentParams.toString()}`,
      "_blank",
      "noopener,noreferrer",
    )
    setToastMsg("Copied & opening X")
    setMenuOpen(false)
  }

  const handleSaveImage = () => {
    // Mocked per spec — image generation is wired in a follow-up.
    setToastMsg("Saved to device")
    setMenuOpen(false)
  }

  if (variant === "icon") {
    return (
      <div ref={rootRef} className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground/70 hover:text-foreground"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Share this card"
          aria-expanded={menuOpen}
        >
          <Share2 className="h-5 w-5" />
        </Button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-border/70 bg-background/95 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <button
              role="menuitem"
              onClick={handleShareX}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted/60"
            >
              <Twitter className="h-4 w-4 text-primary" />
              Share to X
            </button>
            <div className="h-px bg-border/50" />
            <button
              role="menuitem"
              onClick={handleSaveImage}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted/60"
            >
              <Download className="h-4 w-4 text-positive" />
              Save Image
            </button>
          </div>
        )}

        {toastMsg && (
          <div
            role="status"
            aria-live="polite"
            className="absolute right-0 top-11 z-30 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-positive/40 bg-background/95 px-3 py-2 text-xs font-medium text-positive shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <Check className="h-3.5 w-3.5" />
            {toastMsg}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="border-border/70 bg-background/30"
          onClick={handleShareX}
        >
          <Twitter className="mr-2 h-4 w-4 text-primary" />
          Share to X
        </Button>
        <Button
          variant="outline"
          className="border-border/70 bg-background/30"
          onClick={handleSaveImage}
        >
          <Download className="mr-2 h-4 w-4 text-positive" />
          Save Image
        </Button>
      </div>

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute -top-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-lg border border-positive/40 bg-background/95 px-3 py-1.5 text-xs font-medium text-positive shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-1 duration-150"
        >
          <Check className="h-3.5 w-3.5" />
          {toastMsg}
        </div>
      )}
    </div>
  )
}
