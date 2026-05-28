# SBC Skills Plugin

Skills for building SBC stablecoin applications with Radius Network integration, account abstraction, and gasless transactions.

## Included

- `skills/`: SBC onchain development skills (see below)

## Skills

### sbc-radius-integration

Fully integrates Radius Network into a user's app using SBC AppKit. Handles install, config, providers, environment variables, wallet chain setup, and gasless transactions. Supports Next.js, Vite, and existing AA stacks (Privy/permissionless/wagmi). Executes autonomously — writes code and runs installs; only stops for a missing API key or ambiguous mainnet vs testnet in production.
