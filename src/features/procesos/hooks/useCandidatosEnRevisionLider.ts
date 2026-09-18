import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { listarCandidatosDeVacante } from '../api/candidatos';
import { usePeticion, type EstadoPeticion } from './usePeticion';

const TAMANO_PAGINA = 100;

export interface CandidatosEnRevisionLider {
  /** Mapa `alias → jobApplicationId` de los candidatos en `EN_REVISION_LIDER`. */
  mapa: Map<string, string>;
  cargando: boolean;
  error: EstadoPeticion<Map<string, string>>['error'];
  recargar: () => void;
}

/**
 * Cruce `alias → jobApplicationId` de los candidatos en `EN_REVISION_LIDER` de
 * la vacante activa (`GET /vacantes/{id}/candidatos`), en una sola página de
 * hasta 100 registros. Queda deshabilitado mientras no haya vacante
 * seleccionada.
 */
export function useCandidatosEnRevisionLider(
  clienteApi: GebApiClient,
  jobRequisitionId: string | null,
): CandidatosEnRevisionLider {
  const ejecutor = useCallback(async () => {
    const respuesta = await listarCandidatosDeVacante(clienteApi, jobRequisitionId as string, {
      estado: ['EN_REVISION_LIDER'],
      pageSize: TAMANO_PAGINA,
    });
    return new Map(
      respuesta.data.map((candidato) => [candidato.alias, candidato.jobApplicationId]),
    );
  }, [clienteApi, jobRequisitionId]);

  const { datos, cargando, error, recargar } = usePeticion(
    ejecutor,
    [ejecutor],
    jobRequisitionId !== null,
  );

  return { mapa: datos ?? new Map(), cargando, error, recargar };
}
