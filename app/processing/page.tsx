"use client"

/**
 * Processing screen — the ~5–10s moment between "user just connected"
 * and "user lands on their REP profile". Pulsing accent core + thin
 * progress rail + step copy below it.
 */

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Wordmark } from "@/components/ui/wordmark"
import { Num, MonoCap } from "@/components/ui/primitives"
import { useAuth } from "@/lib/auth-context"
import { readConnectedWallet } from "@/lib/wallet"

const X_STEPS = [
  "Connecting to X",
  "Checking subscribers",
  "Analyzing TwitterScore",
  "Fetching social graph",
  "Finding your closest friends",
  "Calculating REP",
  "Finalizing profile",
]

const WALLET_STEPS = [
  "Connecting wallet",
  "Checking transactions",
  "Scanning NFT holdings",
  "Analyzing DeFi activity",
  "Fetching token balances",
  "Calculating REP",
]

const STEP_INTERVAL = 1600
const MIN_DISPLAY_TIME = 5000
const COMPLETION_HOLD = 1500
const FADE_DURATION = 500

const MOCK_FAILED_STEP = -1

type StepState = "future" | "current" | "done" | "failed"

function StepItem({
  text,
  state,
  visible,
}: {
  text: string
  state: StepState
  visible: boolean
}) {
  if (!visible) return null
  return (
    <div className="flex animate-in fade-in slide-in-from-bottom-1 items-center gap-3 duration-300">
      <div className="flex h-4 w-4 items-center justify-center">
        {state === "future" && (
          <div className="h-1.5 w-1.5 rounded-full bg-ink-faint/40" />
        )}
        {state === "current" && (
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
        )}
        {state === "done" && <Check className="h-4 w-4 text-ok" />}
        {state === "failed" && <AlertCircle className="h-4 w-4 text-warn" />}
      </div>
      <span
        className={
          state === "current"
            ? "font-mono text-[11px] uppercase tracking-[0.22em] text-ink"
            : state === "done"
              ? "font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint"
              : state === "failed"
                ? "font-mono text-[11px] uppercase tracking-[0.22em] text-warn"
                : "font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint"
        }
      >
        {text}
      </span>
    </div>
  )
}

function ProcessingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const source = searchParams.get("source") === "wallet" ? "wallet" : "x"

  const steps = source === "wallet" ? WALLET_STEPS : X_STEPS

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [visibleSteps, setVisibleSteps] = useState<number[]>([0])
  const [startTime] = useState(Date.now())
  const [complete, setComplete] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  const getStepState = useCallback(
    (index: number): StepState => {
      if (MOCK_FAILED_STEP === index) return "failed"
      if (index < currentStepIndex) return "done"
      if (index === currentStepIndex) return "current"
      return "future"
    },
    [currentStepIndex],
  )

  useEffect(() => {
    if (currentStepIndex >= steps.length && !complete) {
      setComplete(true)
    }
  }, [currentStepIndex, steps.length, complete])

  useEffect(() => {
    if (currentStepIndex < steps.length) {
      const t = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1)
        const next = currentStepIndex + 1
        if (next < steps.length) {
          setVisibleSteps((prev) =>
            prev.includes(next) ? prev : [...prev, next],
          )
        }
      }, STEP_INTERVAL)
      return () => clearTimeout(t)
    }

    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed)
    const fadeDelay = remaining + COMPLETION_HOLD - FADE_DURATION
    const goDelay = remaining + COMPLETION_HOLD

    const fade = setTimeout(() => setFadeOut(true), fadeDelay)
    const go = setTimeout(() => {
      if (source === "wallet") {
        const stored = readConnectedWallet()
        login(stored ? { walletAddress: stored.address } : undefined)
      } else {
        login()
      }
      router.push(`/stories?source=${source}`)
    }, goDelay)

    return () => {
      clearTimeout(fade)
      clearTimeout(go)
    }
  }, [currentStepIndex, steps.length, startTime, router, source, login])

  const progress = Math.min(
    100,
    Math.round((currentStepIndex / steps.length) * 100),
  )

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden rep-ambient px-6 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(140,213,254,0.12), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <Wordmark size={28} />

        <div
          className="mt-16 flex h-[260px] w-[260px] items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(140,213,254,0.18), transparent 60%)",
          }}
        >
          <div
            className="relative h-32 w-32 animate-pulse rounded-full border border-accent"
            style={{
              boxShadow:
                "0 0 80px rgba(140,213,254,0.45), inset 0 0 40px rgba(140,213,254,0.2)",
            }}
          >
            <div className="absolute inset-4 rounded-full bg-accent/20" />
          </div>
        </div>

        <div className="mt-12 w-[min(420px,calc(100vw-3rem))]">
          <div className="mb-3 flex items-baseline justify-between">
            <MonoCap size="sm">{steps[Math.min(currentStepIndex, steps.length - 1)]}</MonoCap>
            <Num className="text-[14px] text-accent">{progress}%</Num>
          </div>
          <div className="h-[2px] w-full overflow-hidden rounded bg-white/10">
            <div
              className="h-full bg-accent transition-[width] duration-300"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 12px var(--accent)",
              }}
            />
          </div>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="mt-10 flex w-[min(320px,calc(100vw-3rem))] flex-col gap-2.5"
        >
          {steps.map((step, index) => (
            <StepItem
              key={step}
              text={step}
              state={getStepState(index)}
              visible={visibleSteps.includes(index)}
            />
          ))}
        </div>

        <div className="mt-12 max-w-[460px] text-center">
          <div className="font-serif text-[16px] italic leading-[1.4] text-ink-mute md:text-[18px]">
            &ldquo;The bottleneck for the agent economy is shifting from intelligence to identity.&rdquo;
          </div>
          <div className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-ink-faint">
            — a16z crypto
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<ProcessingFallback />}>
      <ProcessingContent />
    </Suspense>
  )
}
