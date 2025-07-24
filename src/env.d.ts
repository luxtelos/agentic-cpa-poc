/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_PDF_API_URL: string;
  readonly VITE_PERPLEXITY_API_KEY: string;
  readonly VITE_PROXY_BASE: string;
  readonly VITE_PROXY_URL_FORMAT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
