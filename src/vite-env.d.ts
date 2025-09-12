/// <reference types="vite/client" />

// Global variables injected by Vite
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_BOT_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
