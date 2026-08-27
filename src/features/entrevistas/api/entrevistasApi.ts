import type { GebApiClient } from '@geb/api-client';
import type { TipoEntrevista } from '../../../shared/tipos/dominio';

export interface CriterioEntrevista {
  clave: string;
  etiqueta: string;
  peso: number;
}

export interface Entrevista {
  tipo: TipoEntrevista;
  calificadaEn: string | null;
  puntajeTotal: number | null;
  puntajesPorCriterio: Record<string, number>;
}

export interface CalificacionRequest {
  puntajesPorCriterio: Record<string, number>;
}

export function listarEntrevistas(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<Entrevista[]>(`/candidatos/${jobApplicationId}/entrevistas`);
}

export function listarCriteriosEntrevista(
  clienteApi: GebApiClient,
  jobRequisitionId: string,
  tipo: TipoEntrevista,
) {
  return clienteApi.get<CriterioEntrevista[]>(
    `/vacantes/${jobRequisitionId}/criterios-entrevista`,
    {
      params: { tipo },
    },
  );
}

/** El puntaje total lo calcula el backend con los pesos configurados por vacante, no el cliente. */
export function calificarEntrevista(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  tipo: TipoEntrevista,
  datos: CalificacionRequest,
) {
  return clienteApi.put<Entrevista>(`/candidatos/${jobApplicationId}/entrevistas/${tipo}`, datos);
}
