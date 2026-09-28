import { useMemo, useState, type ReactNode } from 'react';
import {
  GebAuthContext,
  type EstadoSesion,
  type GebAuthContextValue,
  type UsuarioGeb,
} from '@geb/auth';
import { DevAuthContext, type DevAuthContextValue } from './DevAuthContext';

/**
 * Modo desarrollo de autenticación: sesión simulada en memoria, sin
 * redirección a Microsoft, para trabajar sin credenciales reales de Entra ID
 * (ver `VITE_ENTRA_CLIENT_ID`/`VITE_ENTRA_TENANT_ID` en `.env.example`).
 * Expone el mismo `GebAuthContext` de `@geb/auth` para que
 * `useAuth()`/`RequireRole` del resto de la app funcionen sin cambios.
 */
export function DevAuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>('no-autenticado');
  const [usuario, setUsuario] = useState<UsuarioGeb | null>(null);

  const authValue = useMemo<GebAuthContextValue>(
    () => ({
      estado,
      usuario,
      obtenerToken: async () => 'dev-token-simulado',
      login: async () => {
        setUsuario({
          id: 'dev',
          nombre: 'Usuario de prueba',
          correo: 'dev@geb.com.co',
          roles: [],
          tenant: 'dev',
        });
        setEstado('autenticado');
      },
      logout: async () => {
        setUsuario(null);
        setEstado('no-autenticado');
      },
    }),
    [estado, usuario],
  );

  const devValue = useMemo<DevAuthContextValue>(
    () => ({
      iniciarSesion: (correo, roles) => {
        setUsuario({
          id: 'dev',
          nombre: correo.split('@')[0] || 'Usuario de prueba',
          correo,
          roles,
          tenant: 'dev',
        });
        setEstado('autenticado');
      },
    }),
    [],
  );

  return (
    <DevAuthContext.Provider value={devValue}>
      {/* @geb/auth está buildeado contra @types/react 18; el `as any` evita el
          choque de identidad de tipos con la 19 de este repo — son dos
          `ReactNode` estructuralmente distintos para TS, no un error real de
          tipos. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <GebAuthContext.Provider value={authValue}>{children as any}</GebAuthContext.Provider>
    </DevAuthContext.Provider>
  );
}
