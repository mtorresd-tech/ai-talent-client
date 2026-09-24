import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerDuracionEtapas, type DuracionEtapa } from '../api/metricas';
import { usePeticion, type EstadoPeticion } from '../../procesos/hooks/usePeticion';
import type { ParametrosRangoFechas } from './useResumenMetricas';

/** Duración de las 6 etapas del pipeline (`GET /metricas/duracion-etapas`), filtrada por fecha de postulación. */
export function useDuracionEtapas(
  clienteApi: GebApiClient,
  { desde, hasta }: ParametrosRangoFechas,
): EstadoPeticion<DuracionEtapa[]> {
  const ejecutor = useCallback(
    (signal: AbortSignal) =>
      obtenerDuracionEtapas(
        clienteApi,
        { desde: desde || undefined, hasta: hasta || undefined },
        { signal },
      ),
    [clienteApi, desde, hasta],
  );

  return usePeticion(ejecutor, [ejecutor]);
}
