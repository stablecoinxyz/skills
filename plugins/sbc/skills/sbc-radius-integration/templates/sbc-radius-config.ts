/**
 * SBC AppKit config for Radius — copy to src/lib/sbc/config.ts (adjust env prefix).
 */
import type { SbcConfig } from "@stablecoin.xyz/react";
import { getRadiusChain, RADIUS_ENTRY_POINT } from "@/config/radius";

function requireApiKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SBC_API_KEY ??
    process.env.VITE_SBC_API_KEY ??
    process.env.SBC_API_KEY;
  if (!key || key === "your_api_key_here") {
    throw new Error(
      "Missing SBC API key. Set NEXT_PUBLIC_SBC_API_KEY (or VITE_SBC_API_KEY) from https://dashboard.stablecoin.xyz/",
    );
  }
  return key;
}

export function createSbcRadiusConfig(
  overrides?: Partial<SbcConfig>,
): SbcConfig {
  const chain = getRadiusChain();
  return {
    apiKey: requireApiKey(),
    chain,
    wallet: "auto",
    debug: process.env.NODE_ENV === "development",
    entryPoint: {
      address: RADIUS_ENTRY_POINT,
      version: "0.7",
    },
    ...overrides,
  };
}
