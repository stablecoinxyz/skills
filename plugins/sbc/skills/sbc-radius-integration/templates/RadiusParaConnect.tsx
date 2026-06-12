"use client";

/**
 * Para connect + Radius gasless SBC test send — copy to src/components/RadiusParaConnect.tsx
 * Requires ParaProviders ancestor.
 *
 * Fixes vs. naive template:
 *  - Disconnect calls para.logout() (Para SDK) + disconnectWallet() (AppKit)
 *  - Test send transfers SBC ERC-20 (not native RUSD value)
 *  - Shows smart account address + live SBC balance
 *  - Links to Radius explorer (smart account, SBC token, tx hash after send)
 *  - Displays result.transactionHash after successful sendUserOperation
 */
import { useModal, useAccount, useClient } from "@getpara/react-sdk";
import { useState, useEffect, useCallback } from "react";
import { erc20Abi, encodeFunctionData, parseUnits, formatUnits } from "viem";
import { useSbcRadiusPara } from "@/lib/sbc/use-sbc-radius-para";

// SBC token on Radius testnet + mainnet (same address, 6 decimals)
const SBC_TOKEN = "0x33ad9e4BD16B69B5BFdED37D8B5D9fF9aba014Fb" as const;
const SBC_DECIMALS = 6;

function explorerAddressUrl(explorerBase: string, address: string) {
  return `${explorerBase.replace(/\/$/, "")}/address/${address}`;
}

function explorerTxUrl(explorerBase: string, txHash: string) {
  return `${explorerBase.replace(/\/$/, "")}/tx/${txHash}`;
}

export default function RadiusParaConnect() {
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
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sbcBalance, setSbcBalance] = useState<string | null>(null);

  const explorerBase = chain.blockExplorers?.default?.url ?? "https://testnet.radiustech.xyz";

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
    setTxHash(null);
    try {
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [account.address as `0x${string}`, parseUnits("0.000001", SBC_DECIMALS)],
      });
      const result = await sbcAppKit.sendUserOperation({
        to: SBC_TOKEN,
        value: "0",
        data,
      });
      setTxHash(result.transactionHash);
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
        {chain.name} (id {chain.id}) · Para + SBC AppKit
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
              <p className="text-xs opacity-70">
                <a
                  href={explorerAddressUrl(explorerBase, account.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  View smart account on Radius explorer
                </a>
                {" · "}
                <a
                  href={explorerAddressUrl(explorerBase, SBC_TOKEN)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  SBC token
                </a>
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

      {error && (
        <p className="text-xs text-red-600">{error.message}</p>
      )}
      {txStatus && (
        <div className="space-y-2 rounded border border-green-200 bg-green-50/50 p-3 text-xs text-green-800">
          <p>{txStatus}</p>
          {txHash && (
            <div className="space-y-1">
              <p className="font-medium">Transaction hash</p>
              <p className="break-all font-mono opacity-90">{txHash}</p>
              <a
                href={explorerTxUrl(explorerBase, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block underline underline-offset-2"
              >
                View on Radius explorer →
              </a>
            </div>
          )}
        </div>
      )}
      {txError && (
        <p className="text-xs text-red-600">{txError}</p>
      )}
    </div>
  );
}
