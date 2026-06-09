---
name: sbc-appkit
description: "Wires SBC AppKit (useSbcPara) for gasless ERC-4337 user operations in any Next.js or Vite app. Covers Para viem client setup, useSbcPara hook, sendUserOperation for gasless SBC ERC-20 transfers, smart account address, and SBC balance. Use when: SBC AppKit, useSbcPara, gasless transactions, sendUserOperation, account abstraction, smart account, SBC balance, ERC-4337. Requires Para wallet already set up (use @sbc-para-wallet first if not). Agent installs packages automatically — only asks for SBC API key."
---

# SBC AppKit setup

Wire `useSbcPara` for gasless user operations via SBC's account abstraction infrastructure.

> **Using Radius?** Use `@sbc-radius-integration` instead — it includes AppKit setup plus chain config and Para wallet in one shot.

## Prerequisites

- Para wallet providers already in place (run `@sbc-para-wallet` first, or check `ParaProvider` exists)
- A chain config exporting `getChain()` and `getRpcUrl()` (e.g. `src/config/radius.ts` from `@sbc-radius-integration`)

## What this skill does

1. Installs `@stablecoin.xyz/react@^0.6.1` + `@stablecoin.xyz/core@^1.6.1`
2. Creates Para viem client hooks (`useParaViemRadius` / `usePara`)
3. Creates `useSbcRadiusPara` — wraps `useSbcPara` with signature normalization
4. Exposes `sbcAppKit.sendUserOperation` for gasless SBC ERC-20 transfers
5. Asks for **SBC API key** only (from [dashboard.stablecoin.xyz](https://dashboard.stablecoin.xyz/))

## Agent mandate

### Step 0 — Install

```bash
npm install @stablecoin.xyz/react@^0.6.1 @stablecoin.xyz/core@^1.6.1
```

If `.env.local` is missing `NEXT_PUBLIC_SBC_API_KEY`, ask the user once:

> Paste your **SBC API key** (from dashboard.stablecoin.xyz).

Write `NEXT_PUBLIC_SBC_API_KEY=...` into `.env.local`.

### Steps 1–2 — Implement

1. Copy [templates/use-para-viem-radius.ts](templates/use-para-viem-radius.ts) → `src/lib/para/hooks.ts`
2. Copy [templates/use-sbc-radius-para.ts](templates/use-sbc-radius-para.ts) → `src/lib/sbc/use-sbc-radius-para.ts`

Both files import from `@/config/radius` — if the app uses a different chain, update the chain import accordingly.

### Step 3 — Use in UI

```typescript
import { useSbcRadiusPara } from "@/lib/sbc/use-sbc-radius-para";
import { erc20Abi, encodeFunctionData, parseUnits } from "viem";

const { sbcAppKit, account, isInitialized, publicClient } = useSbcRadiusPara();

// Gasless SBC ERC-20 self-transfer (0.000001 SBC)
const data = encodeFunctionData({
  abi: erc20Abi,
  functionName: "transfer",
  args: [account.address, parseUnits("0.000001", 6)],
});
await sbcAppKit.sendUserOperation({ to: SBC_TOKEN, value: "0", data });
```

### Step 4 — Verify

```bash
npx tsc --noEmit
```

### Step 5 — Done

Tell the user: run `npm run dev -- -p 3003` and connect with Para to test a gasless send.

**Never ask for:** wallet address, private key, seed phrase.

## Key facts

| Package | Version |
| ------- | ------- |
| `@stablecoin.xyz/react` | `^0.6.1` |
| `@stablecoin.xyz/core` | `^1.6.1` (required for Radius gas + receipt polling) |

- SBC token on Radius (testnet + mainnet): `0x33ad9e4BD16B69B5BFdED37D8B5D9fF9aba014Fb`, **6 decimals**
- `sendUserOperation` takes `value: "0"` for ERC-20 transfers — do not pass native RUSD value
- `paraViemClients` must always be an object (never `null`) — passing null skips AppKit initialization
- Always include `normalizeSignatureToRSV` + `wrappedWalletClient` for the embedded Para wallet path

## Templates

| File | Copy to |
| ---- | ------- |
| [use-para-viem-radius.ts](templates/use-para-viem-radius.ts) | `src/lib/para/hooks.ts` |
| [use-sbc-radius-para.ts](templates/use-sbc-radius-para.ts) | `src/lib/sbc/use-sbc-radius-para.ts` |

## Reference links

- [SBC AppKit Docs](https://docs.stablecoin.xyz/account-abstraction/app-kit)
- [SBC Dashboard](https://dashboard.stablecoin.xyz)
- [SBC Docs (full)](https://docs.stablecoin.xyz/llms-full.txt)
