"use client";

import dynamic from "next/dynamic";

const RadiusParaConnect = dynamic(() => import("@/components/RadiusParaConnect"), {
  ssr: false,
  loading: () => <p className="font-mono text-xs opacity-70">Loading wallet…</p>,
});

export default function RadiusParaConnectLoader() {
  return <RadiusParaConnect />;
}
