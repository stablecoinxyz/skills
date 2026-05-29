/**
 * Radius viem chains — copy to src/config/radius.ts
 * https://docs.stablecoin.xyz/radius/configuration
 */
import { defineChain } from "viem";

export const radiusMainnet = defineChain({
  id: 723487,
  name: "Radius Network",
  nativeCurrency: { name: "RUSD", symbol: "RUSD", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.radiustech.xyz"] } },
  blockExplorers: {
    default: { name: "Radius Explorer", url: "https://network.radiustech.xyz" },
  },
});

export const radiusTestnet = defineChain({
  id: 72344,
  name: "Radius Testnet",
  nativeCurrency: { name: "RUSD", symbol: "RUSD", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.radiustech.xyz"] } },
  blockExplorers: {
    default: {
      name: "Radius Explorer",
      url: "https://testnet.radiustech.xyz",
      apiUrl: "https://testnet.radiustech.xyz/api",
    },
  },
  testnet: true,
});

export function getRadiusChain() {
  const env =
    process.env.NEXT_PUBLIC_SBC_CHAIN ??
    process.env.VITE_SBC_CHAIN ??
    "radiusTestnet";
  if (env === "radius" || env === "radiusMainnet" || env === "mainnet") {
    return radiusMainnet;
  }
  return radiusTestnet;
}

export function getRadiusRpcUrl() {
  return getRadiusChain().rpcUrls.default.http[0];
}
