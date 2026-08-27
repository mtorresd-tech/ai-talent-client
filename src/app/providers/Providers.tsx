import type { ReactNode } from 'react';
import { GebThemeProvider } from '@geb/ui';
import { GebAuthProvider, type GebAuthConfig } from '@geb/auth';

/**
 * TODO: `VITE_ENTRA_CLIENT_ID`/`VITE_ENTRA_TENANT_ID` quedan vacíos hasta que
 * exista el app registration de IA Talento en Entra ID (ver .env.example).
 * `GebAuthProvider` recibe este `GebAuthConfig` directamente — la conversión
 * a `Configuration` de MSAL (`crearConfiguracionMsal`) la hace por dentro.
 */
const configuracionAuth: GebAuthConfig = {
  clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
  tenantId: import.meta.env.VITE_ENTRA_TENANT_ID,
  redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI,
  scopes: import.meta.env.VITE_ENTRA_SCOPES.split(','),
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GebThemeProvider>
      {/* `@geb/auth` está buildeado contra @types/react 18; el `as any` evita
          el choque de identidad de tipos con la 19 de este repo (ver riesgo
          conocido en la skill geb-lib), no es un error real de tipos. */}
      <GebAuthProvider config={configuracionAuth}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {children as any}
      </GebAuthProvider>
    </GebThemeProvider>
  );
}
