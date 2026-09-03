import { useCallback } from 'react';
import { ApiError, type GebApiClient } from '@geb/api-client';
import { obtenerPrefiltro, type Prefiltro } from '../api/prefiltro';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Prefiltro telefónico del candidato (`GET /candidatos/{id}/prefiltro`). Un
 * `404` significa "aún no se ha diligenciado", no un error: el ejecutor lo
 * captura y devuelve `null` para que la región muestre un vacío informativo.
 * Deshabilitado si no hay `jobApplicationId`.
 */
export function usePrefiltroCandidato(
  clienteApi: GebApiClient,
  jobApplicationId: string | null,
): EstadoPeticion<Prefiltro | null> {
  const ejecutor = useCallback(
    async (signal: AbortSignal) => {
      try {
        return await obtenerPrefiltro(clienteApi, jobApplicationId as string, { signal });
      } catch (problema: unknown) {
        if (problema instanceof ApiError && problema.problem.status === 404) {
          return null;
        }
        throw problema;
      }
    },
    [clienteApi, jobApplicationId],
  );

  return usePeticion(ejecutor, [ejecutor], jobApplicationId !== null);
}
