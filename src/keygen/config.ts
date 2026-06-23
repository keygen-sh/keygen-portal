const CLOUD_HOSTS = ["api.keygen.sh", "api.keygen.dev"]

let activeAccountId = ""

const config = {
  host: import.meta.env.VITE_KEYGEN_HOST,
  mode: import.meta.env.VITE_KEYGEN_MODE,
  isCE: import.meta.env.VITE_KEYGEN_EDITION !== "EE",
  isCloud:
    import.meta.env.VITE_KEYGEN_EDITION === "EE" &&
    import.meta.env.VITE_KEYGEN_MODE === "multiplayer" &&
    CLOUD_HOSTS.includes(import.meta.env.VITE_KEYGEN_HOST),
  version: import.meta.env.VITE_KEYGEN_VERSION,

  get id(): string {
    return import.meta.env.VITE_KEYGEN_ACCOUNT_ID || activeAccountId
  },

  setAccountId(id: string | null): void {
    activeAccountId = id ?? ""
  },

  get hasFixedAccount(): boolean {
    return Boolean(import.meta.env.VITE_KEYGEN_ACCOUNT_ID)
  },

  get defaultPlanId(): string {
    return import.meta.env.VITE_KEYGEN_DEFAULT_PLAN_ID || ""
  },

  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "production",
  },

  validate(): void {
    const missing: string[] = []

    if (!this.host) missing.push("VITE_KEYGEN_HOST")
    if (!this.mode) missing.push("VITE_KEYGEN_MODE")
    if (!this.version) missing.push("VITE_KEYGEN_VERSION")
    if (this.mode === "singleplayer" && !this.id) {
      missing.push("VITE_KEYGEN_ACCOUNT_ID")
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      )
    }
  },
}

export default config
