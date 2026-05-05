#!/usr/bin/env bash
# Fetch X profile avatars via unavatar.io for the prototype.
# Run from rep-prototype root: `bash scripts/fetch-avatars.sh`
#
# Two destinations:
#   public/images/avatars/x/{handle}.jpg  - real handles used in mock data
#   public/images/avatars/pool/{N}.jpg    - filler pool for fictional handles
#
# unavatar.io fallback=false makes 404s explicit so the script logs MISSING
# and we can substitute a different handle.

set -u

ROOT="public/images/avatars"
mkdir -p "$ROOT/x" "$ROOT/pool"

fetch() {
  local handle="$1"
  local out="$2"
  if curl -fsSL --max-time 15 -A "Mozilla/5.0" \
       -o "$out" "https://unavatar.io/x/${handle}?fallback=false"; then
    echo "OK    $handle -> $out"
  else
    rm -f "$out"
    echo "MISS  $handle"
    return 1
  fi
}

REAL=(vitalik cobie hsaka punk6529 tetranode blknoiz06 loomdart DefiIgnas container radix nade)

echo "=== Real handles ==="
for h in "${REAL[@]}"; do
  lower=$(echo "$h" | tr '[:upper:]' '[:lower:]')
  fetch "$h" "$ROOT/x/${lower}.jpg" || true
done

POOL=(
  ansem cz_binance naval raoulpal balajis cdixon brian_armstrong
  APompliano RyanSAdams jessepollak dwr drakefjustin Pentosh1
  CryptoHayes dingalingts gainzy222 hosseeb sassal0x
  zhusu koeppelmann sandeepnailwal packyM FEhrsam
  frankdegods kyledcondon beaniemaxi NFT_GOD
  StackerSatoshi cryptodude999 mertNFT
)

echo "=== Pool ==="
i=0
for h in "${POOL[@]}"; do
  if fetch "$h" "$ROOT/pool/${i}.jpg"; then
    i=$((i+1))
  fi
done

echo ""
echo "Pool size: $i"
