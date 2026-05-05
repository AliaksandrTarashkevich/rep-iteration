// Single source of truth for avatar URLs across the prototype.
// Real X handles (those with a downloaded portrait in public/images/avatars/x)
// resolve to their actual avatar; everything else hashes into a shared pool of
// crypto-twitter portraits in public/images/avatars/pool.
//
// To refresh or expand the pool, run scripts/fetch-avatars.sh.

const REAL_HANDLES = new Set([
  "vitalik",
  "cobie",
  "hsaka",
  "punk6529",
  "blknoiz06",
  "loomdart",
  "defiignas",
  "container",
  "radix",
  "nade",
])

const POOL_SIZE = 14

function hashHandle(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function normalizeKey(handle: string): string {
  return handle.toLowerCase().replace(/^@/, "").trim()
}

export function getAvatarUrl(handle: string): string {
  const key = normalizeKey(handle)
  if (REAL_HANDLES.has(key)) return `/images/avatars/x/${key}.jpg`
  return `/images/avatars/pool/${hashHandle(key) % POOL_SIZE}.jpg`
}

export function isRealAvatar(handle: string): boolean {
  return REAL_HANDLES.has(normalizeKey(handle))
}

// For seed-based generators that pick avatars without a known handle
// (e.g. anonymous chat-member rows). Wraps modulo over the pool.
export function getPoolAvatarByIndex(index: number): string {
  const i = ((index % POOL_SIZE) + POOL_SIZE) % POOL_SIZE
  return `/images/avatars/pool/${i}.jpg`
}
