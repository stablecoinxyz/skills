#!/usr/bin/env bash
# Refresh bundled SBC docs from docs.stablecoin.xyz
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
curl -sS https://docs.stablecoin.xyz/llms.txt -o "$ROOT/sbc-llms.txt"
curl -sS https://docs.stablecoin.xyz/llms-full.txt -o "$ROOT/sbc-llms-full.txt"
echo "Updated sbc-llms.txt and sbc-llms-full.txt in $ROOT"
