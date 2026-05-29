"use client";

/**
 * Next.js root providers — copy to src/components/providers/ParaProviders.tsx
 * Patterns: dollar-wallet-web/src/components/Providers.tsx, agent-payments Para 2.27.x
 */
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import {
  paraAppConfig,
  paraClientConfig,
  paraModalConfig,
  PARA_API_KEY,
} from "@/lib/para/config";

export function ParaProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  if (!PARA_API_KEY) {
    return (
      <div style={{ padding: 16, fontFamily: "monospace", fontSize: 12 }}>
        Set NEXT_PUBLIC_PARA_API_KEY in .env.local (from developer.getpara.com)
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={paraClientConfig}
        config={paraAppConfig}
        paraModalConfig={paraModalConfig}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}
