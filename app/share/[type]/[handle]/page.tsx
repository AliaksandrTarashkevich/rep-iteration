/**
 * Public share landing page for a given story.
 *
 * Purpose:
 *   - Provide the URL that's posted in X tweets
 *     (`/share/{type}/{handle}`). When Twitter scrapes this page it
 *     fetches the `og:image` which points at the dynamic `/api/og/story`
 *     route, so the tweet auto-previews the card.
 *   - Present a clean landing for humans clicking the link: the stat,
 *     tagline, and a CTA back into the app.
 *
 * This is a server component so `generateMetadata` can emit the correct
 * OG / Twitter tags per handle + story type.
 */

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  STORY_SHARE_INFO,
  getStoryPageTitle,
  isStoryType,
  type StoryType,
} from "@/lib/story-share"

interface Params {
  type: string
  handle: string
}

// In Next.js 16, route params are async.
type RouteProps = { params: Promise<Params> }

function getAbsoluteBaseUrl(): string {
  // Prefer the explicit site URL if configured, then Vercel's auto-var,
  // then fall back to localhost for dev. The OG image URL must be
  // absolute — relative paths aren't scraped by social crawlers.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, "")
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return "http://localhost:3000"
}

function buildOgUrl(type: StoryType, handle: string): string {
  const base = getAbsoluteBaseUrl()
  const params = new URLSearchParams({ type, handle })
  return `${base}/api/og/story?${params.toString()}`
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { type, handle } = await params
  if (!isStoryType(type)) return { title: "REP" }

  const info = STORY_SHARE_INFO[type]
  const title = getStoryPageTitle(type, handle)
  const description = info.tagline
  const ogUrl = buildOgUrl(type, handle)
  const ogSquareUrl = `${ogUrl}&w=1080&h=1080`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "REP",
      images: [
        { url: ogUrl, width: 1200, height: 630, alt: title },
        { url: ogSquareUrl, width: 1080, height: 1080, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  }
}

export default async function StorySharePage({ params }: RouteProps) {
  const { type, handle } = await params
  if (!isStoryType(type)) notFound()

  const info = STORY_SHARE_INFO[type]
  const ogUrl = buildOgUrl(type, handle)

  return (
    <main className="relative min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-10 px-6 py-16">
        {/* Preview the exact OG image users will see in X. */}
        <div className="silver-border-card w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogUrl}
            alt={`@${handle}'s ${info.label}`}
            className="block h-auto w-full"
            width={1200}
            height={630}
          />
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="font-mono text-xs tracking-[0.22em] text-muted-foreground">
            {info.label.toUpperCase()}
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-foreground">
            @{handle}&apos;s {info.label}
          </h1>
          <p className="pull-quote-mint max-w-xl text-balance text-lg">
            {info.tagline}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          Claim your REP
        </Link>

        <div className="rep-watermark">
          Verified by REP
          <span className="rep-watermark-dot" />
          r3p.xyz
        </div>
      </div>
    </main>
  )
}
