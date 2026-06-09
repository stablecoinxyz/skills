"use client";

/**
 * Para wallet connect / disconnect demo — copy to src/components/ParaWalletDemo.tsx
 * Requires ParaProviders ancestor.
 * Wrap in ParaWalletDemoLoader (ssr: false) before using in a page.
 */
import { useModal, useAccount, useClient } from "@getpara/react-sdk";

export default function ParaWalletDemo() {
  const paraKey =
    process.env.NEXT_PUBLIC_PARA_API_KEY ?? process.env.VITE_PARA_API_KEY;

  if (!paraKey) {
    return (
      <p className="font-mono text-xs">
        Set NEXT_PUBLIC_PARA_API_KEY in .env.local, then restart dev.
      </p>
    );
  }

  const { openModal } = useModal();
  const { isConnected, address } = useAccount();
  const para = useClient();

  const handleDisconnect = async () => {
    try {
      await para?.logout();
    } catch {
      // para.logout() may throw if already logged out — ignore
    }
  };

  return (
    <div className="space-y-4 font-mono text-sm">
      <p className="text-xs opacity-70">Para wallet · embedded + external</p>

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
          {address && (
            <p className="break-all text-xs opacity-80">address: {address}</p>
          )}
          <button
            type="button"
            onClick={handleDisconnect}
            className="rounded border px-3 py-2 text-xs"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
