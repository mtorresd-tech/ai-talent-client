/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENTRA_CLIENT_ID: string;
  readonly VITE_ENTRA_TENANT_ID: string;
  readonly VITE_ENTRA_REDIRECT_URI: string;
  readonly VITE_ENTRA_SCOPES: string;
  /** URL de SAP SuccessFactors para diligenciar el prefiltro telefónico. Opcional. */
  readonly VITE_URL_SUCCESSFACTORS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
