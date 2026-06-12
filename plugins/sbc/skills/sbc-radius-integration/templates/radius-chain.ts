/**
 * Radius viem chains — copy to src/config/radius.ts
 * https://docs.stablecoin.xyz/radius/configuration
 *
 * Use SDK exports so AppKit CHAIN_CONFIGS lookup matches (by chain.id).
 * Mainnet requires @stablecoin.xyz/core patch (723 → 723487) — see templates patch + SKILL.md A9.
 */
import { radius as radiusMainnet, radiusTestnet } from "@stablecoin.xyz/core";

export { radiusMainnet, radiusTestnet };

export function getRadiusChain() {
  const env =
    process.env.NEXT_PUBLIC_SBC_CHAIN ??
    process.env.VITE_SBC_CHAIN ??
    "radiusTestnet";
  if (env === "radius" || env === "radiusMainnet" || env === "mainnet") {
    return radiusMainnet;
  }
  return radiusTestnet;
}

/** Public base RPC URL — used by the server-side proxy upstream. */
export function getRadiusPublicRpcUrl() {
  return getRadiusChain().rpcUrls.default.http[0];
}

function buildAuthenticatedRpcUrl(apiKey: string): string {
  return `${getRadiusPublicRpcUrl()}/${apiKey.trim()}`;
}

/**
 * RPC URL for viem transports. Must be stable across SSR and hydration (no `window` checks).
 *
 * 1. NEXT_PUBLIC_RADIUS_RPC_URL — full authenticated URL (local dev when server proxy is CF-blocked)
 * 2. NEXT_PUBLIC_RADIUS_RPC_API_KEY — path-style auth (dev only; exposes key in bundle)
 * 3. /api/radius-rpc — same-origin proxy (production default)
 *
 * Vite: set VITE_RADIUS_RPC_API_KEY and use getRadiusPublicRpcUrl() + key in your transport helper.
 */
export function getRadiusRpcUrl(): string {
  const direct = process.env.NEXT_PUBLIC_RADIUS_RPC_URL?.trim();
  if (direct?.startsWith("http")) {
    return direct.replace(/\/$/, "");
  }

  const clientKey = process.env.NEXT_PUBLIC_RADIUS_RPC_API_KEY?.trim();
  if (clientKey) {
    return buildAuthenticatedRpcUrl(clientKey);
  }

  // Next.js: same-origin proxy (RADIUS_RPC_API_KEY stays server-side)
  if (process.env.NEXT_PUBLIC_SBC_API_KEY !== undefined) {
    return "/api/radius-rpc";
  }

  return getRadiusPublicRpcUrl();
}
