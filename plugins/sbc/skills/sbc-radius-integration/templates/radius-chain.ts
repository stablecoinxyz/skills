/**
 * Radius viem chains — copy to src/config/radius.ts
 * https://docs.stablecoin.xyz/radius/configuration
 */
import { defineChain } from "viem";

export const radiusMainnet = defineChain({
  id: 723487,
  name: "Radius Network",
  nativeCurrency: { name: "RUSD", symbol: "RUSD", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.radiustech.xyz"] } },
  blockExplorers: {
    default: { name: "Radius Explorer", url: "https://network.radiustech.xyz" },
  },
});

export const radiusTestnet = defineChain({
  id: 72344,
  name: "Radius Testnet",
  nativeCurrency: { name: "RUSD", symbol: "RUSD", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.radiustech.xyz"] } },
  blockExplorers: {
    default: {
      name: "Radius Explorer",
      url: "https://testnet.radiustech.xyz",
      apiUrl: "https://testnet.radiustech.xyz/api",
    },
  },
  testnet: true,
});

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
