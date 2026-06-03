# SBC Skills Plugin

Skills for building on **Radius Network** with SBC AppKit — gasless transactions, Para wallet connection, and account abstraction.

## Included

- `skills/`: SBC onchain development skills (see below)
- `.mcp.json`: MCP server config (optional; skills bundle `sbc-llms.txt` / `sbc-llms-full.txt` from https://docs.stablecoin.xyz/)

## Skills

### sbc-radius-integration
Fully integrate Radius testnet or mainnet into any Next.js or Vite app. Covers package install, chain config, ParaProvider setup, Para wallet connection (embedded + external wallets), signature normalization, and gasless RUSD user operations via SBC AppKit.

**User provides (after agent implements):**
1. `NEXT_PUBLIC_SBC_API_KEY` — [dashboard.stablecoin.xyz](https://dashboard.stablecoin.xyz/)
2. `NEXT_PUBLIC_PARA_API_KEY` — [developer.getpara.com](https://developer.getpara.com/)

**Example prompt:**
```text
@sbc-radius-integration

Integrate Radius testnet for me
```

**Docs:** https://docs.stablecoin.xyz/radius/overview
