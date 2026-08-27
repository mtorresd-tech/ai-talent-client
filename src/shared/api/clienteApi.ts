import { useMemo } from 'react';
import { createApiClient, type GebApiClient } from '@geb/api-client';
import { useAuth } from '@geb/auth';

/**
 * Cliente HTTP GEB memoizado, cableado a la sesión de @geb/auth.
 * Cada feature recibe este cliente por parámetro en sus funciones de `api/`
 * en vez de crear su propia instancia (regla 4.3: el tenant lo resuelve
 * siempre el backend a partir del token, nunca un header manual acá).
 */
export function useClienteApi(): GebApiClient {
  const { obtenerToken } = useAuth();

  return useMemo(
    () =>
      createApiClient({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        obtenerToken,
      }),
    [obtenerToken],
  );
}
