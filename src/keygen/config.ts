import { env, requireEnv } from "@/lib/env"

const CLOUD_HOSTS = ["api.keygen.sh", "api.keygen.dev"]

const config = {
  host: requireEnv("VITE_KEYGEN_HOST"),
  mode: requireEnv("VITE_KEYGEN_MODE"),
  isCE: env("VITE_KEYGEN_EDITION") !== "EE",
  isCloud:
    env("VITE_KEYGEN_EDITION") === "EE" &&
    env("VITE_KEYGEN_MODE") === "multiplayer" &&
    CLOUD_HOSTS.includes(requireEnv("VITE_KEYGEN_HOST")),
  version: requireEnv("VITE_KEYGEN_VERSION"),
  id: requireEnv("VITE_KEYGEN_ACCOUNT_ID"),

  sentry: {
    dsn: env("VITE_SENTRY_DSN"),
    environment: env("VITE_SENTRY_ENVIRONMENT") || "production",
  },

  validate(): void {
    const missing: string[] = []
    if (!this.host) missing.push("VITE_KEYGEN_HOST")
    if (!this.mode) missing.push("VITE_KEYGEN_MODE")
    if (!this.version) missing.push("VITE_KEYGEN_VERSION")
    if (!this.id) missing.push("VITE_KEYGEN_ACCOUNT_ID")
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      )
    }
  },
}

export default config