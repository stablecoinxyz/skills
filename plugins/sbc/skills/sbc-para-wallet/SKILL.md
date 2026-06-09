---
name: sbc-para-wallet
description: "Sets up Para wallet in any Next.js or Vite app with SBC. Installs @getpara/react-sdk, configures ParaProvider, QueryClient, embedded + external wallet support (MetaMask, Coinbase, WalletConnect), and creates connect/disconnect UI. Use when: add Para wallet, connect wallet, Para SDK, ParaProvider, useModal, wallet connection, embedded wallet, social login wallet. Agent installs packages and creates config files automatically — only asks for Para API key."
---

# SBC Para wallet setup

Set up Para wallet in any app — chain-agnostic provider, connect modal, embedded + external wallet support.

> **Using Radius?** Use `@sbc-radius-integration` instead — it includes Para setup plus chain config and SBC AppKit in one shot.

## What this skill does

1. Installs `@getpara/react-sdk@2.27.0` + viem integration + Turnkey peers
2. Creates `src/lib/para/config.ts` — Para SDK config
3. Creates `src/components/providers/ParaProviders.tsx` — `QueryClient` + `ParaProvider`
4. Creates a dynamic loader for the connect UI (`ssr: false`)
5. Asks for **Para API key** only (from [developer.getpara.com](https://developer.getpara.com/))

## Agent mandate

### Step 0 — Install

```bash
npm install @getpara/react-sdk@2.27.0 @getpara/viem-v2-integration@2.27.0 \
  @tanstack/react-query@^5 viem@^2 \
  @turnkey/viem@^0.14 @turnkey/http@^3
```

If `.env.local` is missing `NEXT_PUBLIC_PARA_API_KEY`, ask the user once:

> Paste your **Para API key** (from developer.getpara.com).

Write `NEXT_PUBLIC_PARA_API_KEY=...` into `.env.local`.

### Steps 1–3 — Implement

1. Copy [templates/para-config.ts](templates/para-config.ts) → `src/lib/para/config.ts`
2. Copy [templates/ParaProviders-next.tsx](templates/ParaProviders-next.tsx) → `src/components/providers/ParaProviders.tsx` — wrap app in `layout.tsx`
3. Copy [templates/RadiusParaConnectLoader.tsx](templates/RadiusParaConnectLoader.tsx) → `src/components/ParaConnectLoader.tsx` — adapt `import` path for your connect component

### Step 4 — Verify

```bash
npx tsc --noEmit
```

Fix any `"use client"` / dynamic import issues.

### Step 5 — Done

Tell the user:

- Run `npm run dev -- -p 3003` — **Para requires localhost:3003** for local development
- Open the app → trigger the connect modal via `useModal()` → `openModal()`

**Never ask for:** wallet address, private key, seed phrase.

## Key facts

| Package | Version |
| ------- | ------- |
| `@getpara/react-sdk` | `2.27.0` |
| `@getpara/viem-v2-integration` | `2.27.0` |

- Always import `"@getpara/react-sdk/styles.css"` in the provider file
- Always run dev server on **port 3003** — Para's SDK only whitelists `localhost:3003`
- `ParaProvider` must be a **client component** (`"use client"`)
- Connect UI that uses `useModal` must be wrapped in `next/dynamic` with `ssr: false` — never inside a Server Component

## Templates

| File | Copy to |
| ---- | ------- |
| [para-config.ts](templates/para-config.ts) | `src/lib/para/config.ts` |
| [ParaProviders-next.tsx](templates/ParaProviders-next.tsx) | `src/components/providers/ParaProviders.tsx` |
| [RadiusParaConnectLoader.tsx](templates/RadiusParaConnectLoader.tsx) | `src/components/ParaConnectLoader.tsx` |
| [ParaWalletDemo.tsx](templates/ParaWalletDemo.tsx) | `src/components/ParaWalletDemo.tsx` |
| [ParaWalletDemoLoader.tsx](templates/ParaWalletDemoLoader.tsx) | `src/components/ParaWalletDemoLoader.tsx` |

After copying the templates, wire `ParaWalletDemoLoader` into a route that matches the app's existing layout and design. Do not hardcode a route name — follow the app's conventions.

## Reference links

- [Para Wallet Docs](https://developer.getpara.com)
- [Para React SDK](https://www.npmjs.com/package/@getpara/react-sdk)
