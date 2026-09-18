import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import { listarInformesIncognito, type InformeIncognito } from '../api/bandejas';
import { aPaginaServidor } from '../logica/paginacion';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Lista paginada de informes anonimizados de una vacante
 * (`GET /vacantes/{jobRequisitionId}/informes-incognito`). Convierte la página
 * base 0 de la tabla a la base 1 del contrato y normaliza `experiencia`,
 * `estudios` y `competencias` a arreglos para que los consumidores no tengan
 * que comprobar su ausencia. Queda deshabilitado mientras no haya vacante
 * seleccionada.
 */
export function useInformesIncognito(
  clienteApi: GebApiClient,
  jobRequisitionId: string | null,
  /** Página base 0 (la que maneja la tabla). */
  pagina: number,
  tamanoPagina: number,
): EstadoPeticion<RespuestaPaginada<InformeIncognito>> {
  const ejecutor = useCallback(async () => {
    const respuesta = await listarInformesIncognito(clienteApi, jobRequisitionId as string, {
      page: aPaginaServidor(pagina),
      pageSize: tamanoPagina,
    });
    return {
      ...respuesta,
      data: respuesta.data.map((informe) => ({
        ...informe,
        experiencia: informe.experiencia ?? [],
        estudios: informe.estudios ?? [],
        competencias: informe.competencias ?? [],
      })),
    };
  }, [clienteApi, jobRequisitionId, pagina, tamanoPagina]);

  return usePeticion(ejecutor, [ejecutor], jobRequisitionId !== null);
}
