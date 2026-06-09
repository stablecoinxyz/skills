"use client";

/**
 * Dynamic loader for ParaWalletDemo — copy to src/components/ParaWalletDemoLoader.tsx
 * Use this in pages instead of importing ParaWalletDemo directly (avoids SSR errors).
 */
import dynamic from "next/dynamic";

const ParaWalletDemo = dynamic(() => import("@/components/ParaWalletDemo"), {
  ssr: false,
  loading: () => <p className="font-mono text-xs opacity-70">Loading wallet…</p>,
});

export default function ParaWalletDemoLoader() {
  return <ParaWalletDemo />;
}
