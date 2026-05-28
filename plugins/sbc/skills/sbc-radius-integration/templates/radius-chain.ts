/**
 * Radius viem chain definitions — copy to src/config/radius.ts (or lib/chains/radius.ts).
 * Source: https://docs.stablecoin.xyz/radius/configuration
 */
import { defineChain } from "viem";

export const radiusMainnet = defineChain({
  id: 723487,
  name: "Radius Network",
  nativeCurrency: {
    name: "RUSD",
    symbol: "RUSD",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.radiustech.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Radius Explorer",
      url: "https://network.radiustech.xyz",
    },
  },
});

export const radiusTestnet = defineChain({
  id: 72344,
  name: "Radius Testnet",
  nativeCurrency: {
    name: "RUSD",
    symbol: "RUSD",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.radiustech.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Radius Explorer",
      url: "https://testnet.radiustech.xyz",
      apiUrl: "https://testnet.radiustech.xyz/api",
    },
  },
  testnet: true,
});

/** Pick chain from env. Default: testnet. */
export function getRadiusChain() {
  const env =
    process.env.NEXT_PUBLIC_SBC_CHAIN ??
    process.env.VITE_SBC_CHAIN ??
    process.env.SBC_CHAIN ??
    "radiusTestnet";
  if (env === "radius" || env === "radiusMainnet" || env === "mainnet") {
    return radiusMainnet;
  }
  return radiusTestnet;
}

export const RADIUS_ENTRY_POINT =
  "0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F" as const;

export const RADIUS_SBC_TOKEN =
  "0x33ad9e4bd16b69b5bfded37d8b5d9ff9aba014fb" as const;
