import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerEmbudoMetricas, type EmbudoSelecta } from '../api/metricas';
import { usePeticion, type EstadoPeticion } from '../../procesos/hooks/usePeticion';
import type { ParametrosRangoFechas } from './useResumenMetricas';

/** Embudo temprano de Selecta (`GET /metricas/embudo`), filtrado por fecha de postulación. */
export function useEmbudoMetricas(
  clienteApi: GebApiClient,
  { desde, hasta }: ParametrosRangoFechas,
): EstadoPeticion<EmbudoSelecta> {
  const ejecutor = useCallback(
    (signal: AbortSignal) =>
      obtenerEmbudoMetricas(
        clienteApi,
        { desde: desde || undefined, hasta: hasta || undefined },
        { signal },
      ),
    [clienteApi, desde, hasta],
  );

  return usePeticion(ejecutor, [ejecutor]);
}
