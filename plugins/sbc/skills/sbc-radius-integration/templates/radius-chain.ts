/**
 * Radius viem chains — copy to src/config/radius.ts
 * https://docs.stablecoin.xyz/radius/configuration
 *
 * Use SDK exports so AppKit CHAIN_CONFIGS lookup matches (by chain.id).
 * Mainnet requires @stablecoin.xyz/core patch (723 → 723487) — see templates patch + SKILL.md A9.
 */
import { radius as radiusMainnet, radiusTestnet } from "@stablecoin.xyz/core";

export { radiusMainnet, radiusTestnet };

/** Real Radius mainnet chain ID (0xB0A1F). Unpatched @stablecoin.xyz/core ≤ 1.6.2 ships 723. */
const RADIUS_MAINNET_CHAIN_ID = 723487;

function getSelectedChainEnv(): string {
  return (
    process.env.NEXT_PUBLIC_SBC_CHAIN ?? process.env.VITE_SBC_CHAIN ?? "radiusTestnet"
  );
}

export function getRadiusChain() {
  const env = getSelectedChainEnv();
  if (env === "radius" || env === "radiusMainnet" || env === "mainnet") {
    if ((radiusMainnet.id as number) !== RADIUS_MAINNET_CHAIN_ID) {
      throw new Error(
        `@stablecoin.xyz/core is unpatched: radius.id is ${radiusMainnet.id}, expected ${RADIUS_MAINNET_CHAIN_ID}. ` +
          "Every mainnet UserOp would fail with AA24 signature error. " +
          "Copy @stablecoin.xyz+core+1.6.2.patch to patches/, run `npm i -D patch-package && npx patch-package`, " +
          'and add `"postinstall": "patch-package"` to package.json. See reference.md → "Known SDK bug".',
      );
    }
    return radiusMainnet;
  }
  return radiusTestnet;
}

/**
 * True when `url` can serve the selected chain. Only known radiustech.xyz hosts are
 * checked (testnet vs mainnet subdomain) — custom RPC hosts are trusted as-is.
 * Guards against flipping NEXT_PUBLIC_SBC_CHAIN while a URL override still points
 * at the other network.
 */
export function radiusUrlMatchesSelectedChain(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  if (!host.endsWith("radiustech.xyz")) return true;
  const urlIsTestnet = host.includes("testnet");
  return urlIsTestnet === (getRadiusChain().id === radiusTestnet.id);
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
    if (radiusUrlMatchesSelectedChain(direct)) {
      return direct.replace(/\/$/, "");
    }
    console.warn(
      `[radius] Ignoring NEXT_PUBLIC_RADIUS_RPC_URL: it targets the other Radius network than ` +
        `the selected chain (${getSelectedChainEnv()}). Update or remove it; falling back to the next option.`,
    );
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
