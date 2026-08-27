import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import { listarCandidatosDeVacante, type CandidatoResumen } from '../api/candidatos';
import { estadosDeEtapa } from '../logica/mapaEstadosPorEtapa';
import { aPaginaServidor } from '../logica/paginacion';
import { usePeticion, type EstadoPeticion } from './usePeticion';

export interface ParametrosCandidatosEtapa {
  jobRequisitionId: string | null;
  /** Clave de la etapa activa del pipeline. */
  etapaClave: string | null;
  /** Página base 0 de la lista. */
  pagina: number;
  tamanoPagina: number;
}

/**
 * Candidatos de la etapa activa (`GET /vacantes/{id}/candidatos`), ordenados
 * por `scoreAfinidad` descendente. El filtro se arma traduciendo la clave de la
 * etapa a estados (`ESTADOS_POR_ETAPA`). Si la etapa no es operativa (sin
 * estados mapeados) el hook queda deshabilitado y no llama al backend.
 */
export function useCandidatosEtapa(
  clienteApi: GebApiClient,
  { jobRequisitionId, etapaClave, pagina, tamanoPagina }: ParametrosCandidatosEtapa,
): EstadoPeticion<RespuestaPaginada<CandidatoResumen>> {
  const estados = estadosDeEtapa(etapaClave);
  const habilitado = jobRequisitionId !== null && estados.length > 0;
  const claveEstados = estados.join(',');

  const ejecutor = useCallback(
    (signal: AbortSignal) =>
      listarCandidatosDeVacante(
        clienteApi,
        jobRequisitionId as string,
        {
          page: aPaginaServidor(pagina),
          pageSize: tamanoPagina,
          estado: claveEstados
            ? (claveEstados.split(',') as CandidatoResumen['estado'][])
            : undefined,
          ordenarPor: 'scoreAfinidad',
          direccion: 'desc',
        },
        { signal },
      ),
    [clienteApi, jobRequisitionId, claveEstados, pagina, tamanoPagina],
  );

  return usePeticion(ejecutor, [ejecutor], habilitado);
}
