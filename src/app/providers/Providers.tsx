import type { ReactNode } from 'react';
import { GebThemeProvider } from '@geb/ui';
import { GebAuthProvider, type GebAuthConfig } from '@geb/auth';
import { DevAuthProvider } from '../../shared/auth/DevAuthProvider';

/**
 * `VITE_ENTRA_CLIENT_ID`/`VITE_ENTRA_TENANT_ID` quedan vacíos hasta que
 * exista el app registration de IA Talento en Entra ID (ver .env.example).
 * Mientras tanto usamos `DevAuthProvider` (sesión simulada en memoria) para
 * poder navegar el esqueleto sin que `GebAuthProvider` redirija a Microsoft
 * con un `client_id` vacío. `GebAuthProvider` recibe `GebAuthConfig`
 * directamente — la conversión a `Configuration` de MSAL
 * (`crearConfiguracionMsal`) la hace por dentro.
 */
const entraConfigurado = Boolean(
  import.meta.env.VITE_ENTRA_CLIENT_ID && import.meta.env.VITE_ENTRA_TENANT_ID,
);

const configuracionAuth: GebAuthConfig = {
  clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
  tenantId: import.meta.env.VITE_ENTRA_TENANT_ID,
  redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI,
  scopes: import.meta.env.VITE_ENTRA_SCOPES ? import.meta.env.VITE_ENTRA_SCOPES.split(',') : [],
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GebThemeProvider>
      {entraConfigurado ? (
        <GebAuthProvider config={configuracionAuth}>
          {/* @geb/auth está buildeado contra @types/react 18; el `as any` evita
              el choque de identidad de tipos con la 19 de este repo (ver riesgo
              conocido en la skill geb-lib), no es un error real de tipos. */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {children as any}
        </GebAuthProvider>
      ) : (
        <DevAuthProvider>{children}</DevAuthProvider>
      )}
    </GebThemeProvider>
  );
}
