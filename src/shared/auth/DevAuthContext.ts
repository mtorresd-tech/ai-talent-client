import { createContext, useContext } from 'react';
import type { RolGeb } from '@geb/auth';

export interface DevAuthContextValue {
  iniciarSesion: (correo: string, roles: readonly RolGeb[]) => void;
}

export const DevAuthContext = createContext<DevAuthContextValue | null>(null);

/** Solo devuelve un valor cuando la app corre bajo `DevAuthProvider` (sin Entra ID configurado). */
export function useDevAuth() {
  return useContext(DevAuthContext);
}
