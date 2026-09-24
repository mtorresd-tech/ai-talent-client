import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerResumenMetricas, type ResumenMetricas } from '../api/metricas';
import { usePeticion, type EstadoPeticion } from '../../procesos/hooks/usePeticion';

export interface ParametrosRangoFechas {
  desde: string;
  hasta: string;
}

/** Resumen del panel de Métricas (`GET /metricas/resumen`), filtrado por fecha de publicación. */
export function useResumenMetricas(
  clienteApi: GebApiClient,
  { desde, hasta }: ParametrosRangoFechas,
): EstadoPeticion<ResumenMetricas> {
  const ejecutor = useCallback(
    (signal: AbortSignal) =>
      obtenerResumenMetricas(
        clienteApi,
        { desde: desde || undefined, hasta: hasta || undefined },
        { signal },
      ),
    [clienteApi, desde, hasta],
  );

  return usePeticion(ejecutor, [ejecutor]);
}
