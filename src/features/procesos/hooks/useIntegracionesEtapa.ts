import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import type { Proveedor, RespuestaPaginada } from '../../../shared/tipos/dominio';
import { listarIntegracionesDeVacante, type SeguimientoIntegracion } from '../../integraciones';
import { usePeticion, type EstadoPeticion } from './usePeticion';

export interface ParametrosIntegracionesEtapa {
  jobRequisitionId: string | null;
  /** Proveedor a consultar: el del paso activo (Bluesite o Cosinte). */
  proveedor: Proveedor;
  /** El llamador solo habilita esta petición cuando el paso activo tiene integración de proveedor. */
  habilitado: boolean;
}

/**
 * Integraciones persistidas de la vacante para un proveedor
 * (`GET /vacantes/{id}/integraciones?proveedor=...`), usadas para cruzar el
 * badge "Requiere atención" de la lista del paso. Es una petición
 * independiente de `useCandidatosEtapa`: si falla o tarda, la lista de
 * candidatos se pinta igual, sin badges — no expone su `error` a ningún
 * `EstadoError` porque no tiene región propia en la pantalla.
 */
export function useIntegracionesEtapa(
  clienteApi: GebApiClient,
  { jobRequisitionId, proveedor, habilitado }: ParametrosIntegracionesEtapa,
): EstadoPeticion<RespuestaPaginada<SeguimientoIntegracion>> {
  const activo = jobRequisitionId !== null && habilitado;

  const ejecutor = useCallback(
    (signal: AbortSignal) =>
      listarIntegracionesDeVacante(
        clienteApi,
        jobRequisitionId as string,
        { proveedor, pageSize: 100 },
        { signal },
      ),
    [clienteApi, jobRequisitionId, proveedor],
  );

  return usePeticion(ejecutor, [ejecutor], activo);
}
