---
name: sbc-radius-integration
description: Fully integrates Radius Network into the user's app using SBC AppKit (install, config, providers, env, wallet chain, gasless txs). Use when the user says integrate Radius, add Radius to my platform/app, Radius testnet/mainnet, RUSD, radiusTestnet, switch from Base to Radius, or any Radius + SBC account abstraction request. Executes autonomously—writes code and runs installs; only stops for a missing API key or ambiguous mainnet vs testnet in production.
---

# SBC Radius integration (autonomous)

When the user asks to **integrate Radius** (or similar), **implement it in their repo**. Do not reply with a tutorial and stop. Follow this playbook end-to-end unless blocked.

## Agent mandate

1. **Recon first** — read `package.json`, env files, existing web3/AA setup, app entry (`app/layout.tsx`, `main.tsx`, `_app.tsx`).
2. **Choose path** — see decision tree below; default **AppKit + radiusTestnet**.
3. **Execute** — install deps, create files from [templates/](templates/), wire providers, update `.env.example`, add optional demo component.
4. **Migrate** — if Base/Base Sepolia is configured, switch chain + EntryPoint + account type per [reference.md](reference.md).
5. **Verify** — run `npm run build` / `pnpm build` / `tsc --noEmit` when available; fix import paths and `"use client"` boundaries.
6. **Report** — list files changed + **only** these human steps: paste API key, faucet for testnet.

**Stop and ask the user only if:**

- No API key in env **and** you cannot add `.env.local` with a placeholder they must fill (one line).
- They said "production" but did not say mainnet vs testnet (default testnet; ask once if deploying to real users).
- Repo has no frontend and no clear backend entry (rare).

**Never stop for:** "Should I create `radius.ts`?" — yes, create it.

## Decision tree

```
User: integrate Radius
│
├─ Empty / new app folder requested?
│   └─ YES → npx create-sbc-app <name> --chain radiusTestnet (or --chain radius)
│            cd, install, dev. DONE unless they asked to add to existing monorepo package.
│
├─ Already has @stablecoin.xyz/react or core?
│   └─ YES → Path B (upgrade): bump to latest @stablecoin.xyz/*, swap chain to Radius templates
│
├─ Has Privy / wagmi / permissionless / Kernel-only AA?
│   └─ YES → Path C (direct AA URL) + SimpleAccount + Radius EntryPoint; see templates/direct-aa-url.ts
│            Prefer migrating to AppKit if the app has no deep Kernel lock-in.
│
└─ Default → Path A (AppKit embed in existing React/Next/Vite app)
```

| Path | When | Packages |
|------|------|----------|
| **A** AppKit embed | Next/Vite/React with UI | `@stablecoin.xyz/react` `@stablecoin.xyz/core` `viem` (≥1.6.1 core) |
| **B** Upgrade | Already SBC | Same packages, change chain config only |
| **C** Direct AA | Custom AA stack | `viem` + their bundler client; URL below |
| **Scaffold** | Greenfield | `npx create-sbc-app` |

## Path A — step-by-step (existing app)

### A1. Install (detect package manager)

```bash
# npm | pnpm | yarn — match repo
npm install @stablecoin.xyz/react @stablecoin.xyz/core viem@^2 @turnkey/viem@^0.14 @turnkey/http@^3
```

Pin `@stablecoin.xyz/core` to **1.6.1+** if resolving versions (Radius legacy gas + receipt polling).

**Next.js:** `@stablecoin.xyz/core` dynamically imports `@turnkey/viem` (optional peer). Install it anyway or the build fails with "Can't resolve '@turnkey/viem'".

### A2. Create chain config

Copy [templates/radius-chain.ts](templates/radius-chain.ts) → `src/config/radius.ts` or `lib/chains/radius.ts` (match project aliases).

### A3. Create SBC config

Copy [templates/sbc-radius-config.ts](templates/sbc-radius-config.ts) → `src/lib/sbc/config.ts` (adjust `@/` imports to project paths).

### A4. Provider wrapper

| Framework | Action |
|-----------|--------|
| **Next.js App Router** | Copy [templates/SbcProviders-next.tsx](templates/SbcProviders-next.tsx) → `src/components/providers/SbcProviders.tsx`. Demo/wallet UI: use a **client** loader with `next/dynamic` + `ssr: false` — never call `dynamic(..., { ssr: false })` from a Server Component page. In `app/layout.tsx`: wrap `{children}` only if the whole app needs SBC; otherwise scope provider to the demo route. |
| **Next.js Pages** | Same provider; wrap in `pages/_app.tsx`. |
| **Vite** | Copy [templates/vite-main.tsx.snippet](templates/vite-main.tsx.snippet) pattern into `src/main.tsx`. |
| **CRA** | Wrap in `src/index.tsx`. |

### A5. Environment

Append [templates/env.example.snippet](templates/env.example.snippet) to `.env.example`.

Create or update `.env.local`:

```env
NEXT_PUBLIC_SBC_API_KEY=your_api_key_here
NEXT_PUBLIC_SBC_CHAIN=radiusTestnet
```

Use `VITE_` prefix for Vite apps. Add `.env.local` to `.gitignore` if missing.

### A6. Optional UX (recommended)

- Copy [templates/RadiusWalletConnect.tsx](templates/RadiusWalletConnect.tsx) → expose on a dev/settings page or header.
- Copy [templates/add-radius-to-wallet.ts](templates/add-radius-to-wallet.ts) if users report "wrong network" — call before connect.

### A7. Replace Base references (if migrating)

Search repo for: `baseSepolia`, `base`, `0x0000000071727De22E5E9d8BAf0edAc6f37da032`, `Kernel`, `api.aa.stablecoin.xyz/rpc/v1/base`.

| Replace | With |
|---------|------|
| `baseSepolia` / `base` chain | `getRadiusChain()` / `radiusTestnet` |
| Canonical EntryPoint | `0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F` |
| AA URL `.../baseSepolia/...` | `.../radiusTestnet/...` or `.../radius/...` |
| Kernel account factory defaults | SimpleAccount (AppKit handles) |

### A8. Send transactions

Use hooks everywhere possible:

```typescript
import { useUserOperation } from "@stablecoin.xyz/react";

const { sendUserOperation } = useUserOperation();
await sendUserOperation({
  to: "0x…",
  value: "1000000000000000000", // 1 RUSD, 18 decimals
  data: "0x",
});
```

Batch: `sendUserOperation({ calls: [...] })`.

### A9. Build verification

```bash
npm run build   # or pnpm / yarn equivalent
```

Fix: missing `"use client"`, wrong env prefix, server component importing hooks.

## Path B — already on SBC AppKit

1. Ensure templates/radius-chain + config exist (A2–A3).
2. Change `chain:` in existing `SbcProvider` config to `getRadiusChain()`.
3. Remove manual Kernel/EntryPoint overrides unless required.
4. Run A8–A9.

## Path C — Privy / permissionless / wagmi only

1. Set bundler **and** paymaster to the same URL ([templates/direct-aa-url.ts](templates/direct-aa-url.ts)).
2. EntryPoint: `0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F`.
3. Smart account: **SimpleAccount**, not Kernel.
4. UserOp gas: `maxPriorityFeePerGas === maxFeePerGas`.
5. Receipts: `pimlico_getUserOperationStatus`, not unbounded `eth_getLogs`.

If migration cost is high, document C in PR; still add `src/config/radius.ts` and AA URL helper.

## Path Scaffold — greenfield

```bash
npx create-sbc-app <app-name> --chain radiusTestnet
cd <app-name> && pnpm install && pnpm dev
```

For mainnet: `--chain radius`. Tell user to set API key in generated `.env`.

## Human-only steps (after you finish)

Tell the user exactly this:

1. Get API key: https://dashboard.stablecoin.xyz/ → set `NEXT_PUBLIC_SBC_API_KEY` (or `VITE_SBC_API_KEY`).
2. **Testnet:** fund wallet at https://testnet.radiustech.xyz/wallet
3. **Mainnet:** set `NEXT_PUBLIC_SBC_CHAIN=radius` and use production keys.

Do not ask them to create files you can create.

## Integration checklist (agent self-check)

Copy and mark before saying "done":

```
- [ ] @stablecoin.xyz/react + core + viem installed
- [ ] src/config/radius.ts (mainnet + testnet + getRadiusChain)
- [ ] src/lib/sbc/config.ts with EntryPoint override
- [ ] SbcProvider wraps app root (client boundary correct)
- [ ] .env.example updated; .env.local template or placeholder
- [ ] No canonical Base EntryPoint left on Radius code paths
- [ ] AA URL uses radiusTestnet or radius slug if direct integration
- [ ] build/typecheck passes (or documented blocker)
- [ ] User told: API key + faucet only
```

## Radius rules (do not violate)

- EntryPoint: `0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F` only on Radius.
- No EIP-1559 mismatch on UserOps (AppKit ≥1.6.1 handles).
- Balance display: prefer `rad_getBalanceRaw` for spendable RUSD ([reference.md](reference.md)).
- No CREATE2 deployer for large contracts on Radius.
- Docs: https://docs.stablecoin.xyz/radius/overview — not `erc4337/overview` (404).

## Troubleshooting (agent fixes)

| Error | Fix |
|-------|-----|
| Invalid EntryPoint | Radius address in config + AppKit version |
| maxPriorityFeePerGas | Upgrade core; set both fees equal in manual UserOps |
| Chain not configured | `wallet_addEthereumChain` helper or switchChain 72344 |
| getLogs range | Use AppKit or bundler status polling |
| Module not found `@/` | Align tsconfig paths or use relative imports |

## Templates index

| File | Purpose |
|------|---------|
| [templates/radius-chain.ts](templates/radius-chain.ts) | viem chains + env selector |
| [templates/sbc-radius-config.ts](templates/sbc-radius-config.ts) | AppKit config factory |
| [templates/SbcProviders-next.tsx](templates/SbcProviders-next.tsx) | Next App Router provider |
| [templates/RadiusWalletConnect.tsx](templates/RadiusWalletConnect.tsx) | Connect + test send UI |
| [templates/add-radius-to-wallet.ts](templates/add-radius-to-wallet.ts) | MetaMask add chain |
| [templates/env.example.snippet](templates/env.example.snippet) | Env vars |
| [templates/vite-main.tsx.snippet](templates/vite-main.tsx.snippet) | Vite entry wrap |
| [templates/direct-aa-url.ts](templates/direct-aa-url.ts) | Non-AppKit AA URL |

Contracts, RPCs, paymaster addresses: [reference.md](reference.md)

## Docs

- https://docs.stablecoin.xyz/radius/getting-started
- https://docs.stablecoin.xyz/radius/configuration
- https://docs.stablecoin.xyz/account-abstraction/getting-started
