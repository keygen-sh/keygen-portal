const config = {
  host: import.meta.env.VITE_KEYGEN_HOST,
  mode: import.meta.env.VITE_KEYGEN_MODE,
  version: import.meta.env.VITE_KEYGEN_VERSION,
  id: import.meta.env.VITE_KEYGEN_ACCOUNT_ID,
  demoId: import.meta.env.VITE_KEYGEN_ACCOUNT_DEMO_ID || "keygen",

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
