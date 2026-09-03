import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { CandidatoDetalle } from '../api/candidatos';
import { PASO_INICIAL } from '../logica/pipelineReclutador';

/** Contexto de origen del detalle: de dónde vino el reclutador y cómo volver. */
export interface ContextoOrigen {
  /** `jobApplicationId` del candidato en detalle (parámetro de ruta). */
  jobApplicationId: string;
  /** `?vacante`, con respaldo en `CandidatoDetalle.jobRequisitionId`. */
  jobRequisitionId: string | null;
  /** `?paso` (una `EtapaPipeline.clave`), con respaldo en `PASO_INICIAL`. */
  claveEtapa: string;
  /** Ruta de retorno a Procesos con la selección restaurada. */
  urlVolver: string;
}

/**
 * Deriva el contexto de origen del detalle del candidato a partir del
 * parámetro de ruta `jobApplicationId` y los query params `?vacante` y
 * `?paso`. Cuando faltan, aplica los respaldos: la vacante sale del detalle
 * del candidato y la etapa cae a `PASO_INICIAL`. `urlVolver` reconstruye
 * `/procesos?vacante=&paso=&candidato=` para que el listado restaure vacante,
 * etapa y candidato.
 */
export function useContextoOrigen(candidato: CandidatoDetalle | null): ContextoOrigen {
  const parametros = useParams<{ jobApplicationId: string }>();
  const [searchParams] = useSearchParams();

  const jobApplicationId = parametros.jobApplicationId ?? '';
  const vacanteParam = searchParams.get('vacante');
  const pasoParam = searchParams.get('paso');

  return useMemo(() => {
    const jobRequisitionId = vacanteParam || candidato?.jobRequisitionId || null;
    const claveEtapa = pasoParam || PASO_INICIAL;

    const params = new URLSearchParams();
    params.set('vacante', jobRequisitionId ?? '');
    params.set('paso', claveEtapa);
    params.set('candidato', jobApplicationId);

    return {
      jobApplicationId,
      jobRequisitionId,
      claveEtapa,
      urlVolver: `/procesos?${params.toString()}`,
    };
  }, [vacanteParam, pasoParam, candidato?.jobRequisitionId, jobApplicationId]);
}
