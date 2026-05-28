# SBC Skills

Ship stablecoin apps faster with SBC [Skills](https://agentskills.io): best-practice guidance for Radius Network integration, account abstraction, gasless transactions, and wallet connectivity using SBC AppKit.

## Installation

### Claude Code
```
/plugin marketplace add stablecoin/skills
/plugin install sbc-skills@sbc
```

### Vercel Skills CLI
```bash
npx skills add stablecoin/skills
```

## Skills

| Skill | Description |
|-------|-------------|
| [`sbc-radius-integration`](./plugins/sbc/skills/sbc-radius-integration/SKILL.md) | Fully integrates Radius Network into your app using SBC AppKit. Covers install, config, providers, env, wallet chain, and gasless transactions. |

## How Skills Work

Skills provide context that help agents do specific things with greater accuracy:
- **Decision frameworks**: which integration path to use (AppKit, direct AA, scaffold)
- **Correct patterns**: EntryPoint addresses, chain configs, gasless send patterns
- **Common mistakes**: what breaks and why, so the agent avoids them upfront

Your agent reads the relevant `SKILL.md` while planning and generating code. You stay in control of what gets built.

## Updating

Skills are local files. To get the latest versions:
```bash
# Vercel CLI
npx skills update

# Claude Code
/plugin marketplace update
```

## Resources

- [SBC Docs](https://docs.stablecoin.xyz)
- [Radius Overview](https://docs.stablecoin.xyz/radius/overview)
- [SBC Dashboard](https://dashboard.stablecoin.xyz)
- [Radius Testnet Faucet](https://testnet.radiustech.xyz/wallet)
- [Radius Mainnet Explorer](https://network.radiustech.xyz)