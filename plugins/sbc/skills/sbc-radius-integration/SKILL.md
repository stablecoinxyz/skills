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

**Related sub-skills (use independently when Radius is not needed):**

| Skill | Use when |
| ----- | -------- |
| `@sbc-para-wallet` | Only need Para wallet setup (any chain) |
| `@sbc-appkit` | Only need SBC AppKit / gasless sends (any chain) |

**Canonical references (read if unsure):**

| Source | What to use |
| ------ | ----------- |
| [reference.md](reference.md) | Stable Radius constants (chain IDs, EntryPoint, env vars) |
| [sbc-llms-full.txt](sbc-llms-full.txt) | Full SBC docs — search before guessing API/SDK behavior |
| [sbc-llms.txt](sbc-llms.txt) | Doc index with page paths |
| `dollar-wallet-web` | `Providers.tsx`, `lib/para/hooks.ts`, `lib/sbc/hooks.ts` (`useSbcPara`) |
| `agent-payments` | Para SDK versions (`@getpara/react-sdk@2.27.0`) |

## SBC documentation (read before guessing)

**Paths after `npx skills add` in the user’s app (read these files with the Read tool — do not guess):**

| What | Path from project root |
| ---- | ---------------------- |
| Full SBC docs | `.cursor/skills/sbc-radius-integration/sbc-llms-full.txt` |
| Doc index | `.cursor/skills/sbc-radius-integration/sbc-llms.txt` |
| Stable Radius constants | `.cursor/skills/sbc-radius-integration/reference.md` |
| This workflow | `.cursor/skills/sbc-radius-integration/SKILL.md` |

Same filenames exist **relative to this skill folder** when the agent runs from the skills repo: `sbc-llms-full.txt`, `sbc-llms.txt`, `reference.md`.

1. **Stable facts:** [reference.md](reference.md).
2. **Full docs:** Read/search `sbc-llms-full.txt` at the path above. If missing, fetch https://docs.stablecoin.xyz/llms-full.txt — do not load the entire file at once; search sections (Radius, AppKit, `useSbcPara`, account abstraction, paymaster, bundler, env vars).
3. **Index:** `sbc-llms.txt` or https://docs.stablecoin.xyz/llms.txt.
4. **Published site:** https://docs.stablecoin.xyz/ when local bundles are stale.

For Radius integration, search `sbc-llms-full.txt` for at least: `Radius`, `useSbcPara`, `AppKit`, `account abstraction`, `paymaster`, `radiusTestnet`.

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

1. **Recon** — `package.json`, app entry, existing Para/SBC setup; skim [sbc-llms.txt](sbc-llms.txt) for relevant doc paths.
2. **Default path** — Para + `useSbcPara` + **radiusTestnet** (see [reference.md](reference.md); search [sbc-llms-full.txt](sbc-llms-full.txt) for SDK details).
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

### A2. Chain config + RPC proxy

Copy [templates/radius-chain.ts](templates/radius-chain.ts) → `src/config/radius.ts`.

The template imports `radius` and `radiusTestnet` from `@stablecoin.xyz/core` (not custom `defineChain`). AppKit matches chains by `chain.id` in `CHAIN_CONFIGS` — a hand-rolled chain named `Radius Network` fails with `Unsupported chain` on mainnet even when the id is correct.

**Next.js only:**

1. Copy [templates/radius-rpc-proxy.ts](templates/radius-rpc-proxy.ts) → `src/lib/radius-rpc-proxy.ts`
2. Copy [templates/api/radius-rpc/route.ts](templates/api/radius-rpc/route.ts) → `src/app/api/radius-rpc/route.ts`
3. Optional: copy [templates/api/radius-rpc/health/route.ts](templates/api/radius-rpc/health/route.ts) → `src/app/api/radius-rpc/health/route.ts` (setup banner / diagnostics)

Production default: client transport uses `/api/radius-rpc`; the proxy reads `RADIUS_RPC_API_KEY` server-side so the key stays out of the browser bundle.

**Local dev:** Cloudflare may block server egress even with a valid key (403). Then set `NEXT_PUBLIC_RADIUS_RPC_URL` to the full authenticated URL (`https://rpc.testnet.radiustech.xyz/YOUR_KEY`). `getRadiusRpcUrl()` prefers that env var and must not branch on `window` (SSR/hydration stability).

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

After a successful `sendUserOperation`, capture `result.transactionHash` and show it in the UI with a link to the Radius block explorer (`chain.blockExplorers.default.url` + `/tx/{hash}`). Also link the smart account and SBC token contract (`/address/{address}`). See [reference.md](reference.md) — outer tx `from`/`to` is bundler → EntryPoint; the user's transfer appears under token transfers / smart account history.

### A8. Environment

Append [templates/env.example.snippet](templates/env.example.snippet) to `.env.example`.

```env
NEXT_PUBLIC_SBC_API_KEY=
NEXT_PUBLIC_PARA_API_KEY=
NEXT_PUBLIC_SBC_CHAIN=radiusTestnet
RADIUS_RPC_API_KEY=        # server-side only — no NEXT_PUBLIC_ prefix
# NEXT_PUBLIC_RADIUS_RPC_URL=https://rpc.testnet.radiustech.xyz/YOUR_KEY  # local dev if proxy 403
```

`RADIUS_RPC_API_KEY` is required for the Next.js proxy. Add `NEXT_PUBLIC_RADIUS_RPC_URL` only when `/api/radius-rpc` returns Cloudflare 403 from the server (dev workaround; key in bundle).  
Vite: `VITE_SBC_API_KEY`, `VITE_PARA_API_KEY`, `VITE_SBC_CHAIN`.

Create `.env.local` placeholders if missing; never commit real keys.

### A9. Migrate off Base (if needed)

Replace `base` / `baseSepolia` with `getRadiusChain()`.  
AA URL slug: `radiusTestnet` or `radius`.  
EntryPoint on Radius: `0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F` (AppKit handles when using `useSbcPara`).

**Mainnet:** `@stablecoin.xyz/core` ≤ 1.6.2 ships `radius` with the wrong chain ID (723 instead of **723487**). Unpatched SDK → `AA24 signature error` on UserOps. Custom `defineChain` with id 723487 → `Unsupported chain: Radius Network`. **Fix both:** (1) copy [templates/@stablecoin.xyz+core+1.6.2.patch](templates/@stablecoin.xyz+core+1.6.2.patch) to `patches/`, (2) `npm i -D patch-package && npx patch-package`, (3) add `"postinstall": "patch-package"` to `package.json`, (4) use SDK exports in `radius.ts` (template already does). Run this whenever `NEXT_PUBLIC_SBC_CHAIN=radius`. Details: [reference.md](reference.md) → "Known SDK bug".

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
- [ ] src/config/radius.ts (SDK `radius` / `radiusTestnet` exports — not custom defineChain)
- [ ] para-config.ts exports EXTERNAL_WALLETS, WALLETCONNECT_PROJECT_ID, authLayout EXTERNAL:FULL
- [ ] ParaProviders: externalWalletConfig wired + @getpara/react-sdk/styles.css
- [ ] use-para-viem-radius: walletClient.chain fallback + external wallet path (wagmi) + usePara export
- [ ] radius-rpc-proxy.ts + /api/radius-rpc (+ optional /api/radius-rpc/health)
- [ ] getRadiusRpcUrl: stable SSR (no window); optional NEXT_PUBLIC_RADIUS_RPC_URL fallback
- [ ] use-sbc-radius-para: toSbcWalletClient (omit request) + signViaParaViem + normalizeSignatureToRSV + paraViemClients always object
- [ ] Connect UI (useModal + smart account display + tx hash + Radius explorer links)
- [ ] .env.example with SBC + Para keys (+ optional WALLETCONNECT_PROJECT_ID)
- [ ] No canonical Base EntryPoint on Radius paths
- [ ] Mainnet only: @stablecoin.xyz+core patch in patches/ + patch-package postinstall (chain ID 723487)
- [ ] Env flip safe: getRadiusChain throws if mainnet selected on unpatched core; rpc URL overrides validated via radiusUrlMatchesSelectedChain
- [ ] build/tsc passes
- [ ] User told: run on PORT 3003 (npm run dev -- -p 3003) + two API keys + Para connect + faucet
```

## Radius rules

See [reference.md](reference.md): custom EntryPoint, legacy gas, `rad_getBalanceRaw`, no unbounded `getLogs`.

## Templates

| File | Purpose |
| ---- | ------- |
| [radius-chain.ts](templates/radius-chain.ts) | SDK Radius chains + getRadiusRpcUrl |
| [radius-rpc-proxy.ts](templates/radius-rpc-proxy.ts) | Shared server RPC proxy helpers |
| [api/radius-rpc/route.ts](templates/api/radius-rpc/route.ts) | Next.js RPC proxy |
| [api/radius-rpc/health/route.ts](templates/api/radius-rpc/health/route.ts) | Optional RPC health check |
| [para-config.ts](templates/para-config.ts) | Para SDK config |
| [use-para-viem-radius.ts](templates/use-para-viem-radius.ts) | Para → viem clients on Radius |
| [use-sbc-radius-para.ts](templates/use-sbc-radius-para.ts) | `useSbcPara` wrapper |
| [ParaProviders-next.tsx](templates/ParaProviders-next.tsx) | QueryClient + ParaProvider |
| [RadiusParaConnect.tsx](templates/RadiusParaConnect.tsx) | Connect + test send + tx hash + explorer links |
| [RadiusParaConnectLoader.tsx](templates/RadiusParaConnectLoader.tsx) | Next.js dynamic loader |
| [env.example.snippet](templates/env.example.snippet) | Env vars |
| [direct-aa-url.ts](templates/direct-aa-url.ts) | Non-Para AA URL |
| [@stablecoin.xyz+core+1.6.2.patch](templates/@stablecoin.xyz+core+1.6.2.patch) | patch-package fix for SDK mainnet chain ID (723 → 723487) |

## Bundled docs files

| File | Refresh |
| ---- | ------- |
| [sbc-llms.txt](sbc-llms.txt) | `curl -sS https://docs.stablecoin.xyz/llms.txt -o sbc-llms.txt` |
| [sbc-llms-full.txt](sbc-llms-full.txt) | `./scripts/sync-sbc-llms.sh` or `curl -sS https://docs.stablecoin.xyz/llms-full.txt -o sbc-llms-full.txt` |

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
- ALWAYS search [sbc-llms-full.txt](sbc-llms-full.txt) (or fetch https://docs.stablecoin.xyz/llms-full.txt) for SDK/API details — do not rely on training data alone.
- ALWAYS use `getRadiusChain()` / `getRadiusRpcUrl()` from `radius.ts`; never hardcode chain ID or RPC URL.
- ALWAYS use SDK `radius` / `radiusTestnet` exports in `radius.ts` (template) — never a custom `defineChain` named `Radius Network` on mainnet; it fails AppKit `CHAIN_CONFIGS` lookup.
- ALWAYS use the custom Radius EntryPoint (`0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F`) — not the canonical Base v0.7 EntryPoint.
- ALWAYS apply the bundled `@stablecoin.xyz+core` patch (templates) before targeting **mainnet** with core ≤ 1.6.2 — the SDK's `radius.id` is 723 but the real chain ID is 723487, causing `AA24 signature error` on every mainnet UserOp (testnet unaffected). If AA24 appears on mainnet only, fix the chain ID — do not rework signing.
- ALWAYS set `maxPriorityFeePerGas === maxFeePerGas` in UserOperations (Radius does not support EIP-1559); AppKit 1.6.1+ handles this automatically.
- ALWAYS use `usePara()` (not `useParaViemRadius()` directly) in `use-sbc-radius-para.ts` — it handles both embedded and external wallet paths.
- ALWAYS pass `paraViemClients` as an object to `useSbcPara` — never `null`; passing null causes AppKit to skip initialization on first render.
- ALWAYS use `toSbcWalletClient` (omit `request` from the Para viem client) so `toOwner()` does not call `eth_accounts` ("address is required").
- ALWAYS route UserOp signing through `signViaParaViem` (native `paraWalletClient.signMessage` + RSV normalize), not `signMessageAsync` alone — otherwise bundler rejects with AA24 signature error.
- ALWAYS include `normalizeSignatureToRSV` for Para signatures (base64 / non-standard hex) before EIP-1271 verification.
- If `/api/radius-rpc` returns 403 from the server, set `NEXT_PUBLIC_RADIUS_RPC_URL` for local dev and restart on port 3003.
- ALWAYS add `walletClient.chain` fallback after `createParaViemClient()` — the property may be undefined and `useSbcPara` reads it during bundler URL construction.

## Reference Links

- [SBC docs (site)](https://docs.stablecoin.xyz/)
- [SBC llms.txt](https://docs.stablecoin.xyz/llms.txt) · [llms-full.txt](https://docs.stablecoin.xyz/llms-full.txt)
- [sbc-docs source](https://github.com/stablecoinxyz/sbc-docs)
- [SBC Radius overview](https://docs.stablecoin.xyz/radius/overview)
- [SBC Radius configuration](https://docs.stablecoin.xyz/radius/configuration)
- [SBC Account Abstraction](https://docs.stablecoin.xyz/account-abstraction/getting-started)
- [Para Wallet Docs](https://developer.getpara.com)
- [Radius Testnet Faucet](https://testnet.radiustech.xyz/wallet)
- [Radius Mainnet Explorer](https://network.radiustech.xyz)

---

DISCLAIMER: This skill is provided "as is" without warranties, and output generated may contain errors or omissions; you are solely responsible for reviewing and validating all outputs before taking any action. Additional details are in the repository [README](../../../../README.md).
