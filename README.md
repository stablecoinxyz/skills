# SBC Skills

Ship stablecoin apps faster with SBC [Skills](https://agentskills.io): best-practice guidance for Radius Network integration, account abstraction, gasless transactions, and wallet connectivity using SBC AppKit.

[![X](https://img.shields.io/badge/follow-%40stablecoinxyz-black?logo=x&logoColor=white)](https://x.com/stablecoinxyz)
[![Developer Docs](https://img.shields.io/badge/developer%20docs-visit-0066FF)](https://docs.stablecoin.xyz)
[![Dashboard](https://img.shields.io/badge/dashboard-visit-0066FF)](https://dashboard.stablecoin.xyz)
[![Radius Network](https://img.shields.io/badge/radius-visit-0066FF)](https://radiustech.xyz)

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
| [`sbc-radius-integration`](./plugins/sbc/skills/sbc-radius-integration/SKILL.md) | Fully integrates Radius Network into your app using SBC AppKit, Para wallet, and account abstraction. Covers install, chain config, providers, env vars, Para wallet connection, and gasless RUSD transactions. |

## How Skills Work
Skills provide context that help agents do specific things with greater accuracy:
- **Decision frameworks**: which integration path to use (AppKit, direct AA, scaffold)
- **Correct patterns**: EntryPoint addresses, chain configs, signature normalization, gasless send patterns
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
Skills are designed around patterns with infrequent changes, so they remain useful even if slightly behind. For details that change often (contract addresses, SDK signatures), check the [SBC docs](https://docs.stablecoin.xyz) which updates over the air.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## FAQ

**Do skills write code for me?**
No. Skills are instructions and best-practice patterns that steer an agent's outputs. Your agent generates the code; skills guide it.

**Do I need to run npm install in this repo?**
No. This repo contains only skill files (markdown + templates). Run `npm install` inside your own app — the skill agent does this automatically.

## Resources
- [SBC Developer Docs](https://docs.stablecoin.xyz)
- [Radius Overview](https://docs.stablecoin.xyz/radius/overview)
- [SBC Dashboard](https://dashboard.stablecoin.xyz)
- [Para Wallet Docs](https://developer.getpara.com)
- [Radius Testnet Faucet](https://testnet.radiustech.xyz/wallet)
- [Radius Mainnet Explorer](https://network.radiustech.xyz)

## Disclaimer
By using this skill, you acknowledge that any output generated in connection with the Skill may contain errors, omissions, or outdated information, and you are solely responsible for reviewing and validating all outputs before taking any action. This skill is provided "as is," and StableCoin disclaims liability for losses or damages arising from use of or reliance on output generated in connection with this skill.
