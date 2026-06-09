"use client";

/**
 * Dynamic loader for AppKitDemo — copy to src/components/AppKitDemoLoader.tsx
 * Use this in pages instead of importing AppKitDemo directly (avoids SSR errors).
 */
import dynamic from "next/dynamic";

const AppKitDemo = dynamic(() => import("@/components/AppKitDemo"), {
  ssr: false,
  loading: () => <p className="font-mono text-xs opacity-70">Loading wallet…</p>,
});

export default function AppKitDemoLoader() {
  return <AppKitDemo />;
}
