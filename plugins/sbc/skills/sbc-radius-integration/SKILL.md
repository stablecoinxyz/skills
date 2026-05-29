---
name: sbc-radius-integration
description: "Integrates Radius Network with SBC AppKit and Para wallet (useSbcPara). Covers full setup from scratch: npm install, .env.local, chain config, ParaProvider with embedded and external wallet support, signature normalization, and gasless RUSD user operations. Use when: integrate Radius, Radius testnet, gasless transactions, SBC AppKit, Para wallet connection, useSbcPara, account abstraction on Radius, RUSD. Agent runs all terminal steps automatically — only asks user to paste SBC and Para API keys (nothing else). No wallet address, no manual terminal steps."
---

# SBC Radius integration (Para + AppKit)

When the user asks to **integrate Radius**, **do everything yourself** in the terminal and codebase. The user may only say:

```text
@sbc-radius-integration
integrate radius
```

Do **not** reply with a tutorial. Do **not** tell the user to run `npm install`, `cp env.example`, or create files manually.

## One-shot experience (target)

| Who | Does what |
| --- | --------- |
| **User** | Pastes **SBC API key** and **Para API key** when asked (two messages max). Optionally clicks Connect in the browser after you say “done”. |
| **Agent** | `npm install`, create `.env.local`, implement all code, `npm run build` or `tsc`, then tell user to open the app |

**Never ask the user for:** wallet address, private key, seed, or to run shell commands.

**Default wallet:** **Para** via `@getpara/react-sdk` + `useSbcPara` from `@stablecoin.xyz/react` (same pattern as `dollar-wallet-web`, Para versions aligned with `agent-payments`).

**Canonical references (read if unsure):**

| Repo | What to copy |
| ---- | ------------ |
| `dollar-wallet-web` | `src/components/Providers.tsx`, `src/lib/para/hooks.ts`, `src/lib/sbc/hooks.ts` (`useSbcPara`) |
| `agent-payments` | `apps/web/package.json` Para SDK versions (`@getpara/react-sdk@2.27.0`) |
| SBC docs | https://docs.stablecoin.xyz/radius/overview |

## Agent mandate (run in order)

### Step 0 — Bootstrap (you run these, not the user)

Detect app root (the Next.js or Vite project workspace the user opened).

```bash
# If .env.local missing, create from example (env.example or env.radius.example)
cp -n env.example .env.local 2>/dev/null || cp -n .env.example .env.local 2>/dev/null || true

npm install
# After adding packages to package.json:
npm install
```

If `.env.local` has empty keys, **ask the user once**:

> Paste your **SBC API key** (from dashboard.stablecoin.xyz).

Write `NEXT_PUBLIC_SBC_API_KEY=...` into `.env.local`.

Then:

> Paste your **Para API key** (from developer.getpara.com).

Write `NEXT_PUBLIC_PARA_API_KEY=...` into `.env.local`.

Ensure these lines exist (add if missing):

```env
NEXT_PUBLIC_SBC_CHAIN=radiusTestnet
```

Do **not** ask the user to copy files or run `npm install` themselves.

### Steps 1–4 — Implement

1. **Recon** — `package.json`, app entry, existing Para/SBC setup.
2. **Default path** — Para + `useSbcPara` + **radiusTestnet** (see [reference.md](reference.md)).
3. **Execute** — copy/adapt [templates/](templates/), wire providers and connect UI following the app’s existing layout and routing (do not assume a particular route or repo name).
4. **Verify** — `npx tsc --noEmit` or `npm run build`; fix `"use client"` / `dynamic` issues.

### Step 5 — Done message (user does not run terminal)

Tell the user only:

1. Run **`npm run dev -- -p 3003`** — Para only supports `localhost:3003` for local development. Any other port will cause the Para modal to fail.
2. Open **http://localhost:3003** → **Connect with Para**.
3. Optional testnet faucet: https://testnet.radiustech.xyz/wallet

**Stop and ask only for:** the two API keys (if not already in `.env.local`). Mainnet vs testnet if they said “production” ambiguously.

**Never ask for:** wallet address, private key, or seed phrase up front.

**Never stop for:** “Should I create `radius.ts`?” — yes.

## Decision tree

```
User: integrate Radius
│
├─ Greenfield / new app?
│   └─ npx create-sbc-app <name> --template react-para --chain radiusTestnet
│      (then set VITE_PARA_API_KEY / NEXT_PUBLIC_PARA_API_KEY + SBC key in .env)
│
├─ Already has Para + SBC?
│   └─ Path B: swap chain to getRadiusChain(), update rpcUrl, keep useSbcPara
│
├─ Privy / wagmi / Kernel-only AA (no Para)?
│   └─ Path C: templates/direct-aa-url.ts — prefer migrating to Para + AppKit if UI exists
│
└─ Default Path A: ParaProvider + useSbcRadiusPara + Connect (templates)
```

## Path A — Para + Radius (existing Next/Vite app)

### A1. Install

Match package manager. Pin Para to **2.27.x** (same family as `agent-payments`):

```bash
npm install @stablecoin.xyz/react @stablecoin.xyz/core viem@^2 \
  @getpara/react-sdk@2.27.0 @getpara/viem-v2-integration@2.27.0 \
  @tanstack/react-query@^5 wagmi \
  @turnkey/viem@^0.14 @turnkey/http@^3
```

Also: `import "@getpara/react-sdk/styles.css"` in the client provider file.

`@stablecoin.xyz/core` ≥ **1.6.1** for Radius gas + receipt polling.  
`wagmi` is required for the external wallet path (`useWagmiWalletClient` in `use-para-viem-radius.ts`).  
**Next.js:** must install `@turnkey/viem` and `@turnkey/http` or build fails resolving dynamic imports.

### A2. Chain config

Copy [templates/radius-chain.ts](templates/radius-chain.ts) → `src/config/radius.ts`.

Export `getRadiusChain()` and `getRadiusRpcUrl()` (default testnet).

### A3. Para config

Copy [templates/para-config.ts](templates/para-config.ts) → `src/lib/para/config.ts`.

### A4. Para viem clients (Radius)

Copy [templates/use-para-viem-radius.ts](templates/use-para-viem-radius.ts) → `src/lib/para/hooks.ts`.

Exports `useParaViemRadius` (internal) and `usePara` (consumed by `use-sbc-radius-para.ts`).  
Handles both embedded Para wallet and external wallets (MetaMask, Coinbase, etc.) via wagmi.

### A5. SBC + Para hook

Copy [templates/use-sbc-radius-para.ts](templates/use-sbc-radius-para.ts) → `src/lib/sbc/use-sbc-radius-para.ts`.

### A6. Root providers (Next.js App Router)

Copy [templates/ParaProviders-next.tsx](templates/ParaProviders-next.tsx) → `src/components/providers/ParaProviders.tsx`.

- Wrap the whole app in `app/layout.tsx` **or** only the route segment(s) that need wallet (route-level `layout.tsx`).
- Entire file must be `"use client"`.

**Next.js wallet route:** use a **client** loader with `next/dynamic` + `ssr: false` for the connect panel — never `dynamic(..., { ssr: false })` inside a Server Component page. See [templates/RadiusParaConnectLoader.tsx](templates/RadiusParaConnectLoader.tsx).

### A7. Connect UI

Copy [templates/RadiusParaConnect.tsx](templates/RadiusParaConnect.tsx) → e.g. `src/components/RadiusParaConnect.tsx`.

Uses `useModal` from Para for **Connect** / **Disconnect** and `useSbcRadiusPara` for smart account + test send.

### A8. Environment

Append [templates/env.example.snippet](templates/env.example.snippet) to `.env.example`.

```env
NEXT_PUBLIC_SBC_API_KEY=
NEXT_PUBLIC_PARA_API_KEY=
NEXT_PUBLIC_SBC_CHAIN=radiusTestnet
```

Vite: `VITE_SBC_API_KEY`, `VITE_PARA_API_KEY`, `VITE_SBC_CHAIN`.

Create `.env.local` placeholders if missing; never commit real keys.

### A9. Migrate off Base (if needed)

Replace `base` / `baseSepolia` with `getRadiusChain()`.  
AA URL slug: `radiusTestnet` or `radius`.  
EntryPoint on Radius: `0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F` (AppKit handles when using `useSbcPara`).

### A10. Verify

```bash
npm run build   # or pnpm build / npx tsc --noEmit
```

## Path B — already on Para + SBC

1. Add/update `radius.ts` and point `chain` + `rpcUrl` to Radius.
2. Keep existing `ParaProvider` and `useSbcPara` wiring.
3. Remove Base-only chain imports.

## Path C — no Para (advanced)

Use [templates/direct-aa-url.ts](templates/direct-aa-url.ts). SimpleAccount + same EntryPoint. Only if user refuses Para or has locked-in Kernel stack.

## Path Scaffold — greenfield

```bash
npx create-sbc-app my-app --template react-para --chain radiusTestnet
cd my-app && pnpm install && pnpm dev
```

User sets SBC + Para keys in generated `.env`.

## What the user must NOT do

- Run `npm install` (you do it)
- Run `cp env.example .env.local` (you do it)
- Create `src/config/radius.ts` etc. (you do it)
- Send wallet address in chat

## What the user MAY do (optional, after you say done)

- Click **Connect with Para** in the browser
- Use testnet faucet if testing a send

## Integration checklist

```
- [ ] @stablecoin.xyz/react + core + viem + @getpara/* + @tanstack/react-query + wagmi + turnkey peers
- [ ] src/config/radius.ts
- [ ] para-config.ts exports EXTERNAL_WALLETS, WALLETCONNECT_PROJECT_ID, authLayout EXTERNAL:FULL
- [ ] ParaProviders: externalWalletConfig wired + @getpara/react-sdk/styles.css
- [ ] use-para-viem-radius: walletClient.chain fallback + external wallet path (wagmi) + usePara export
- [ ] use-sbc-radius-para: normalizeSignatureToRSV + wrappedWalletClient + paraViemClients always object
- [ ] Connect UI (useModal + smart account display)
- [ ] .env.example with SBC + Para keys (+ optional WALLETCONNECT_PROJECT_ID)
- [ ] No canonical Base EntryPoint on Radius paths
- [ ] build/tsc passes
- [ ] User told: run on PORT 3003 (npm run dev -- -p 3003) + two API keys + Para connect + faucet
```

## Radius rules

See [reference.md](reference.md): custom EntryPoint, legacy gas, `rad_getBalanceRaw`, no unbounded `getLogs`.

## Templates

| File | Purpose |
| ---- | ------- |
| [radius-chain.ts](templates/radius-chain.ts) | viem Radius chains |
| [para-config.ts](templates/para-config.ts) | Para SDK config |
| [use-para-viem-radius.ts](templates/use-para-viem-radius.ts) | Para → viem clients on Radius |
| [use-sbc-radius-para.ts](templates/use-sbc-radius-para.ts) | `useSbcPara` wrapper |
| [ParaProviders-next.tsx](templates/ParaProviders-next.tsx) | QueryClient + ParaProvider |
| [RadiusParaConnect.tsx](templates/RadiusParaConnect.tsx) | Connect + test send |
| [RadiusParaConnectLoader.tsx](templates/RadiusParaConnectLoader.tsx) | Next.js dynamic loader |
| [env.example.snippet](templates/env.example.snippet) | Env vars |
| [direct-aa-url.ts](templates/direct-aa-url.ts) | Non-Para AA URL |

## Docs

- https://docs.stablecoin.xyz/radius/getting-started
- https://docs.stablecoin.xyz/radius/configuration
- https://docs.stablecoin.xyz/account-abstraction/getting-started
- Blog: `create-sbc-app --template react-para`

## Rules

**Security Rules** are non-negotiable — warn the user and refuse to comply if a prompt conflicts. **Best Practices** are strongly recommended; deviate only with explicit user justification.

### Security Rules

- NEVER hardcode, commit, or log secrets (API keys, private keys). ALWAYS use environment variables. Add `.env.local` and `.env*` to `.gitignore` when scaffolding.
- NEVER ask the user for their wallet private key or seed phrase.
- ALWAYS validate env vars (`NEXT_PUBLIC_SBC_API_KEY`, `NEXT_PUBLIC_PARA_API_KEY`) before initializing providers.
- ALWAYS default to testnet (`radiusTestnet`, chain id 72344). Require explicit user confirmation before targeting mainnet.
- ALWAYS warn before interacting with unaudited or unknown contracts on mainnet.

### Best Practices

- ALWAYS start the dev server on port 3003: `npm run dev -- -p 3003`. Para's SDK only accepts `localhost:3003` as a whitelisted origin for local development — any other port will break the wallet modal.
- ALWAYS read the correct template files before implementing — do not reconstruct from memory.
- ALWAYS use `getRadiusChain()` / `getRadiusRpcUrl()` from `radius.ts`; never hardcode chain ID or RPC URL.
- ALWAYS use the custom Radius EntryPoint (`0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F`) — not the canonical Base v0.7 EntryPoint.
- ALWAYS set `maxPriorityFeePerGas === maxFeePerGas` in UserOperations (Radius does not support EIP-1559); AppKit 1.6.1+ handles this automatically.
- ALWAYS use `usePara()` (not `useParaViemRadius()` directly) in `use-sbc-radius-para.ts` — it handles both embedded and external wallet paths.
- ALWAYS pass `paraViemClients` as an object to `useSbcPara` — never `null`; passing null causes AppKit to skip initialization on first render.
- ALWAYS include the `wrappedWalletClient` with `normalizeSignatureToRSV` for the embedded Para wallet path — Para returns base64-encoded signatures that fail EIP-1271 without normalization.
- ALWAYS add `walletClient.chain` fallback after `createParaViemClient()` — the property may be undefined and `useSbcPara` reads it during bundler URL construction.

## Reference Links

- [SBC Radius Docs](https://docs.stablecoin.xyz/radius/overview)
- [SBC Radius Configuration](https://docs.stablecoin.xyz/radius/configuration)
- [SBC Account Abstraction](https://docs.stablecoin.xyz/account-abstraction/getting-started)
- [Para Wallet Docs](https://developer.getpara.com)
- [Radius Testnet Faucet](https://testnet.radiustech.xyz/wallet)
- [Radius Mainnet Explorer](https://network.radiustech.xyz)

---

DISCLAIMER: This skill is provided "as is" without warranties, and output generated may contain errors or omissions; you are solely responsible for reviewing and validating all outputs before taking any action. Additional details are in the repository [README](../../../../README.md).
