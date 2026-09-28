import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { SesionApiContext, type SesionApiContextValue } from './SesionApiContext';

/**
 * Guarda la señal de sesión "sin rol asignado" detectada por un 403 de la
 * API en cualquier momento de una sesión ya iniciada, para que `AppRouter`
 * reaccione sin depender de que cada pantalla revise el `status` del error.
 */
export function SesionApiProvider({ children }: { children: ReactNode }) {
  const [sesionSinRol, setSesionSinRol] = useState(false);

  const marcarSesionSinRol = useCallback(() => {
    setSesionSinRol((actual) => (actual ? actual : true));
  }, []);

  const limpiarSesionSinRol = useCallback(() => {
    setSesionSinRol((actual) => (actual ? false : actual));
  }, []);

  const value = useMemo<SesionApiContextValue>(
    () => ({ sesionSinRol, marcarSesionSinRol, limpiarSesionSinRol }),
    [sesionSinRol, marcarSesionSinRol, limpiarSesionSinRol],
  );

  return <SesionApiContext.Provider value={value}>{children}</SesionApiContext.Provider>;
}
