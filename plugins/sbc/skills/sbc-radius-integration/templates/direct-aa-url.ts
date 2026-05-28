/**
 * Paymaster + bundler URL only (Privy, permissionless, custom AA).
 * Prefer SbcAppKit when possible — it handles Radius gas + receipt polling.
 */
import { getRadiusChain } from "@/config/radius";

export function getSbcAaRpcUrl(apiKey: string): string {
  const chain = getRadiusChain();
  const chainSlug = chain.testnet ? "radiusTestnet" : "radius";
  return `https://api.aa.stablecoin.xyz/rpc/v1/${chainSlug}/${apiKey}`;
}

// Use the SAME URL for bundler and paymaster.
// Radius EntryPoint (NOT canonical Base):
export const RADIUS_ENTRY_POINT =
  "0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F";

// Smart account on Radius: SimpleAccount (NOT Kernel / ZeroDev defaults for Base).
