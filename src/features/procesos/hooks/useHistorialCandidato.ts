import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerHistorial, type EventoHistorial } from '../api/candidatos';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Historial de eventos del candidato (`GET /candidatos/{id}/historial`), fuente
 * primaria de la línea de tiempo del proceso. Deshabilitado si no hay
 * `jobApplicationId`.
 */
export function useHistorialCandidato(
  clienteApi: GebApiClient,
  jobApplicationId: string | null,
): EstadoPeticion<EventoHistorial[]> {
  const ejecutor = useCallback(
    (signal: AbortSignal) => obtenerHistorial(clienteApi, jobApplicationId as string, { signal }),
    [clienteApi, jobApplicationId],
  );

  return usePeticion(ejecutor, [ejecutor], jobApplicationId !== null);
}
