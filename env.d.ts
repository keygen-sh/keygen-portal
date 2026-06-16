/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KEYGEN_HOST: string
  readonly VITE_KEYGEN_MODE: string
  readonly VITE_KEYGEN_VERSION: string
  readonly VITE_KEYGEN_ACCOUNT_ID: string
  readonly VITE_KEYGEN_EDITION?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_ENVIRONMENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string
