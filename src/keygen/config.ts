const CLOUD_HOSTS = ["api.keygen.sh", "api.keygen.dev"]
const AUTHENTICATION_SCHEMES = ["token", "session"] as const

const DEMO_BASEPATH = "/demo"
const DEMO_ENV: Partial<ImportMetaEnv> = {
  VITE_KEYGEN_HOST: "api.keygen.sh",
  VITE_KEYGEN_EDITION: "EE",
  VITE_KEYGEN_MODE: "multiplayer",
  VITE_KEYGEN_AUTHENTICATION_SCHEME: "token",
  VITE_KEYGEN_ACCOUNT_ID: "",
  VITE_KEYGEN_DEFAULT_PLAN_ID: "22db8e2c-6eef-46da-9353-bae4f2131c74",
  VITE_LOGODEV_TOKEN: "",
}

let activeAccountId = ""

function isDemoPathname(pathname: string): boolean {
  const normalized = pathname.toLowerCase()

  return (
    normalized === DEMO_BASEPATH || normalized.startsWith(`${DEMO_BASEPATH}/`)
  )
}
const isDemo = isDemoPathname(window.location.pathname)

const env: ImportMetaEnv = isDemo
  ? { ...import.meta.env, ...DEMO_ENV }
  : import.meta.env

const config = {
  host: env.VITE_KEYGEN_HOST,
  mode: env.VITE_KEYGEN_MODE,
  authenticationScheme: env.VITE_KEYGEN_AUTHENTICATION_SCHEME || "token",
  isCE: env.VITE_KEYGEN_EDITION !== "EE",
  isCloud:
    env.VITE_KEYGEN_EDITION === "EE" &&
    env.VITE_KEYGEN_MODE === "multiplayer" &&
    CLOUD_HOSTS.includes(env.VITE_KEYGEN_HOST),
  isDemo,
  basepath: isDemo ? DEMO_BASEPATH : "/",
  version: env.VITE_KEYGEN_VERSION,
  logoDevToken: env.VITE_LOGODEV_TOKEN,

  get id(): string {
    return env.VITE_KEYGEN_ACCOUNT_ID || activeAccountId
  },

  setAccountId(id: string | null): void {
    activeAccountId = id ?? ""
  },

  get hasFixedAccount(): boolean {
    return Boolean(env.VITE_KEYGEN_ACCOUNT_ID)
  },

  get defaultPlanId(): string {
    return env.VITE_KEYGEN_DEFAULT_PLAN_ID || ""
  },

  get supportEmail(): string {
    return env.VITE_KEYGEN_SUPPORT_EMAIL || ""
  },

  get isTokenAuthenticated(): boolean {
    return this.authenticationScheme === "token"
  },

  get isSessionAuthenticated(): boolean {
    return this.authenticationScheme === "session"
  },

  sentry: {
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_SENTRY_ENVIRONMENT || "production",
  },

  fathom: {
    siteId: env.VITE_FATHOM_SITE_ID,
  },

  validate(): void {
    const missing: string[] = []
    const invalid: string[] = []

    if (!this.host) missing.push("VITE_KEYGEN_HOST")
    if (!this.mode) missing.push("VITE_KEYGEN_MODE")
    if (!this.version) missing.push("VITE_KEYGEN_VERSION")
    if (this.mode === "singleplayer" && !this.id) {
      missing.push("VITE_KEYGEN_ACCOUNT_ID")
    }

    if (!AUTHENTICATION_SCHEMES.includes(this.authenticationScheme)) {
      invalid.push("VITE_KEYGEN_AUTHENTICATION_SCHEME")
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      )
    }

    if (invalid.length > 0) {
      throw new Error(`Invalid environment variables: ${invalid.join(", ")}`)
    }
  },
}

export default config
