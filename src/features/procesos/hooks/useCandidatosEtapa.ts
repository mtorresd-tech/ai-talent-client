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
 * por `scoreAfinidad` descendente y filtrados a los estados de esa etapa
 * (`ESTADOS_POR_ETAPA`). Si la etapa no es operativa (sin estados mapeados) el
 * hook queda deshabilitado y no llama al backend.
 */
export function useCandidatosEtapa(
  clienteApi: GebApiClient,
  { jobRequisitionId, etapaClave, pagina, tamanoPagina }: ParametrosCandidatosEtapa,
): EstadoPeticion<RespuestaPaginada<CandidatoResumen>> {
  const estados = estadosDeEtapa(etapaClave);
  const habilitado = jobRequisitionId !== null && estados.length > 0;
  const claveEstados = estados.join(',');

  const ejecutor = useCallback(
    async (signal: AbortSignal) => {
      const estadosEtapa = claveEstados
        ? (claveEstados.split(',') as CandidatoResumen['estado'][])
        : [];
      const respuesta = await listarCandidatosDeVacante(
        clienteApi,
        jobRequisitionId as string,
        {
          page: aPaginaServidor(pagina),
          pageSize: tamanoPagina,
          estado: estadosEtapa.length > 0 ? estadosEtapa : undefined,
          ordenarPor: 'scoreAfinidad',
          direccion: 'desc',
        },
        { signal },
      );
      return {
        ...respuesta,
        data: respuesta.data.filter((candidato) => estadosEtapa.includes(candidato.estado)),
      };
    },
    [clienteApi, jobRequisitionId, claveEstados, pagina, tamanoPagina],
  );

  return usePeticion(ejecutor, [ejecutor], habilitado);
}
