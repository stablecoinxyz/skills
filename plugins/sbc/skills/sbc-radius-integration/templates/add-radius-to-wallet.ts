/**
 * Call from a Connect button onClick if wallet_addEthereumChain is needed.
 */
export async function addRadiusTestnetToWallet(ethereum?: {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}) {
  const provider = ethereum ?? (typeof window !== "undefined" ? window.ethereum : undefined);
  if (!provider?.request) {
    throw new Error("No injected wallet found");
  }
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0x11A98",
        chainName: "Radius Testnet",
        nativeCurrency: { name: "RUSD", symbol: "RUSD", decimals: 18 },
        rpcUrls: ["https://rpc.testnet.radiustech.xyz"],
        blockExplorerUrls: ["https://testnet.radiustech.xyz"],
      },
    ],
  });
}

export async function addRadiusMainnetToWallet(ethereum?: {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}) {
  const provider = ethereum ?? (typeof window !== "undefined" ? window.ethereum : undefined);
  if (!provider?.request) throw new Error("No injected wallet found");
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0xB0EEF",
        chainName: "Radius Network",
        nativeCurrency: { name: "RUSD", symbol: "RUSD", decimals: 18 },
        rpcUrls: ["https://rpc.radiustech.xyz"],
        blockExplorerUrls: ["https://network.radiustech.xyz"],
      },
    ],
  });
}
