import { useMemo } from 'react';
import { createApiClient, ApiError, type GebApiClient } from '@geb/api-client';
import { useAuth } from '@geb/auth';
import { useSesionApi } from '../auth/SesionApiContext';

/**
 * Encadena, sobre el cliente ya creado por `createApiClient`, un interceptor
 * de respuesta que detecta un 403 (sesión autenticada sin rol asignado) y
 * avisa al `SesionApiContext` mediante `marcarSesionSinRol`. El error
 * original se vuelve a rechazar sin modificarlo, para que quien originó la
 * petición lo siga recibiendo tal cual.
 */
export function registrarDeteccionSesionSinRol(
  cliente: GebApiClient,
  marcarSesionSinRol: () => void,
): void {
  cliente.http.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (error instanceof ApiError && error.problem.status === 403) {
        marcarSesionSinRol();
      }
      return Promise.reject(error);
    },
  );
}

/**
 * Cliente HTTP GEB memoizado, cableado a la sesión de @geb/auth.
 * Cada feature recibe este cliente por parámetro en sus funciones de `api/`
 * en vez de crear su propia instancia (regla 4.3: el tenant lo resuelve
 * siempre el backend a partir del token, nunca un header manual acá).
 */
export function useClienteApi(): GebApiClient {
  const { obtenerToken } = useAuth();
  const { marcarSesionSinRol } = useSesionApi();

  return useMemo(() => {
    const cliente = createApiClient({
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      obtenerToken,
    });
    registrarDeteccionSesionSinRol(cliente, marcarSesionSinRol);
    return cliente;
  }, [obtenerToken, marcarSesionSinRol]);
}
