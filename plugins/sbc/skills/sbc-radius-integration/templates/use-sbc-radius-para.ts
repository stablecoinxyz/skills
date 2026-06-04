"use client";

/**
 * SBC AppKit + Para on Radius — copy to src/lib/sbc/use-sbc-radius-para.ts
 *
 * Key fixes vs. a naive useSbcPara wrapper:
 *  1. normalizeSignatureToRSV — Para returns base64 / non-standard hex.
 *  2. toSbcWalletClient — omit `request` so permissionless toOwner() does not call eth_accounts.
 *  3. signViaParaViem — UserOp signing uses native paraWalletClient.signMessage (not
 *     signMessageAsync / EIP-191), which avoids AA24 signature errors.
 *  4. paraViemClients is always an object (never null) so useSbcPara initializes on first connect.
 */
import { useRef, useMemo, useCallback } from "react";
import { useAccount, useWallet, useSignMessage } from "@getpara/react-sdk";
import { useSbcPara } from "@stablecoin.xyz/react";
import { recoverAddress, hashMessage } from "viem";
import { hexToBytes } from "viem/utils";
import { usePara } from "@/lib/para/hooks";
import { getRadiusChain, getRadiusRpcUrl } from "@/config/radius";

function getSbcApiKey(): string {
  return process.env.NEXT_PUBLIC_SBC_API_KEY ?? process.env.VITE_SBC_API_KEY ?? "";
}

function assembleSignature(r: `0x${string}`, s: `0x${string}`, v: number): `0x${string}` {
  const vHex = v.toString(16).padStart(2, "0");
  return (r + s.slice(2) + vHex) as `0x${string}`;
}

/**
 * Wallet client for SBC AppKit — spreads Para viem client but drops `request` so
 * permissionless `toOwner()` does not call `eth_accounts`. UserOp signing uses
 * native `signMessage` + RSV normalization (not signMessageAsync / EIP-191).
 */
function toSbcWalletClient(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  base: any,
  account: { address: `0x${string}`; signMessage: (args: unknown) => Promise<`0x${string}`> },
  chain: ReturnType<typeof getRadiusChain>,
) {
  const { request: _request, ...baseWithoutRequest } = base;
  void _request;

  return {
    ...baseWithoutRequest,
    account,
    chain: base.chain ?? chain,
    signMessage: (args: unknown) => account.signMessage(args),
    signTypedData:
      typeof base.signTypedData === "function"
        ? base.signTypedData.bind(base)
        : undefined,
    signTransaction:
      typeof base.signTransaction === "function"
        ? base.signTransaction.bind(base)
        : undefined,
  };
}

function normalizeSignatureToRSV(sig: string): {
  r: `0x${string}`;
  s: `0x${string}`;
  v: number;
} {
  const toHex = (b: Uint8Array) =>
    ("0x" +
      Array.from(b)
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")) as `0x${string}`;

  let bytes: Uint8Array;
  if (sig.startsWith("0x")) {
    bytes = hexToBytes(sig as `0x${string}`);
  } else if (/^[0-9a-fA-F]+$/.test(sig) && sig.length % 2 === 0) {
    bytes = hexToBytes(`0x${sig}` as `0x${string}`);
  } else {
    const bin = atob(sig);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  }

  const normalizeV = (raw: number): number => {
    if (raw === 0 || raw === 1) return raw + 27;
    if (raw === 27 || raw === 28) return raw;
    return raw;
  };

  if (bytes.length === 65) {
    return {
      r: toHex(bytes.slice(0, 32)),
      s: toHex(bytes.slice(32, 64)),
      v: normalizeV(bytes[64]),
    };
  }

  if (bytes.length === 64) {
    return { r: toHex(bytes.slice(0, 32)), s: toHex(bytes.slice(32, 64)), v: 27 };
  }

  if (bytes.length > 65) {
    const tail = bytes.slice(bytes.length - 65);
    const vTail = normalizeV(tail[64]);
    if (vTail === 27 || vTail === 28) {
      return {
        r: toHex(tail.slice(0, 32)),
        s: toHex(tail.slice(32, 64)),
        v: vTail,
      };
    }

    const vHead = normalizeV(bytes[64]);
    if (vHead === 27 || vHead === 28) {
      return {
        r: toHex(bytes.slice(0, 32)),
        s: toHex(bytes.slice(32, 64)),
        v: vHead,
      };
    }

    if (bytes.length === 97) {
      const vLast = normalizeV(bytes[96]);
      return {
        r: toHex(bytes.slice(32, 64)),
        s: toHex(bytes.slice(64, 96)),
        v: vLast === 27 || vLast === 28 ? vLast : 27,
      };
    }

    return { r: toHex(tail.slice(0, 32)), s: toHex(tail.slice(32, 64)), v: vTail };
  }

  throw new Error(`Invalid signature length: ${bytes.length}`);
}

export function useSbcRadiusPara() {
  const paraAccount = useAccount();
  const { data: wallet } = useWallet();
  const signMsg = useSignMessage();

  const {
    publicClient: paraPublicClient,
    walletClient: paraWalletClient,
    account: paraAccount_viem,
    isExternal,
  } = usePara();

  const signMsgRef = useRef(signMsg);
  signMsgRef.current = signMsg;

  const walletIdRef = useRef(wallet?.id);
  walletIdRef.current = wallet?.id;

  const accountAddressRef = useRef(paraAccount_viem?.address);
  accountAddressRef.current = paraAccount_viem?.address;

  const chain = getRadiusChain();
  const rpcUrl = getRadiusRpcUrl();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stableSignMessage = useCallback(async (message: any): Promise<`0x${string}`> => {
    const walletId = walletIdRef.current;
    if (!walletId) throw new Error("No wallet ID");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toBytes = (m: any): Uint8Array => {
      if (!m) throw new Error("signMessage: missing message");
      if (typeof m === "string") {
        if (m.startsWith("0x")) return hexToBytes(m as `0x${string}`);
        return new TextEncoder().encode(m);
      }
      const raw = m.raw ?? m.bytes ?? m.data ?? m;
      if (typeof raw === "string") {
        if (raw.startsWith("0x")) return hexToBytes(raw as `0x${string}`);
        return new TextEncoder().encode(raw);
      }
      if (raw instanceof Uint8Array) return raw;
      if (raw instanceof ArrayBuffer) return new Uint8Array(raw);
      if (Array.isArray(raw)) return new Uint8Array(raw);
      throw new Error("signMessage: unsupported message format");
    };

    const rawBytes = toBytes(message);
    const isRawHash = rawBytes.length === 32;
    const hashHex =
      typeof message === "object" && message?.raw && typeof message.raw === "string"
        ? message.raw
        : (("0x" +
            Array.from(rawBytes)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("")) as `0x${string}`);

    const b64 = btoa(String.fromCharCode(...rawBytes));
    const res = await signMsgRef.current.signMessageAsync({
      walletId,
      messageBase64: b64,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sig =
      (res as any)?.signatureBase64 ||
      (res as any)?.signature ||
      (typeof res === "string" ? res : "");

    const { r, s: sInit, v: vInit } = normalizeSignatureToRSV(sig);
    let s = sInit;
    let v = vInit;
    if (v < 27) v += 27;

    const SECP256K1_N = BigInt(
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
    );
    const SECP256K1_HALF_N = SECP256K1_N / BigInt(2);
    const sBigInt = BigInt(s);
    if (sBigInt > SECP256K1_HALF_N) {
      const sNorm = SECP256K1_N - sBigInt;
      s = ("0x" + sNorm.toString(16).padStart(64, "0")) as `0x${string}`;
      v = v === 27 ? 28 : 27;
    }

    if (isRawHash && accountAddressRef.current) {
      const expected = accountAddressRef.current.toLowerCase();
      const eip191Hash = hashMessage({ raw: hashHex as `0x${string}` });
      let found = false;
      for (const candidateHash of [hashHex, eip191Hash]) {
        if (found) break;
        for (const candidateV of [27, 28]) {
          try {
            const recovered = await recoverAddress({
              hash: candidateHash as `0x${string}`,
              signature: { r, s, v: BigInt(candidateV) },
            });
            if (recovered.toLowerCase() === expected) {
              v = candidateV;
              found = true;
              break;
            }
          } catch {
            // skip
          }
        }
      }
    }

    const vHex = v.toString(16).padStart(2, "0");
    return (r + s.slice(2) + vHex) as `0x${string}`;
  }, []);

  const signViaParaViem = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args: any): Promise<`0x${string}`> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const base = paraWalletClient as any;
      if (typeof base?.signMessage !== "function") {
        return stableSignMessage(args?.message ?? args);
      }

      const message = args?.message ?? args;
      const sig = (await base.signMessage({ message })) as `0x${string}`;

      try {
        const { r, s, v } = normalizeSignatureToRSV(sig);
        let vNorm = v;
        if (vNorm < 27) vNorm += 27;
        return assembleSignature(r, s, vNorm);
      } catch {
        return sig;
      }
    },
    [paraWalletClient, stableSignMessage],
  );

  const wrappedWalletClient = useMemo(() => {
    if (!paraWalletClient || !paraAccount_viem || !wallet?.id) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const base = paraWalletClient as any;
    const account = {
      ...paraAccount_viem,
      signMessage: signViaParaViem,
    };
    return toSbcWalletClient(base, account, chain);
  }, [paraWalletClient, paraAccount_viem, wallet?.id, signViaParaViem, chain]);

  const externalWalletClientForSbc = useMemo(() => {
    if (!isExternal || !paraWalletClient?.account) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const base = paraWalletClient as any;
    return toSbcWalletClient(base, base.account, chain);
  }, [isExternal, paraWalletClient, chain]);

  const paraViemClients = useMemo(
    () => ({
      publicClient: paraPublicClient,
      walletClient: isExternal ? externalWalletClientForSbc : wrappedWalletClient,
      account: isExternal ? paraWalletClient?.account : paraAccount_viem,
    }),
    [
      isExternal,
      paraPublicClient,
      wrappedWalletClient,
      externalWalletClientForSbc,
      paraWalletClient,
      paraAccount_viem,
    ],
  );

  const {
    sbcAppKit,
    isInitialized,
    error,
    account,
    isLoadingAccount,
    accountError,
    refreshAccount,
    ownerAddress,
    disconnectWallet,
  } = useSbcPara({
    apiKey: getSbcApiKey(),
    chain,
    paraAccount,
    rpcUrl,
    debug: process.env.NODE_ENV === "development",
    paraViemClients,
  });

  return {
    sbcAppKit,
    isInitialized,
    error,
    account,
    isLoadingAccount,
    accountError,
    refreshAccount,
    ownerAddress,
    disconnectWallet,
    chain,
    isParaConnected: paraAccount.isConnected,
    signRawHash: stableSignMessage,
  };
}
