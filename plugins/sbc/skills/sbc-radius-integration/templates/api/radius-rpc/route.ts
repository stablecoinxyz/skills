/**
 * Radius RPC proxy — copy to src/app/api/radius-rpc/route.ts
 *
 * Routes client JSON-RPC through the server so RADIUS_RPC_API_KEY stays out of the
 * browser bundle. If Cloudflare blocks server egress, set NEXT_PUBLIC_RADIUS_RPC_URL
 * in .env.local so getRadiusRpcUrl() talks to Radius directly from the browser.
 */
import { NextRequest } from "next/server";
import {
  fetchRadiusRpcUpstream,
  isCloudflareBlockResponse,
  isRadiusRpcApiKeyConfigured,
} from "@/lib/radius-rpc-proxy";

const CF_HELP =
  "Radius RPC blocked from this server (Cloudflare 403). For local dev, set NEXT_PUBLIC_RADIUS_RPC_URL in .env.local to your authenticated RPC URL (https://rpc.testnet.radiustech.xyz/YOUR_KEY), restart the dev server, and reload. Request a key: https://docs.radiustech.xyz/developer-resources/network-configuration/";

export async function POST(req: NextRequest) {
  if (!isRadiusRpcApiKeyConfigured()) {
    return Response.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message:
            "Radius RPC not configured. Add RADIUS_RPC_API_KEY to .env.local and restart the dev server. " +
            "Get a key at https://docs.radiustech.xyz/developer-resources/network-configuration/",
        },
      },
      { status: 503 },
    );
  }

  const body = await req.text();

  try {
    const res = await fetchRadiusRpcUpstream(body, {
      headers: {
        "User-Agent": req.headers.get("user-agent") ?? "sbc-radius-rpc-proxy",
      },
    });

    const text = await res.text();

    if (isCloudflareBlockResponse(res.status, text)) {
      return Response.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32603, message: CF_HELP },
        },
        { status: 403 },
      );
    }

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: `Radius RPC proxy error: ${message}` },
      },
      { status: 502 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
