"use client";

/**
 * Para → viem clients on Radius — copy to src/lib/para/hooks.ts
 * Pattern: dollar-wallet-web/src/lib/para/hooks.ts (chain = getRadiusChain())
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { createPublicClient, http } from "viem";
import { getRadiusChain, getRadiusRpcUrl } from "@/config/radius";

export function useParaViemRadius() {
  const { isConnected } = useAccount();
  const para = useClient();
  const paraRef = useRef(para);
  paraRef.current = para;

  const chain = useMemo(() => getRadiusChain(), []);
  const rpcUrl = useMemo(() => getRadiusRpcUrl(), []);

  const publicClient = useMemo(
    () => createPublicClient({ chain, transport: http(rpcUrl) }),
    [chain, rpcUrl],
  );

  const [clients, setClients] = useState<{
    publicClient: typeof publicClient;
    walletClient: Awaited<ReturnType<typeof createParaViemClient>> | null;
    account: ReturnType<typeof createParaAccount> | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      setIsLoading(true);
      setError(null);
      try {
        const currentPara = paraRef.current;
        if (isConnected && currentPara) {
          const account = createParaAccount(currentPara);
          const walletClient = createParaViemClient(currentPara, {
            account,
            chain,
            transport: http(rpcUrl),
          });
          if (!cancelled) {
            setClients({ publicClient, walletClient, account });
          }
        } else if (!cancelled) {
          setClients({ publicClient, walletClient: null, account: null });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void setup();
    return () => {
      cancelled = true;
    };
  }, [isConnected, chain, rpcUrl, publicClient]);

  return {
    isConnected,
    isLoading,
    error,
    publicClient: clients?.publicClient ?? publicClient,
    walletClient: clients?.walletClient ?? null,
    account: clients?.account ?? null,
    chain,
    rpcUrl,
  };
}
