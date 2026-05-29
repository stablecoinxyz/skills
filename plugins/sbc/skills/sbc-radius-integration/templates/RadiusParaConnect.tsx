"use client";

/**
 * Para connect + Radius gasless test — copy to src/components/RadiusParaConnect.tsx
 * Requires ParaProviders ancestor.
 */
import { useModal, useAccount } from "@getpara/react-sdk";
import { useState } from "react";
import { useSbcRadiusPara } from "@/lib/sbc/use-sbc-radius-para";

export default function RadiusParaConnect() {
  const sbcKey = process.env.NEXT_PUBLIC_SBC_API_KEY ?? process.env.VITE_SBC_API_KEY;
  const paraKey = process.env.NEXT_PUBLIC_PARA_API_KEY ?? process.env.VITE_PARA_API_KEY;

  if (!sbcKey || !paraKey) {
    return (
      <p className="font-mono text-xs">
        Set NEXT_PUBLIC_SBC_API_KEY and NEXT_PUBLIC_PARA_API_KEY in .env.local, then restart dev.
      </p>
    );
  }

  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const {
    account,
    sbcAppKit,
    isInitialized,
    error,
    chain,
    disconnectWallet,
  } = useSbcRadiusPara();
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleTestSend = async () => {
    if (!sbcAppKit || !account?.address) return;
    setSending(true);
    setTxError(null);
    setTxStatus(null);
    try {
      await sbcAppKit.sendUserOperation({
        to: account.address,
        value: "1",
        data: "0x",
      });
      setTxStatus("User operation submitted");
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
        <button type="button" onClick={() => openModal()} className="rounded border px-3 py-2 text-xs">
          Connect with Para
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => disconnectWallet()} className="rounded border px-3 py-2 text-xs">
            Disconnect
          </button>
          <button
            type="button"
            disabled={!isInitialized || sending || !account?.address}
            onClick={handleTestSend}
            className="rounded border px-3 py-2 text-xs disabled:opacity-40"
          >
            {sending ? "Sending…" : "Test gasless self-send (1 wei RUSD)"}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error.message}</p>}
      {account?.address && (
        <p className="break-all text-xs opacity-80">smart account: {account.address}</p>
      )}
      {txStatus && <p className="text-xs text-green-700">{txStatus}</p>}
      {txError && <p className="text-xs text-red-600">{txError}</p>}
    </div>
  );
}
