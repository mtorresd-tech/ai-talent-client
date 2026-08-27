import type { GebApiClient } from '@geb/api-client';
import type { TipoEntrevista } from '../../../shared/tipos/dominio';

export interface CriterioEntrevista {
  clave: string;
  nombre: string;
  descripcion: string | null;
  /** Peso relativo dentro del total; la suma de los pesos de una entrevista es 1. */
  peso: number;
  puntajeMinimo: number;
  puntajeMaximo: number;
}

export interface Entrevista {
  tipo: TipoEntrevista;
  calificada: boolean;
  /** Calculado por el backend con los pesos de la vacante — el cliente nunca lo calcula. */
  puntajeTotal: number | null;
  criterios: { clave: string; nombre: string; puntaje: number | null }[];
  comentario: string | null;
  calificadaPor: string | null;
  calificadaEn: string | null;
}

export interface CalificacionRequest {
  criterios: { clave: string; puntaje: number }[];
  comentario?: string;
}

export function listarEntrevistas(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<Entrevista[]>(`/candidatos/${jobApplicationId}/entrevistas`);
}

/** Los criterios son configurables por vacante — el frontend no debe traerlos codificados. */
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

/** Al calificar, el candidato avanza a la siguiente etapa del portal del líder. */
export function calificarEntrevista(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  tipo: TipoEntrevista,
  datos: CalificacionRequest,
) {
  return clienteApi.put<Entrevista>(`/candidatos/${jobApplicationId}/entrevistas/${tipo}`, datos);
}
