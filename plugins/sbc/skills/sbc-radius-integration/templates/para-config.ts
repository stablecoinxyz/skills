/**
 * Para SDK config — copy to src/lib/para/config.ts
 * Pattern: dollar-wallet-web/src/lib/para/config.ts
 */
import { Environment } from "@getpara/react-sdk";

export const PARA_API_KEY =
  process.env.NEXT_PUBLIC_PARA_API_KEY ??
  process.env.VITE_PARA_API_KEY ??
  "";

export const PARA_ENV =
  (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

export const paraClientConfig = {
  apiKey: PARA_API_KEY,
  env: PARA_ENV,
};

export const paraAppConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "SBC App",
  disableAutoSessionKeepAlive: false,
};

export const paraModalConfig = {
  authLayout: ["AUTH:FULL"] as const,
  recoverySecretStepEnabled: false,
  theme: { borderRadius: "md" as const, mode: "light" as const },
};
