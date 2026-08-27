import { useMemo, useState, type ReactNode } from 'react';
import {
  GebAuthContext,
  type EstadoSesion,
  type GebAuthContextValue,
  type UsuarioGeb,
} from '@geb/auth';
import { DevAuthContext, type DevAuthContextValue } from './DevAuthContext';

/**
 * Reemplazo local de `GebAuthProvider` para desarrollar sin app registration
 * de Entra ID todavía: sesión simulada en memoria, sin redirección a
 * Microsoft. Expone el mismo `GebAuthContext` de `@geb/auth` para que
 * `useAuth()`/`RequireRole` del resto de la app funcionen sin cambios.
 *
 * TODO: borrar este provider y usar `<GebAuthProvider>` real en cuanto exista
 * el app registration (ver `VITE_ENTRA_CLIENT_ID` en `.env.example`).
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
          choque de identidad de tipos con la 19 de este repo (ver riesgo
          conocido en la skill geb-lib), no es un error real de tipos. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <GebAuthContext.Provider value={authValue}>{children as any}</GebAuthContext.Provider>
    </DevAuthContext.Provider>
  );
}
