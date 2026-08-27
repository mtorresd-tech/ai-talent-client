import type { GebApiClient } from '@geb/api-client';
import type { Portal, RespuestaPaginada } from '../../../shared/tipos/dominio';

export interface VacanteResumen {
  jobRequisitionId: string;
  titulo: string;
  area: string | null;
  ciudad: string | null;
  fechaPublicacion: string | null;
  totalCandidatos: number;
  pendientesDecision: number;
  /** Posiciones a cubrir (`numberOpenings` en SFSF). */
  numeroVacantes: number | null;
  cerrada: boolean;
  conteoPorEstado: Record<string, number>;
}

export interface VacanteDetalle extends VacanteResumen {
  descripcion: string | null;
  responsabilidades: string | null;
  estudios: string | null;
  aniosExperienciaGeneral: number | null;
  aniosExperienciaRelacionada: number | null;
  competencias: string[];
  /** Dueño de la vacante en SFSF. Origen de los datos de solicitante hacia los proveedores. */
  reclutador: { nombre: string; email: string } | null;
  fechaCierre: string | null;
  /** `openingsFilled` en SFSF. */
  vacantesCubiertas: number | null;
  /** Dominio Cosinte — 19 Básico, 116 Básico+Referenciación, 24 Confiabilidad, 28 Polígrafo, 29 Visita Domiciliaria. */
  tipoEstudioCosinte: number | null;
}

/** El orden y la composición de etapas los define el backend — nunca hardcodear el pipeline. */
export interface EtapaPipeline {
  clave: string;
  nombre: string;
  orden: number;
  total: number;
  pendientesDecision: number;
  automatica: boolean;
}

export interface ParametrosListarVacantes {
  page?: number;
  pageSize?: number;
  q?: string;
  /** Solo vacantes con al menos un candidato esperando decisión. */
  soloConPendientes?: boolean;
}

export function listarVacantes(
  clienteApi: GebApiClient,
  parametros: ParametrosListarVacantes = {},
) {
  return clienteApi.get<RespuestaPaginada<VacanteResumen>>('/vacantes', { params: parametros });
}

export function obtenerVacante(clienteApi: GebApiClient, jobRequisitionId: string) {
  return clienteApi.get<VacanteDetalle>(`/vacantes/${jobRequisitionId}`);
}

/** Si se omite `portal`, el backend lo deduce del rol del token. */
export function obtenerPipeline(
  clienteApi: GebApiClient,
  jobRequisitionId: string,
  portal?: Portal,
) {
  return clienteApi.get<EtapaPipeline[]>(`/vacantes/${jobRequisitionId}/pipeline`, {
    params: portal ? { portal } : undefined,
  });
}

/** Recalcula a todos los candidatos que aún no pasaron la compuerta RANKING; los ya decididos no se tocan. */
export function recalcularAfinidadVacante(clienteApi: GebApiClient, jobRequisitionId: string) {
  return clienteApi.post<{
    jobRequisitionId: string;
    candidatosEncolados: number;
    correlationId: string;
  }>(`/vacantes/${jobRequisitionId}/afinidad`);
}
