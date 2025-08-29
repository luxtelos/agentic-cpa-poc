/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_PDF_API_URL: string;
  
  // Perplexity Configuration
  readonly VITE_PERPLEXITY_API_KEY: string;
  readonly VITE_PROXY_BASE: string;
  readonly VITE_PROXY_URL_FORMAT: string;
  readonly VITE_PERPLEXITY_MODEL: string;
  readonly VITE_PERPLEXITY_MAX_FILES: string;
  readonly VITE_PERPLEXITY_MAX_FILE_SIZE_MB: string;
  
  // Claude Configuration
  readonly VITE_CLAUDE_API_KEY: string;
  readonly VITE_CLAUDE_BASE_URL: string;
  readonly VITE_CLAUDE_MODEL: string;
  readonly VITE_CLAUDE_API_VERSION: string;
  readonly VITE_CLAUDE_MAX_TOKENS: string;
  readonly VITE_CLAUDE_TEMPERATURE: string;
  readonly VITE_CLAUDE_MAX_FILES: string;
  readonly VITE_CLAUDE_MAX_FILE_SIZE_MB: string;
  
  // Feature Flags
  readonly VITE_ENABLE_CLAUDE: string;
  readonly VITE_ENABLE_PERPLEXITY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
