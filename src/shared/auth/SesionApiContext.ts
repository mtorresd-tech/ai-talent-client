import { createContext, useContext } from 'react';

export interface SesionApiContextValue {
  /** `true` desde que cualquier petición a la API respondió 403 (sin rol asignado). */
  sesionSinRol: boolean;
  marcarSesionSinRol: () => void;
  limpiarSesionSinRol: () => void;
}

export const SesionApiContext = createContext<SesionApiContextValue | null>(null);

/** Debe usarse dentro de `SesionApiProvider` (montado una sola vez en `Providers.tsx`). */
export function useSesionApi(): SesionApiContextValue {
  const contexto = useContext(SesionApiContext);
  if (!contexto) {
    throw new Error('useSesionApi debe usarse dentro de SesionApiProvider');
  }
  return contexto;
}
