import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerInformeIncognito, type InformeIncognito } from '../api/bandejas';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Informe incógnito de un candidato puntual
 * (`GET /candidatos/{id}/informe-incognito`), para abrir el modal directo
 * desde una notificación del Líder, sin pasar por la tabla de informes ni por
 * la resolución alias→id de `useCandidatosEnRevisionLider`. Deshabilitado si
 * no hay `jobApplicationId`.
 */
export function useInformeIncognitoDirecto(
  clienteApi: GebApiClient,
  jobApplicationId: string | null,
): EstadoPeticion<InformeIncognito> {
  const ejecutor = useCallback(
    () => obtenerInformeIncognito(clienteApi, jobApplicationId as string),
    [clienteApi, jobApplicationId],
  );

  return usePeticion(ejecutor, [ejecutor], jobApplicationId !== null);
}
