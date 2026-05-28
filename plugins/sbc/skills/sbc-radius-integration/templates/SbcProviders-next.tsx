"use client";

/**
 * Next.js App Router provider — copy to src/components/providers/SbcProviders.tsx
 * Wrap in app/layout.tsx: <SbcProviders>{children}</SbcProviders>
 */
import { SbcProvider } from "@stablecoin.xyz/react";
import type { ReactNode } from "react";
import { createSbcRadiusConfig } from "@/lib/sbc/config";

const sbcConfig = createSbcRadiusConfig();

export function SbcProviders({ children }: { children: ReactNode }) {
  return <SbcProvider config={sbcConfig}>{children}</SbcProvider>;
}
