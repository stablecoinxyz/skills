# Radius test app

Minimal Next.js app for testing the **`sbc-radius-integration`** skill.

## What you do (only this)

1. Open **`examples/radius-test-app`** in Cursor.
2. New Agent chat:

   ```text
   @sbc-radius-integration
   integrate radius
   ```

3. Paste **SBC API key** when asked, then **Para API key**.

The agent runs `npm install`, creates `.env.local`, and implements all code. You do not run terminal setup yourself.

4. Open http://localhost:3000 → **Connect with Para** (`npm run dev` only if the agent did not start the server).

## Manual setup (optional)

Only if you are not using the agent:

```bash
npm install
cp env.example .env.local
# fill keys
npm run dev
```

## Skill source

`../../plugins/sbc/skills/sbc-radius-integration/`
