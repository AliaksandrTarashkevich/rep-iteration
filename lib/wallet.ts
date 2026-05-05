// Real wallet connection via EIP-1193 injected providers.
//
// Supports any browser-extension wallet that injects `window.ethereum`
// (MetaMask, Rabby, Coinbase Wallet, Trust, Brave, OKX, etc.). Multi-wallet
// discovery is handled via EIP-6963 so users who have several wallets
// installed can pick which one to connect.
//
// No external dependencies — we talk to the provider directly. If the app
// later needs WalletConnect / mobile deep linking, swap this module for
// wagmi + RainbowKit; the public API (connectWallet / disconnectWallet /
// subscribeToAccountChanges) is designed to stay the same.

export interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>
  on?: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void
  isMetaMask?: boolean
  isRabby?: boolean
  isCoinbaseWallet?: boolean
  isTrust?: boolean
  isBraveWallet?: boolean
}

export interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo
  provider: EIP1193Provider
}

export interface ConnectedWallet {
  address: string
  chainId: number
  providerName: string
  providerRdns?: string
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider & {
      providers?: EIP1193Provider[]
    }
  }
}

/**
 * Discover all injected wallets via EIP-6963 (announceProvider event).
 * Falls back to `window.ethereum` if no announcements fire.
 *
 * Resolves after a short window (300ms) so every extension has time to
 * reply to the `requestProvider` event we dispatch.
 */
export function discoverProviders(timeoutMs = 300): Promise<EIP6963ProviderDetail[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve([])
      return
    }

    const found = new Map<string, EIP6963ProviderDetail>()

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail
      if (detail?.info?.uuid) {
        found.set(detail.info.uuid, detail)
      }
    }

    window.addEventListener("eip6963:announceProvider", handler as EventListener)
    window.dispatchEvent(new Event("eip6963:requestProvider"))

    window.setTimeout(() => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handler as EventListener,
      )

      // Fallback to legacy window.ethereum when no 6963 announcements fired.
      if (found.size === 0 && window.ethereum) {
        // Some wallets expose multiple providers on window.ethereum.providers.
        const legacyList = window.ethereum.providers ?? [window.ethereum]
        legacyList.forEach((provider, idx) => {
          const name = detectLegacyName(provider) ?? `Injected Wallet ${idx + 1}`
          found.set(`legacy-${idx}`, {
            info: {
              uuid: `legacy-${idx}`,
              name,
              icon: "",
              rdns: "",
            },
            provider,
          })
        })
      }

      resolve(Array.from(found.values()))
    }, timeoutMs)
  })
}

function detectLegacyName(p: EIP1193Provider): string | null {
  if (p.isRabby) return "Rabby"
  if (p.isCoinbaseWallet) return "Coinbase Wallet"
  if (p.isBraveWallet) return "Brave Wallet"
  if (p.isTrust) return "Trust Wallet"
  if (p.isMetaMask) return "MetaMask"
  return null
}

export class WalletConnectionError extends Error {
  code:
    | "NO_PROVIDER"
    | "USER_REJECTED"
    | "NO_ACCOUNT"
    | "UNKNOWN"

  constructor(
    code: "NO_PROVIDER" | "USER_REJECTED" | "NO_ACCOUNT" | "UNKNOWN",
    message: string,
  ) {
    super(message)
    this.name = "WalletConnectionError"
    this.code = code
  }
}

/**
 * Request accounts from the given provider. If no detail is passed, picks
 * the first available injected provider. Throws `WalletConnectionError`
 * with a typed `code` so the UI can differentiate "user cancelled the
 * popup" from "no wallet installed".
 */
export async function connectWallet(
  detail?: EIP6963ProviderDetail,
): Promise<ConnectedWallet> {
  let target = detail
  if (!target) {
    const all = await discoverProviders()
    if (all.length === 0) {
      throw new WalletConnectionError(
        "NO_PROVIDER",
        "No wallet detected. Install MetaMask, Rabby, or Coinbase Wallet to continue.",
      )
    }
    target = all[0]
  }

  try {
    const accounts = (await target.provider.request({
      method: "eth_requestAccounts",
    })) as string[]

    if (!accounts || accounts.length === 0) {
      throw new WalletConnectionError(
        "NO_ACCOUNT",
        "No account returned from the wallet.",
      )
    }

    const chainIdHex = (await target.provider.request({
      method: "eth_chainId",
    })) as string

    return {
      address: accounts[0],
      chainId: parseInt(chainIdHex, 16),
      providerName: target.info.name,
      providerRdns: target.info.rdns,
    }
  } catch (err: unknown) {
    // EIP-1193 user-rejection is code 4001.
    const code = (err as { code?: number })?.code
    if (code === 4001) {
      throw new WalletConnectionError(
        "USER_REJECTED",
        "You rejected the connection request.",
      )
    }
    if (err instanceof WalletConnectionError) throw err
    const msg = (err as { message?: string })?.message ?? "Wallet connection failed."
    throw new WalletConnectionError("UNKNOWN", msg)
  }
}

/**
 * Ask the wallet to sign a SIWE-style auth message. Returns the signature
 * so a backend could later verify it. Safe to skip if the app doesn't need
 * authenticated sessions yet — in that case the raw address from
 * connectWallet() is enough.
 */
export async function signLoginMessage(
  detail: EIP6963ProviderDetail,
  address: string,
  nonce?: string,
): Promise<string> {
  const generatedNonce =
    nonce ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : Math.random().toString(36).slice(2, 18))

  const message = [
    `${window.location.host} wants you to sign in with your Ethereum account:`,
    address,
    "",
    "Sign in to REP Network.",
    "",
    `URI: ${window.location.origin}`,
    "Version: 1",
    `Nonce: ${generatedNonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n")

  return (await detail.provider.request({
    method: "personal_sign",
    params: [message, address],
  })) as string
}

/**
 * Short-format a 0x address for display (0x1234…abcd).
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ""
  const prefix = address.startsWith("0x") ? 2 : 0
  return `${address.slice(0, prefix + chars)}…${address.slice(-chars)}`
}

const LS_WALLET_KEY = "rep:wallet"

export interface StoredWallet {
  address: string
  chainId: number
  providerName: string
}

export function saveConnectedWallet(wallet: StoredWallet) {
  try {
    window.sessionStorage.setItem(LS_WALLET_KEY, JSON.stringify(wallet))
  } catch {
    /* noop */
  }
}

export function readConnectedWallet(): StoredWallet | null {
  try {
    const raw = window.sessionStorage.getItem(LS_WALLET_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredWallet
  } catch {
    return null
  }
}

export function clearConnectedWallet() {
  try {
    window.sessionStorage.removeItem(LS_WALLET_KEY)
  } catch {
    /* noop */
  }
}
