import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Fraunces } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const ffMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const ffSerif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
})

const ffGraphik = localFont({
  src: [
    { path: "../fonts/graphik/GraphikLCG-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/graphik/GraphikLCG-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/graphik/GraphikLCG-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/graphik/GraphikLCG-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-graphik",
  display: "swap",
})

export const metadata: Metadata = {
  title: "REP Network",
  description: "Web3 crypto reputation platform",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#010101",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${ffMono.variable} ${ffSerif.variable} ${ffGraphik.variable}`}
    >
      <body className="rep-ambient min-h-screen font-sans antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
