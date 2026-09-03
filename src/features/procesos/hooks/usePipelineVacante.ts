import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerPipeline, type EtapaPipeline } from '../api/vacantes';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Etapas del pipeline de la vacante (`GET /vacantes/{id}/pipeline`), usadas
 * como embudo de contexto en el detalle del candidato. El backend define el
 * orden y la composición. Deshabilitado si no hay `jobRequisitionId`.
 */
export function usePipelineVacante(
  clienteApi: GebApiClient,
  jobRequisitionId: string | null,
): EstadoPeticion<EtapaPipeline[]> {
  const ejecutor = useCallback(
    (signal: AbortSignal) =>
      obtenerPipeline(clienteApi, jobRequisitionId as string, undefined, { signal }),
    [clienteApi, jobRequisitionId],
  );

  return usePeticion(ejecutor, [ejecutor], jobRequisitionId !== null);
}
