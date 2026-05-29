"use client";

/**
 * SBC AppKit + Para on Radius — copy to src/lib/sbc/use-sbc-radius-para.ts
 * Pattern: dollar-wallet-web/src/lib/sbc/hooks.ts (useSbcPara)
 */
import { useAccount } from "@getpara/react-sdk";
import { useSbcPara } from "@stablecoin.xyz/react";
import { getRadiusChain, getRadiusRpcUrl } from "@/config/radius";
import { useParaViemRadius } from "@/lib/para/hooks";

function getSbcApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_SBC_API_KEY ??
    process.env.VITE_SBC_API_KEY ??
    ""
  );
}

export function useSbcRadiusPara() {
  const paraAccount = useAccount();
  const { publicClient, walletClient, account, isLoading: paraLoading } =
    useParaViemRadius();

  const chain = getRadiusChain();
  const rpcUrl = getRadiusRpcUrl();
  const apiKey = getSbcApiKey();

  const paraViemClients =
    walletClient && account
      ? { publicClient, walletClient, account }
      : null;

  const sbc = useSbcPara({
    apiKey,
    chain,
    paraAccount,
    rpcUrl,
    debug: process.env.NODE_ENV === "development",
    paraViemClients,
  });

  return {
    ...sbc,
    paraLoading,
    chain,
    isParaConnected: paraAccount.isConnected,
  };
}
