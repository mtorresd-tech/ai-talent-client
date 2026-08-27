import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerPipeline, type EtapaPipeline } from '../api/vacantes';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Pipeline dinámico de la vacante (`GET /vacantes/{id}/pipeline`). El orden y
 * la composición de etapas los define el backend — nunca se hardcodean aquí.
 */
export function usePipeline(
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
