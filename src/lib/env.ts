type Key =
  | "VITE_KEYGEN_HOST"
  | "VITE_KEYGEN_MODE"
  | "VITE_KEYGEN_EDITION"
  | "VITE_KEYGEN_VERSION"
  | "VITE_KEYGEN_ACCOUNT_ID"
  | "VITE_SENTRY_DSN"
  | "VITE_SENTRY_ENVIRONMENT"

const runtime: Partial<Record<Key, string>> =
  (window as unknown as { __KEYGEN_CONFIG__?: Partial<Record<Key, string>> })
    .__KEYGEN_CONFIG__ ?? {}

export const env = (key: Key): string | undefined =>
  runtime[key] || import.meta.env[key]

export const requireEnv = (key: Key): string => env(key) ?? ""