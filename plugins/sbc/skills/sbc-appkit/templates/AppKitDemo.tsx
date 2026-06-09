"use client";

/**
 * SBC AppKit demo — connect, gasless SBC self-send, balance display
 * Copy to src/components/AppKitDemo.tsx
 * Requires ParaProviders ancestor + useSbcRadiusPara (from use-sbc-radius-para.ts).
 * Wrap in AppKitDemoLoader (ssr: false) before using in a page.
 */
import { useModal, useAccount, useClient } from "@getpara/react-sdk";
import { useState, useEffect, useCallback } from "react";
import { erc20Abi, encodeFunctionData, parseUnits, formatUnits } from "viem";
import { useSbcRadiusPara } from "@/lib/sbc/use-sbc-radius-para";

// SBC token on Radius testnet + mainnet (same address, 6 decimals)
const SBC_TOKEN = "0x33ad9e4BD16B69B5BFdED37D8B5D9fF9aba014Fb" as const;
const SBC_DECIMALS = 6;

export default function AppKitDemo() {
  const sbcKey =
    process.env.NEXT_PUBLIC_SBC_API_KEY ?? process.env.VITE_SBC_API_KEY;
  const paraKey =
    process.env.NEXT_PUBLIC_PARA_API_KEY ?? process.env.VITE_PARA_API_KEY;

  if (!sbcKey || !paraKey) {
    return (
      <p className="font-mono text-xs">
        Set NEXT_PUBLIC_SBC_API_KEY and NEXT_PUBLIC_PARA_API_KEY in .env.local,
        then restart dev.
      </p>
    );
  }

  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const para = useClient();

  const {
    account,
    ownerAddress,
    sbcAppKit,
    isInitialized,
    error,
    chain,
    publicClient,
    disconnectWallet,
  } = useSbcRadiusPara();

  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sbcBalance, setSbcBalance] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!account?.address || !publicClient) return;
    try {
      const raw = await publicClient.readContract({
        address: SBC_TOKEN,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account.address as `0x${string}`],
      });
      setSbcBalance(formatUnits(raw as bigint, SBC_DECIMALS));
    } catch {
      setSbcBalance(null);
    }
  }, [account?.address, publicClient]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleDisconnect = async () => {
    try {
      await para?.logout();
    } catch {
      // para.logout() may throw if already logged out — ignore
    }
    disconnectWallet();
  };

  const handleTestSend = async () => {
    if (!sbcAppKit || !account?.address) return;
    setSending(true);
    setTxError(null);
    setTxStatus(null);
    try {
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [account.address as `0x${string}`, parseUnits("0.000001", SBC_DECIMALS)],
      });
      await sbcAppKit.sendUserOperation({ to: SBC_TOKEN, value: "0", data });
      setTxStatus("SBC transfer submitted");
      await fetchBalance();
    } catch (e) {
      setTxError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 font-mono text-sm">
      <p className="text-xs opacity-70">
        {chain.name} (id {chain.id}) · SBC AppKit demo
      </p>

      {!isConnected ? (
        <button
          type="button"
          onClick={() => openModal()}
          className="rounded border px-3 py-2 text-xs"
        >
          Connect with Para
        </button>
      ) : (
        <div className="space-y-3">
          {account?.address && (
            <div className="space-y-1">
              {ownerAddress && (
                <p className="break-all text-xs opacity-60">
                  address: {ownerAddress}
                </p>
              )}
              <p className="break-all text-xs opacity-80">
                smart account: {account.address}
              </p>
              <p className="text-xs opacity-70">
                SBC balance:{" "}
                {sbcBalance !== null ? `${sbcBalance} SBC` : "loading…"}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDisconnect}
              className="rounded border px-3 py-2 text-xs"
            >
              Disconnect
            </button>
            <button
              type="button"
              disabled={!isInitialized || sending || !account?.address}
              onClick={handleTestSend}
              className="rounded border px-3 py-2 text-xs disabled:opacity-40"
            >
              {sending ? "Sending…" : "Test gasless SBC self-send (0.000001 SBC)"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error.message}</p>}
      {txStatus && <p className="text-xs text-green-700">{txStatus}</p>}
      {txError && <p className="text-xs text-red-600">{txError}</p>}
    </div>
  );
}
