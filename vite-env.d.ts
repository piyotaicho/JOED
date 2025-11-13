/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_MODULE_PREFIX: string
  readonly VITE_APP_MODE: string
  readonly VITE_APP_ID: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ELECTION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
