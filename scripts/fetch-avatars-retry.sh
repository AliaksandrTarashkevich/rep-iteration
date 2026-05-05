#!/usr/bin/env bash
# Continue filling the pool after rate-limit hit.
# Adds delay between requests and tops up to POOL_TARGET=30.

set -u
ROOT="public/images/avatars"
POOL_TARGET=30

# Determine current pool size by counting existing files.
i=$(ls "$ROOT/pool"/*.jpg 2>/dev/null | wc -l | tr -d ' ')
echo "Current pool size: $i"

CANDIDATES=(
  dingalingts gainzy222 hosseeb sassal0x zhusu koeppelmann
  sandeepnailwal packyM FEhrsam frankdegods kyledcondon beaniemaxi
  NFT_GOD StackerSatoshi cryptodude999 mertNFT
  RyanWatkins_ JBSDF AltcoinPsycho 0xfoobar smyyguy
  notthreadguy lightcrypto saliencexbt zachxbt
  TheCryptoLark CamiRusso laurashin justinsuntron
  EricCryptoman kobeissiletter milesdeutscher tier10k
)

fetch() {
  local handle="$1"
  local out="$2"
  if curl -fsSL --max-time 15 -A "Mozilla/5.0" \
       -o "$out" "https://unavatar.io/x/${handle}?fallback=false"; then
    echo "OK    $handle -> $out"
    return 0
  else
    rm -f "$out"
    echo "MISS  $handle"
    return 1
  fi
}

for h in "${CANDIDATES[@]}"; do
  if [ "$i" -ge "$POOL_TARGET" ]; then
    echo "Pool full ($POOL_TARGET)"
    break
  fi
  if fetch "$h" "$ROOT/pool/${i}.jpg"; then
    i=$((i+1))
  fi
  sleep 2
done

echo ""
echo "Final pool size: $i"
