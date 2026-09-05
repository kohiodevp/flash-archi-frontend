/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL absolue de l'API (optionnel ; par défaut /api/** en relatif). */
  readonly VITE_API_BASE?: string
  /** Activer la console (démo) côté client. */
  readonly VITE_ENABLE_DEMO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}