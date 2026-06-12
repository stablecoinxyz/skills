/**
 * Shared Radius RPC proxy helpers — copy to src/lib/radius-rpc-proxy.ts
 * Used by src/app/api/radius-rpc/route.ts and .../health/route.ts
 */
import { getRadiusPublicRpcUrl, radiusUrlMatchesSelectedChain } from "@/config/radius";

export function getRadiusRpcUpstreamUrl(): string {
  const override = process.env.RADIUS_RPC_UPSTREAM?.trim();
  if (override?.startsWith("http")) {
    if (radiusUrlMatchesSelectedChain(override)) return override.replace(/\/$/, "");
    console.warn(
      "[radius-rpc-proxy] Ignoring RADIUS_RPC_UPSTREAM: it targets the other Radius network " +
        "than the selected chain. Using the chain-derived upstream instead.",
    );
  }

  const key = process.env.RADIUS_RPC_API_KEY?.trim();
  const base = getRadiusPublicRpcUrl();
  return key ? `${base}/${key}` : base;
}

export function isRadiusRpcApiKeyConfigured(): boolean {
  return Boolean(
    process.env.RADIUS_RPC_API_KEY?.trim() || process.env.RADIUS_RPC_UPSTREAM?.trim(),
  );
}

export function isCloudflareBlockResponse(status: number, text: string): boolean {
  if (status === 403) return true;
  const lower = text.toLowerCase();
  return (
    lower.includes("cf-browser-verification") ||
    lower.includes("just a moment") ||
    lower.includes("<!doctype html")
  );
}

export async function fetchRadiusRpcUpstream(
  body: string,
  init?: { headers?: HeadersInit },
): Promise<Response> {
  return fetch(getRadiusRpcUpstreamUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
    body,
    cache: "no-store",
  });
}
