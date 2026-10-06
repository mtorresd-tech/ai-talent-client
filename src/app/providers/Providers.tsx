import type { ReactNode } from 'react';
import { GebThemeProvider } from '@geb/ui';
import { GebAuthProvider, type GebAuthConfig } from '@geb/auth';
import { DevAuthProvider } from '../../shared/auth/DevAuthProvider';
import { SesionApiProvider } from '../../shared/auth/SesionApiProvider';
import { PortalActivoProvider } from '../../shared/auth/PortalActivoContext';
import { CATALOGO_ROLES_IA_TALENTO } from '../../shared/auth/catalogoRoles';
import { PantallaCargaSesion } from '../../features/auth';

/**
 * Dos modos de autenticación reales, según `VITE_ENTRA_CLIENT_ID`/
 * `VITE_ENTRA_TENANT_ID` (ver `.env.example`): `GebAuthProvider` contra
 * Microsoft Entra ID cuando el app registration de IA Talento está
 * configurado, o `DevAuthProvider` (sesión simulada en memoria) como modo
 * desarrollo sin esas credenciales. `GebAuthProvider` recibe `GebAuthConfig`
 * directamente — la conversión a `Configuration` de MSAL
 * (`crearConfiguracionMsal`) la hace por dentro. `loginAutomatico={false}`
 * evita el redirect automático a Microsoft al montar la app: el login se
 * dispara solo al presionar el botón en `PaginaInicioSesion`.
 * `catalogoRoles` filtra los roles del token al catálogo de IA Talento
 * (`RECLUTADOR`/`LIDER_VACANTE`) antes de exponerse en `useAuth().usuario.roles`.
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
      <SesionApiProvider>
        {entraConfigurado ? (
          <GebAuthProvider
            config={configuracionAuth}
            loginAutomatico={false}
            cargando={<PantallaCargaSesion />}
            catalogoRoles={CATALOGO_ROLES_IA_TALENTO}
          >
            {/* @geb/auth está buildeado contra @types/react 18; el `as any` evita
                el choque de identidad de tipos con la 19 de este repo — son dos
                `ReactNode` estructuralmente distintos para TS, no un error real
                de tipos. */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(<PortalActivoProvider>{children}</PortalActivoProvider>) as any}
          </GebAuthProvider>
        ) : (
          <DevAuthProvider>
            <PortalActivoProvider>{children}</PortalActivoProvider>
          </DevAuthProvider>
        )}
      </SesionApiProvider>
    </GebThemeProvider>
  );
}
