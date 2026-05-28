"use client";

/**
 * Minimal connect + gasless send demo — optional; place in src/components/RadiusWalletConnect.tsx
 */
import { WalletButton, useSbcApp, useUserOperation } from "@stablecoin.xyz/react";
import { useState } from "react";

export function RadiusWalletConnect() {
  const { account, isConnected } = useSbcApp();
  const { sendUserOperation, isLoading, isSuccess, error } = useUserOperation();
  const [status, setStatus] = useState<string | null>(null);

  const handleTestSend = async () => {
    if (!account?.address) return;
    setStatus(null);
    await sendUserOperation({
      to: account.address,
      value: "1",
      data: "0x",
    });
    setStatus("User operation submitted");
  };

  return (
    <div className="space-y-3">
      <WalletButton />
      {isConnected && account && (
        <p className="text-sm text-muted-foreground">
          Smart account: {account.address}
        </p>
      )}
      <button
        type="button"
        disabled={!isConnected || isLoading}
        onClick={handleTestSend}
        className="rounded-md border px-3 py-1.5 text-sm"
      >
        {isLoading ? "Sending…" : "Test gasless self-send (1 wei RUSD)"}
      </button>
      {isSuccess && <p className="text-sm text-green-700">Success</p>}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}
