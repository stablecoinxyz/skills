/**
 * Radius RPC health — copy to src/app/api/radius-rpc/health/route.ts
 * Optional: wire a setup banner to GET /api/radius-rpc/health
 */
import {
  fetchRadiusRpcUpstream,
  isCloudflareBlockResponse,
  isRadiusRpcApiKeyConfigured,
} from "@/lib/radius-rpc-proxy";

export async function GET() {
  const usesDirectBrowserRpc =
    Boolean(process.env.NEXT_PUBLIC_RADIUS_RPC_URL?.trim()) ||
    Boolean(process.env.NEXT_PUBLIC_RADIUS_RPC_API_KEY?.trim());

  if (!isRadiusRpcApiKeyConfigured() && !usesDirectBrowserRpc) {
    return Response.json({
      ok: false,
      apiKeyConfigured: false,
      reachable: false,
      usesDirectBrowserRpc: false,
      message:
        "Set RADIUS_RPC_API_KEY in .env.local (Radius RPC key, not your SBC key). See https://docs.radiustech.xyz/developer-resources/network-configuration/",
    });
  }

  if (usesDirectBrowserRpc) {
    return Response.json({
      ok: true,
      apiKeyConfigured: isRadiusRpcApiKeyConfigured(),
      reachable: true,
      usesDirectBrowserRpc: true,
      message:
        "Using browser-direct Radius RPC (NEXT_PUBLIC_RADIUS_RPC_URL or NEXT_PUBLIC_RADIUS_RPC_API_KEY). Server proxy health not required.",
    });
  }

  try {
    const res = await fetchRadiusRpcUpstream(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1,
      }),
    );
    const text = await res.text();
    const blocked = isCloudflareBlockResponse(res.status, text);
    const ok = res.ok && !blocked && text.includes("0x11a98");

    return Response.json({
      ok,
      apiKeyConfigured: true,
      reachable: ok,
      usesDirectBrowserRpc: false,
      message: ok
        ? "Radius RPC is reachable from the server proxy"
        : blocked
          ? "Server-side Radius RPC is blocked (Cloudflare 403). Add NEXT_PUBLIC_RADIUS_RPC_URL to .env.local for local dev, then restart."
          : `Radius RPC returned HTTP ${res.status}`,
    });
  } catch (err) {
    return Response.json({
      ok: false,
      apiKeyConfigured: true,
      reachable: false,
      usesDirectBrowserRpc: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
