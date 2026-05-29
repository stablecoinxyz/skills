# SBC Skills

Ship stablecoin apps faster with SBC [Skills](https://agentskills.io): best-practice guidance for Radius Network integration, account abstraction, gasless transactions, and wallet connectivity using SBC AppKit.

## Quick start

This repo is **not** a Node.js app at the root — there is no root `package.json`. Do **not** run `npm install` in the repository root; it will fail with `ENOENT` for `package.json`.

| Goal | What to do |
|------|------------|
| **Use the skill in your own app** | Install the skill (below), then ask your agent to integrate Radius — the agent installs deps in *your* project. |
| **Try the skill on the included example** | `cd examples/radius-test-app` and run the commands in [Test the Radius skill locally](#test-the-radius-skill-locally). |

## Installation

Install the skill in your editor or agent environment (no `npm install` in this repo required):

### Cursor (clone this repo)

Skills are available under `.cursor/skills/` when you open this workspace. For the example app, open **`examples/radius-test-app`** as the folder (or the whole repo) and use `@sbc-radius-integration` in Agent chat.

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

## Test the Radius skill locally

Open **`examples/radius-test-app`** in Cursor, then:

```text
@sbc-radius-integration
integrate radius
```

Paste **SBC** and **Para** API keys when asked. The agent runs `npm install`, `.env.local`, and all code — you do not.

See [examples/radius-test-app/README.md](./examples/radius-test-app/README.md).

## Resources

- [SBC Docs](https://docs.stablecoin.xyz)
- [Radius Overview](https://docs.stablecoin.xyz/radius/overview)
- [SBC Dashboard](https://dashboard.stablecoin.xyz)
- [Radius Testnet Faucet](https://testnet.radiustech.xyz/wallet)
- [Radius Mainnet Explorer](https://network.radiustech.xyz)