import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerVacante, type VacanteDetalle } from '../api/vacantes';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Detalle de la vacante seleccionada (`GET /vacantes/{id}`). Deshabilitado
 * mientras no haya vacante activa.
 */
export function useDetalleVacante(
  clienteApi: GebApiClient,
  jobRequisitionId: string | null,
): EstadoPeticion<VacanteDetalle> {
  const ejecutor = useCallback(
    (signal: AbortSignal) => obtenerVacante(clienteApi, jobRequisitionId as string, { signal }),
    [clienteApi, jobRequisitionId],
  );

  return usePeticion(ejecutor, [ejecutor], jobRequisitionId !== null);
}
