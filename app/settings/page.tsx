"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Link2, 
  Twitter, 
  Wallet, 
  MessageCircle, 
  Check, 
  Plus,
  LogOut,
  Trash2,
  ExternalLink,
  AlertTriangle
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { SectionTitle } from "@/components/ui/primitives"

// Platform icon component
function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "twitter":
      return <Twitter className="h-5 w-5" />
    case "wallet":
      return <Wallet className="h-5 w-5" />
    case "telegram":
      return <MessageCircle className="h-5 w-5" />
    default:
      return <Link2 className="h-5 w-5" />
  }
}

// Connected Account Card
// Per user request: only show icons for connected items, not for unconnected ones
function AccountCard({ 
  platform, 
  name, 
  handle, 
  connected, 
  comingSoon,
  onConnect,
  onDisconnect
}: { 
  platform: string
  name: string
  handle?: string
  connected: boolean
  comingSoon?: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  const [showDisconnect, setShowDisconnect] = useState(false)

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
      connected 
        ? "bg-muted/30 border-positive/20" 
        : comingSoon 
        ? "bg-muted/10 border-border opacity-60"
        : "bg-muted/20 border-border hover:border-primary/30"
    }`}>
      <div className="flex items-center gap-4">
        {/* Only show icon for connected items */}
        {connected && (
          <div className="p-3 rounded-lg bg-positive/20 text-positive">
            <PlatformIcon platform={platform} />
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{name}</p>
          {connected && handle && (
            <p className="text-sm text-muted-foreground">{handle}</p>
          )}
          {comingSoon && (
            <p className="text-xs text-muted-foreground">Coming soon</p>
          )}
        </div>
      </div>

      {connected ? (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-positive">
            <Check className="h-4 w-4" />
            Connected
          </span>
          {!showDisconnect ? (
            <button 
              onClick={() => setShowDisconnect(true)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => {
                onDisconnect()
                setShowDisconnect(false)
              }}
            >
              Disconnect
            </Button>
          )}
        </div>
      ) : comingSoon ? (
        <span className="text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full bg-muted">
          SOON
        </span>
      ) : (
        <Button size="sm" variant="outline" onClick={onConnect}>
          <Plus className="h-4 w-4 mr-1" />
          Connect
        </Button>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, connections, hasTwitter, hasWallet, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    // Simulate logout
    await new Promise(resolve => setTimeout(resolve, 500))
    logout()
    router.push("/")
  }

  const handleConnect = (_platform: string) => {
    // Mock connect - in production would trigger OAuth flow
  }

  const handleDisconnect = (_platform: string) => {
    // Mock disconnect
  }

  // Group connections
  const primaryAccounts = connections.filter(c => ["twitter", "wallet"].includes(c.platform))
  const additionalAccounts = connections.filter(c => !["twitter", "wallet"].includes(c.platform))

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <SectionTitle as="h1">SETTINGS</SectionTitle>
      </div>

      {/* Connected Accounts Section */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Connected Accounts
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Connect accounts to build your reputation graph and unlock achievements.
        </p>

        <div className="space-y-3">
          {/* Primary accounts (X and Wallet) */}
          <AccountCard
            platform="twitter"
            name="X (Twitter)"
            handle={hasTwitter ? `@${user?.handle}` : undefined}
            connected={hasTwitter}
            onConnect={() => handleConnect("twitter")}
            onDisconnect={() => handleDisconnect("twitter")}
          />
          
          <AccountCard
            platform="wallet"
            name="Wallet"
            handle={hasWallet ? user?.walletAddress : undefined}
            connected={hasWallet}
            onConnect={() => handleConnect("wallet")}
            onDisconnect={() => handleDisconnect("wallet")}
          />
        </div>

        {/* Additional accounts */}
        <h3 className="text-sm font-medium text-muted-foreground mt-6 mb-3">
          Additional Connections
        </h3>
        <div className="space-y-3">
          <AccountCard
            platform="telegram"
            name="Telegram"
            connected={false}
            onConnect={() => handleConnect("telegram")}
            onDisconnect={() => handleDisconnect("telegram")}
          />
          
          {additionalAccounts.map(acc => (
            <AccountCard
              key={acc.platform}
              platform={acc.platform}
              name={acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)}
              handle={acc.handle || acc.address}
              connected={acc.connected}
              comingSoon={acc.comingSoon}
              onConnect={() => handleConnect(acc.platform)}
              onDisconnect={() => handleDisconnect(acc.platform)}
            />
          ))}
        </div>
      </section>

      {/* REP Info */}
      <section className="rep-surface-glass-blur rep-glass-stroke-muted p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Your REP Score</p>
            <p className="text-2xl font-bold text-primary glow">
              {user?.totalRep.toLocaleString() || 0}
            </p>
          </div>
          <a
            href="https://rep.xyz/faq"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-accent hover:underline"
          >
            Learn about REP
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </section>

      {/* Logout Section */}
      <section className="pt-6 border-t border-border">
        {!showLogoutConfirm ? (
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:border-destructive/50"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        ) : (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Are you sure you want to log out?
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You&apos;ll need to reconnect your accounts to access your REP again.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? "Logging out..." : "Log out"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Version info */}
      <p className="text-xs text-muted-foreground text-center pt-4">
        REP v1.0.0 Beta
      </p>
    </div>
  )
}
