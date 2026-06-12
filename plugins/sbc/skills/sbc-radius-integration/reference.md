# Radius reference (SBC)

Agent: use with [SKILL.md](SKILL.md) for workflow; this file is constants and caveats.

## SBC documentation (bundled with this skill)

| File | In skill folder | After install in user’s app |
| ---- | --------------- | ----------------------------- |
| [sbc-llms.txt](sbc-llms.txt) | `sbc-llms.txt` | `.cursor/skills/sbc-radius-integration/sbc-llms.txt` |
| [sbc-llms-full.txt](sbc-llms-full.txt) | `sbc-llms-full.txt` | `.cursor/skills/sbc-radius-integration/sbc-llms-full.txt` |
| [reference.md](reference.md) | `reference.md` | `.cursor/skills/sbc-radius-integration/reference.md` |

Live mirrors (if local files missing): https://docs.stablecoin.xyz/llms.txt and https://docs.stablecoin.xyz/llms-full.txt

Source repo (human editors): https://github.com/stablecoinxyz/sbc-docs

Radius pages: [overview](https://docs.stablecoin.xyz/radius/overview), [configuration](https://docs.stablecoin.xyz/radius/configuration).

## SBC token (ERC-20)

| Network | Token address | Decimals |
| ------- | ------------- | -------- |
| Radius testnet | `0x33ad9e4BD16B69B5BFdED37D8B5D9fF9aba014Fb` | 6 |
| Radius mainnet | `0x33ad9e4BD16B69B5BFdED37D8B5D9fF9aba014Fb` | 6 |

Use `erc20Abi` + `encodeFunctionData` to build the `transfer` calldata; pass `value: "0"` to `sendUserOperation`. Balance via `publicClient.readContract` → `balanceOf`. Format with `formatUnits(raw, 6)`.

## Para wallet (default)

| Key | Env var | Where |
| --- | ------- | ----- |
| SBC paymaster | `NEXT_PUBLIC_SBC_API_KEY` | https://dashboard.stablecoin.xyz/ |
| Para | `NEXT_PUBLIC_PARA_API_KEY` | https://developer.getpara.com/ |

**Stack:** `ParaProvider` → `useParaViemRadius` → `useSbcPara` → `sbcAppKit.sendUserOperation`.

**Reference repos:** `dollar-wallet-web` (AppKit + Para), `agent-payments` (`@getpara/react-sdk@2.27.0`).

**Greenfield:** `npx create-sbc-app <name> --template react-para --chain radiusTestnet`

Do not ask the user for a wallet address — they connect via Para modal in the browser.

## Viem chain slugs (AA API)

| Network | `api.aa.stablecoin.xyz` slug | Chain ID |
|---------|------------------------------|----------|
| Testnet | `radiusTestnet` | 72344 |
| Mainnet | `radius` | 723487 |

```text
https://api.aa.stablecoin.xyz/rpc/v1/radiusTestnet/{API_KEY}
https://api.aa.stablecoin.xyz/rpc/v1/radius/{API_KEY}
```

Bundler URL === Paymaster URL (same endpoint).

## MetaMask chainId hex

| Network | Decimal | Hex |
|---------|---------|-----|
| Testnet | 72344 | `0x11A98` |
| Mainnet | 723487 | `0xB0A1F` |

## Why Radius vs Base

| Feature | Radius | Base |
|--------|--------|------|
| Gas | Low, predictable (~$0.000093/transfer) | Standard |
| Native currency | RUSD (18 decimals) | ETH |
| EntryPoint | Custom deployment | Canonical v0.7 |
| Smart account | SimpleAccount | Kernel |

## Chain configuration (viem)

**Use SDK exports** in `src/config/radius.ts` (see [templates/radius-chain.ts](templates/radius-chain.ts)). AppKit looks up chains by `chain.id` in `CHAIN_CONFIGS` — custom `defineChain` objects drift from the SDK and cause `Unsupported chain` on mainnet.

```typescript
import { radius as radiusMainnet, radiusTestnet } from '@stablecoin.xyz/core'

export { radiusMainnet, radiusTestnet }
```

| Network | SDK export | Chain ID | SDK `name` (must match) |
| ------- | ---------- | -------- | ----------------------- |
| Mainnet | `radius` | 723487 (after patch) | `Radius` |
| Testnet | `radiusTestnet` | 72344 | `Radius Testnet` |

Do **not** use a custom mainnet chain named `Radius Network` — that name is not in `CHAIN_CONFIGS`.

### MetaMask (mainnet)

```
Network Name: Radius Network
RPC URL: https://rpc.radiustech.xyz
Chain ID: 723487
Currency Symbol: RUSD
```

### MetaMask (testnet)

```
Network Name: Radius Testnet
RPC URL: https://rpc.testnet.radiustech.xyz
Chain ID: 72344
Currency Symbol: RUSD
```

Faucet: https://testnet.radiustech.xyz/wallet

## Block explorer (Radius Dashboard)

| Network | Explorer |
| ------- | -------- |
| Testnet | https://testnet.radiustech.xyz |
| Mainnet | https://network.radiustech.xyz |

URL patterns: `/tx/{transactionHash}`, `/address/{address}`.

**Gasless UserOp txs:** the outer transaction shows **bundler → EntryPoint** (`0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F`), not the user's EOA/smart account. The SBC ERC-20 transfer is inside the UserOp — view it on the tx page under **token transfers** or on the **smart account** address page. `RadiusParaConnect` links both after send.

## Known SDK bug: mainnet chain ID (`@stablecoin.xyz/core` ≤ 1.6.2)

The SDK's `radius` export ships `id: 723`, but Radius mainnet's real chain ID is **723487** (`0xB0A1F` — SBC's own mainnet bundler returns it for `eth_chainId`). On mainnet only, both wiring options fail:

- Pass the SDK `radius` chain → every UserOp fails **`AA24 signature error`**: the client signs the userOpHash with chainId 723 while the EntryPoint hashes with `block.chainid` 723487.
- Pass a custom `defineChain` (id 723487, name `Radius Network`) → AppKit init throws **`Unsupported chain: Radius Network`** (`CHAIN_CONFIGS` is keyed by unpatched id **723**, name **`Radius`**).

Testnet works either way (72344 is correct in the SDK), which makes the AA24 look like a Para signing bug. It is not — do **not** change signature normalization for this; signatures recover correctly to the owner over the chainId-723 hash.

**Note on the error output:** the paymaster shown in a mainnet AA24 error (e.g. `0xeAe0528e…`, listed under testnet contracts below) is **not** evidence that the request was routed to the testnet bundler. Endpoint routing is `CHAIN_CONFIGS.get(chain.id).idString` — both the unpatched id 723 and the patched 723487 map to the `radius` (mainnet) endpoint, and there is no code path that hits the testnet endpoint when `NEXT_PUBLIC_SBC_CHAIN=radius`. Fix the chain ID; do not chase routing.

**Fix (until SBC ships a corrected release) — patch the SDK dist with patch-package:**

1. Copy the bundled [templates/@stablecoin.xyz+core+1.6.2.patch](templates/@stablecoin.xyz+core+1.6.2.patch) into `patches/` at the project root (exact filename matters to patch-package).
2. `npm i -D patch-package && npx patch-package` (applies it), and add `"postinstall": "patch-package"` to package.json `scripts`.
3. After patching, use the template [radius-chain.ts](templates/radius-chain.ts) which imports `radius` and `radiusTestnet` from `@stablecoin.xyz/core` — **do not** keep a parallel custom `defineChain`.

For a core version other than 1.6.2, regenerate: in `node_modules/@stablecoin.xyz/core/dist/index.js` **and** `index.esm.js`, replace `id: 723,` → `id: 723487,` (2× each: `defineChain` + `CHAIN_CONFIGS` entry) and `this.config.chain.id === 723;` → `... === 723487;` (3× each: `isRadius` checks), then `npx patch-package @stablecoin.xyz/core`.

Remove the patch once an SBC release ships `radius.id === 723487`.

**Fail-fast guard:** [templates/radius-chain.ts](templates/radius-chain.ts) throws at init when mainnet is selected but `radius.id` is still 723 (patch missing — e.g. fresh install without `postinstall`), with instructions, instead of failing later with AA24 at send time. It also exports `radiusUrlMatchesSelectedChain()`, used by `getRadiusRpcUrl()` and the proxy to ignore (with a console warning) a `NEXT_PUBLIC_RADIUS_RPC_URL` / `RADIUS_RPC_UPSTREAM` override that points at the other Radius network after a chain flip — so switching `NEXT_PUBLIC_SBC_CHAIN` alone always yields a consistent chain + RPC + bundler.

## EntryPoint (critical)

```typescript
// Base (canonical) — DO NOT use on Radius
const baseEntryPoint = '0x0000000071727De22E5E9d8BAf0edAc6f37da032'

// Radius (custom — same on mainnet and testnet)
const radiusEntryPoint = '0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F'
```

## Deployed contracts

### Mainnet

| Contract | Address |
|----------|---------|
| EntryPoint | `0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F` |
| SimpleAccountFactory | `0x7d8fB3E53d345601a02C3214e314f28668510b03` |
| SignatureVerifyingPaymaster | `0xD969454b59F4BC2CF19dC37A37aC10eF6495CD8D` |
| SBC | `0x33ad9e4bd16b69b5bfded37d8b5d9ff9aba014fb` |
| PimlicoEntryPointSimulations | `0x9c69EC9BcB58b9214e14A1966fc03FE004d50c52` |

### Testnet

| Contract | Address |
|----------|---------|
| EntryPoint | `0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F` |
| Paymaster (Proxy) | `0xeAe0528eCfa059D96421268dc8FaeC7DcAf5b9F0` |
| Paymaster (Impl) | `0xd2f8F112A3855Df8A7eDa1Ebe4887a521802458F` |
| SBC | `0x33ad9e4bd16b69b5bfded37d8b5d9ff9aba014fb` |
| PimlicoEntryPointSimulations | `0xcE77355CD450f1272841cF4aD10a93E65466041C` |

## SBC AA endpoint

Same pattern as other chains; viem chain names: `radius`, `radiusTestnet`.

```text
POST https://api.aa.stablecoin.xyz/rpc/v1/{chain}/{apiKey}
```

Bundler and paymaster URL are typically the **same** endpoint.

## Legacy transactions (no EIP-1559)

All txs must be type 0 with `gasPrice`. In UserOperations:

```text
maxPriorityFeePerGas MUST equal maxFeePerGas
```

Error if mismatched: `maxPriorityFeePerGas must equal maxFeePerGas on chains that don't support EIP-1559`

AppKit v1.6.1+ sets this automatically.

## Balance: RUSD vs eth_getBalance

`eth_getBalance` can include inflated Turnstile/SBC conversion potential. For spendable RUSD:

```bash
cast rpc rad_getBalanceRaw <address> --rpc-url https://rpc.radiustech.xyz
```

## Receipt polling / getLogs

- Block production ~1600 blocks/sec
- `eth_getLogs` block range limit ~500k blocks
- Unbounded log polling fails quickly
- AppKit uses `pimlico_getUserOperationStatus` on Radius instead

## CREATE2

Deterministic deployer `0x4e59b44847b379578588920cA78FbF26c0B4956C` fails for large bytecode. Use direct deployment (`cast send --create`); configure addresses explicitly.

## Self-hosted bundler (Alto)

```json
{
  "legacy-transactions": true,
  "entrypoint-simulation-contract-v7": "<PimlicoEntryPointSimulations address for network>"
}
```

## Example: gasless send (React)

```typescript
import { useUserOperation } from '@stablecoin.xyz/react'

const { sendUserOperation } = useUserOperation()

await sendUserOperation({
  to: '0x742d35Cc6641C4532B4d4c7B4C0D1C3d4e5f6789',
  value: '1000000000000000000', // 1 RUSD (18 decimals)
  data: '0x',
})
```

## Batch calls

```typescript
await sendUserOperation({
  calls: [
    { to: '0xToken...', data: '0xa9059cbb...', value: 0n },
    { to: '0xNft...', data: '0x...', value: 0n },
    { to: '0xRecipient...', data: '0x', value: 1000000000000000000n },
  ],
})
```

## Troubleshooting (Para + useSbcPara)

| Symptom | Likely cause | Fix |
| -------- | ------------- | --- |
| `/api/radius-rpc` 403, setup banner | Cloudflare blocks server egress | `NEXT_PUBLIC_RADIUS_RPC_URL=https://rpc.testnet.radiustech.xyz/YOUR_KEY` in `.env.local`, restart `npm run dev -- -p 3003` |
| `address is required` on connect | `toOwner()` called `eth_accounts` via Para `request` | `toSbcWalletClient` — spread Para client but omit `request` |
| AA24 / signature validation failed (both networks) | UserOp signed via EIP-191 `signMessageAsync` | `signViaParaViem` — `paraWalletClient.signMessage` + RSV normalization |
| AA24 on **mainnet only** (testnet works, signature recovers to owner) | SDK `radius.id` 723 ≠ real chain ID 723487 | Patch `@stablecoin.xyz/core` — see "Known SDK bug" above. Do not touch signing code |
| `Unsupported chain: Radius Network` at AppKit init | Custom `defineChain` (id 723487 / name `Radius Network`) not in `CHAIN_CONFIGS` (keyed by 723, name `Radius`) | Apply patch + switch to SDK exports in [radius-chain.ts](templates/radius-chain.ts); remove custom `defineChain` |
| `@stablecoin.xyz/core is unpatched` thrown at init | Mainnet selected but the patch is not applied (fresh install, missing `postinstall`) | Re-copy the patch to `patches/` and run `npx patch-package`; keep `"postinstall": "patch-package"` |
| Wrong balances / nonces / receipts after flipping `NEXT_PUBLIC_SBC_CHAIN` | `NEXT_PUBLIC_RADIUS_RPC_URL` or `RADIUS_RPC_UPSTREAM` still points at the other network's RPC | Update or remove the override; `radiusUrlMatchesSelectedChain()` already ignores mismatched radiustech.xyz URLs (see console warning) |
| Hydration warning on `<html>` | Browser extension attributes | `suppressHydrationWarning` on `<html>` / `<body>` in root layout (not Radius-specific) |
| Para modal blocked | Wrong dev port | `npm run dev -- -p 3003` only |

**AgentPayments** uses server-side Para pregen EOAs and MPP — not `useSbcPara` / gasless UserOps. Do not copy that stack for browser smart-account flows.

## External links

- Radius docs: https://docs.radiustech.xyz
- Mainnet explorer: https://network.radiustech.xyz
- Testnet explorer: https://testnet.radiustech.xyz
- SBC blog (launch): https://stablecoin.xyz/blog/sbc-launches-on-the-radius-network
