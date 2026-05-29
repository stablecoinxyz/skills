"use client";

/**
 * Next.js root providers — copy to src/components/providers/ParaProviders.tsx
 * Patterns: dollar-wallet-web/src/components/Providers.tsx, agent-payments Para 2.27.x
 */
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { http } from "viem";
import {
  paraAppConfig,
  paraClientConfig,
  paraModalConfig,
  PARA_API_KEY,
  WALLETCONNECT_PROJECT_ID,
  EXTERNAL_WALLETS,
} from "@/lib/para/config";
import { getRadiusChain, getRadiusRpcUrl } from "@/config/radius";

// Clear stale persisted zustand state to avoid "no migrate function" console warnings
// from graz and Para SDK on version mismatch.
if (typeof window !== "undefined") {
  const stores: [string, number, Storage][] = [
    ["graz-session", 2, sessionStorage],
    ["graz-internal", 3, localStorage],
    ["@PARA/provider-state", 1, localStorage],
  ];
  for (const [key, expectedVersion, storage] of stores) {
    try {
      const raw = storage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as { version?: number };
        if (parsed?.version !== undefined && parsed.version !== expectedVersion) {
          storage.removeItem(key);
        }
      }
    } catch {
      storage.removeItem(key);
    }
  }
}

export function ParaProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10 * 1000, refetchOnWindowFocus: false },
        },
      }),
  );

  if (!PARA_API_KEY) {
    return (
      <div style={{ padding: 16, fontFamily: "monospace", fontSize: 12 }}>
        Set NEXT_PUBLIC_PARA_API_KEY in .env.local (from developer.getpara.com)
      </div>
    );
  }

  const chain = getRadiusChain();
  const rpcUrl = getRadiusRpcUrl();

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={paraClientConfig}
        config={paraAppConfig}
        paraModalConfig={paraModalConfig}
        externalWalletConfig={{
          walletConnect: WALLETCONNECT_PROJECT_ID
            ? { projectId: WALLETCONNECT_PROJECT_ID }
            : undefined,
          wallets: [...EXTERNAL_WALLETS],
          evmConnector: {
            config: {
              chains: [chain],
              transports: { [chain.id]: http(rpcUrl) },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          },
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}
