# SBC Skills Plugin

Agent skills for building on **SBC** and **Radius Network** — gasless transactions via AppKit and **Para** wallet connection.

Install: add this repo’s plugin to Cursor / Claude Code per your marketplace setup, or copy skills from `plugins/sbc/skills/`.

There is **no** `npm install` at the monorepo/plugin root. To try the skill on a sample app, use the example in the parent repo: `examples/radius-test-app` (see root [README.md](../../README.md#test-the-radius-skill-locally)).

## Skills

### `sbc-radius-integration`

**Path:** `plugins/sbc/skills/sbc-radius-integration/`

Integrates **Radius testnet/mainnet** with:

- SBC AppKit (`useSbcPara`)
- **Para** connect (`@getpara/react-sdk` + `useModal`)
- Gasless user operations on RUSD

**User provides (after agent implements):**

1. `NEXT_PUBLIC_SBC_API_KEY` — [dashboard.stablecoin.xyz](https://dashboard.stablecoin.xyz/)
2. `NEXT_PUBLIC_PARA_API_KEY` — [developer.getpara.com](https://developer.getpara.com/)

**Example prompt:**

```text
@sbc-radius-integration

Integrate Radius testnet for me
```

**Docs:** https://docs.stablecoin.xyz/radius/overview
