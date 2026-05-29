# Radius reference (SBC)

Agent: use with [SKILL.md](SKILL.md) for workflow; this file is constants and caveats.

Source: [Radius overview](https://docs.stablecoin.xyz/radius/overview), [configuration](https://docs.stablecoin.xyz/radius/configuration).

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
| Mainnet | 723487 | `0xB0EEF` |

## Why Radius vs Base

| Feature | Radius | Base |
|--------|--------|------|
| Gas | Low, predictable (~$0.000093/transfer) | Standard |
| Native currency | RUSD (18 decimals) | ETH |
| EntryPoint | Custom deployment | Canonical v0.7 |
| Smart account | SimpleAccount | Kernel |

## Chain configuration (viem)

### Mainnet (chain id 723487)

```typescript
const radiusMainnet = {
  id: 723487,
  name: 'Radius Network',
  nativeCurrency: { name: 'RUSD', symbol: 'RUSD', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.radiustech.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Radius Explorer', url: 'https://network.radiustech.xyz' },
  },
} as const
```

### Testnet (chain id 72344)

```typescript
const radiusTestnet = {
  id: 72344,
  name: 'Radius Testnet',
  nativeCurrency: { name: 'RUSD', symbol: 'RUSD', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.radiustech.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Radius Explorer', url: 'https://testnet.radiustech.xyz' },
  },
  testnet: true,
} as const
```

### MetaMask (testnet)

```
Network Name: Radius Testnet
RPC URL: https://rpc.testnet.radiustech.xyz
Chain ID: 72344
Currency Symbol: RUSD
```

Faucet: https://testnet.radiustech.xyz/wallet

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

## External links

- Radius docs: https://docs.radiustech.xyz
- Mainnet explorer: https://network.radiustech.xyz
- Testnet explorer: https://testnet.radiustech.xyz
- SBC blog (launch): https://stablecoin.xyz/blog/sbc-launches-on-the-radius-network
