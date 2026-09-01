import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerCandidato, type CandidatoDetalle } from '../api/candidatos';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Detalle del candidato seleccionado (`GET /candidatos/{id}`), del que se pinta
 * el `desgloseAfinidad` en el panel derecho. Deshabilitado si no hay selección.
 */
export function useDetalleCandidato(
  clienteApi: GebApiClient,
  jobApplicationId: string | null,
): EstadoPeticion<CandidatoDetalle> {
  const ejecutor = useCallback(
    (signal: AbortSignal) => obtenerCandidato(clienteApi, jobApplicationId as string, { signal }),
    [clienteApi, jobApplicationId],
  );

  return usePeticion(ejecutor, [ejecutor], jobApplicationId !== null);
}
