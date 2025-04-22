/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KEYGEN_HOST: string
  readonly VITE_KEYGEN_MODE: string
  readonly VITE_KEYGEN_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
