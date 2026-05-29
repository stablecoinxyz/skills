"use client";

/**
 * Para → viem clients on Radius — copy to src/lib/para/hooks.ts
 * Pattern: dollar-wallet-web/src/lib/para/hooks.ts (chain = getRadiusChain())
 *
 * Handles two connection paths:
 *   - Embedded Para wallet (email/social) → createParaViemClient
 *   - External wallet (MetaMask, Coinbase…) → wagmi wallet client via LocalAccount adapter
 */
import { useState, useEffect, useMemo, useRef } from "react";
import { useAccount, useClient, useWallet } from "@getpara/react-sdk";
import { createPublicClient, http } from "viem";
import { toAccount } from "viem/accounts";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { useWalletClient as useWagmiWalletClient } from "wagmi";
import { getRadiusChain, getRadiusRpcUrl } from "@/config/radius";

export function useParaViemRadius() {
  const paraAccount = useAccount();
  const { isConnected } = paraAccount;
  const para = useClient();

  const connectionType = paraAccount.connectionType;
  const isExternal = connectionType === "external" || connectionType === "both";

  const { data: wagmiWalletClient } = useWagmiWalletClient();

  const paraRef = useRef(para);
  paraRef.current = para;

  const setupDoneRef = useRef(false);
  const prevIsConnectedRef = useRef(isConnected);
  const prevIsExternalRef = useRef(isExternal);

  const chain = useMemo(() => getRadiusChain(), []);
  const rpcUrl = useMemo(() => getRadiusRpcUrl(), []);

  const publicClient = useMemo(
    () => createPublicClient({ chain, transport: http(rpcUrl) }),
    [chain, rpcUrl],
  );

  const [clients, setClients] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publicClient: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    walletClient: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    account: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (prevIsExternalRef.current !== isExternal) {
      setupDoneRef.current = false;
    }
    prevIsExternalRef.current = isExternal;

    if (prevIsConnectedRef.current === isConnected && setupDoneRef.current) {
      return;
    }
    prevIsConnectedRef.current = isConnected;

    // External wallet path: adapt wagmi wallet client to viem LocalAccount
    if (isConnected && isExternal) {
      if (wagmiWalletClient && wagmiWalletClient.account) {
        const localAccount = toAccount({
          address: wagmiWalletClient.account.address,
          async signMessage({ message }) {
            return wagmiWalletClient.signMessage({ message });
          },
          async signTransaction(transaction) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return wagmiWalletClient.signTransaction(transaction as any);
          },
          async signTypedData(typedData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return wagmiWalletClient.signTypedData(typedData as any);
          },
        });

        const walletClientWithLocalAccount = Object.create(wagmiWalletClient, {
          account: { value: localAccount, enumerable: true, configurable: true },
          chain: { value: chain, enumerable: true, configurable: true },
        });

        Promise.resolve().then(() => {
          setClients({
            publicClient,
            walletClient: walletClientWithLocalAccount,
            account: localAccount,
          });
          setIsLoading(false);
          setupDoneRef.current = true;
        });
      } else {
        Promise.resolve().then(() => setIsLoading(true));
        setupDoneRef.current = false;
      }
      return;
    }

    // Embedded Para wallet path
    let isMounted = true;

    const setupClients = async () => {
      const currentPara = paraRef.current;
      setIsLoading(true);
      setError(null);

      try {
        if (isConnected && currentPara) {
          const viemAccount = createParaAccount(currentPara);
          const walletClient = createParaViemClient(currentPara, {
            account: viemAccount,
            chain,
            transport: http(rpcUrl),
          });

          // createParaViemClient may not populate .chain; set it explicitly so
          // useSbcPara can read it when building the bundler/paymaster URL.
          if (!walletClient.chain) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (walletClient as any).chain = chain;
          }

          if (isMounted) {
            setClients({ publicClient, walletClient, account: viemAccount });
            setIsLoading(false);
            setupDoneRef.current = true;
          }
        } else {
          if (isMounted) {
            setClients({ publicClient, walletClient: null, account: null });
            setIsLoading(false);
            setupDoneRef.current = true;
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to setup Para viem clients"),
          );
          setIsLoading(false);
        }
      }
    };

    setupClients();
    return () => {
      isMounted = false;
    };
  }, [isConnected, isExternal, wagmiWalletClient, publicClient, chain, rpcUrl]);

  return { clients, isLoading, error, isExternal };
}

export function usePara() {
  const paraAccount = useAccount();
  const { isConnected } = paraAccount;
  const { data: wallet } = useWallet();
  const { clients, isLoading, error, isExternal } = useParaViemRadius();

  const address = isExternal
    ? (paraAccount.external?.evm?.address as `0x${string}` | undefined)
    : (wallet?.address as `0x${string}` | undefined);
  const walletId = wallet?.id;

  return {
    isConnected,
    isExternal,
    address,
    walletId,
    publicClient: clients?.publicClient ?? null,
    walletClient: clients?.walletClient ?? null,
    account: clients?.account ?? null,
    isLoading,
    error,
  };
}
