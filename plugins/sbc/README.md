# SBC Skills Plugin

Skills for building on **Radius Network** with SBC AppKit — gasless transactions, Para wallet connection, and account abstraction.

## Install in an app

```bash
cd your-app
npx skills add stablecoin/skills   # Cursor + Project
```

Prefer this over symlinking into `.cursor/skills/` so bundled `sbc-llms-full.txt` is copied into the project.

## Included

- `skills/`: SBC onchain development skills (see below)
- Bundled docs per skill: `sbc-llms.txt`, `sbc-llms-full.txt` (from https://docs.stablecoin.xyz/)
- `.mcp.json`: MCP server config (optional extension)

## Skills

| Skill | Use when | Keys needed |
| ----- | -------- | ----------- |
| [`sbc-radius-integration`](skills/sbc-radius-integration/SKILL.md) | Full Radius + Para + AppKit in one shot | SBC + Para |
| [`sbc-para-wallet`](skills/sbc-para-wallet/SKILL.md) | Para wallet only (any chain) | Para |
| [`sbc-appkit`](skills/sbc-appkit/SKILL.md) | SBC AppKit / gasless sends (any chain) | SBC |

### sbc-radius-integration
Full end-to-end Radius integration: chain config, ParaProvider, Para wallet (embedded + external), signature normalization, gasless SBC ERC-20 transfers via AppKit.

```text
@sbc-radius-integration
Integrate Radius testnet for me
```

### sbc-para-wallet
Para wallet setup only — providers, connect modal, embedded + external wallets. Use on any chain.

```text
@sbc-para-wallet
Add Para wallet to my app
```

### sbc-appkit
SBC AppKit wiring — `useSbcPara`, `sendUserOperation`, SBC balance. Use on any chain. Requires Para already set up.

```text
@sbc-appkit
Add gasless SBC transfers to my app
```

**Docs:** https://docs.stablecoin.xyz
