import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerCandidatoFinal } from '../api/vacantes';
import type { CandidatoDetalle } from '../api/candidatos';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Candidato final de la vacante activa (`GET /vacantes/{id}/candidato-final`).
 * Deshabilitado mientras no haya vacante activa.
 */
export function useCandidatoFinal(
  clienteApi: GebApiClient,
  jobRequisitionId: string | null,
): EstadoPeticion<CandidatoDetalle> {
  const ejecutor = useCallback(
    (signal: AbortSignal) =>
      obtenerCandidatoFinal(clienteApi, jobRequisitionId as string, { signal }),
    [clienteApi, jobRequisitionId],
  );

  return usePeticion(ejecutor, [ejecutor], jobRequisitionId !== null);
}
