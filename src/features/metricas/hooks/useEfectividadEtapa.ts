import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import type { Compuerta } from '../../../shared/tipos/dominio';
import { obtenerEfectividadEtapa, type EfectividadEtapa } from '../api/metricas';
import { usePeticion, type EstadoPeticion } from '../../procesos/hooks/usePeticion';

export interface ParametrosEfectividadEtapa {
  etapa: Compuerta | null;
  desde: string;
  hasta: string;
}

/**
 * Efectividad de una compuerta (`GET /metricas/etapa/{etapa}`), filtrada por
 * fecha de decisión. Deshabilitado mientras no haya `etapa` elegida.
 */
export function useEfectividadEtapa(
  clienteApi: GebApiClient,
  { etapa, desde, hasta }: ParametrosEfectividadEtapa,
): EstadoPeticion<EfectividadEtapa> {
  const habilitado = etapa !== null;

  const ejecutor = useCallback(
    (signal: AbortSignal) =>
      obtenerEfectividadEtapa(
        clienteApi,
        etapa as Compuerta,
        { desde: desde || undefined, hasta: hasta || undefined },
        { signal },
      ),
    [clienteApi, etapa, desde, hasta],
  );

  return usePeticion(ejecutor, [ejecutor], habilitado);
}
