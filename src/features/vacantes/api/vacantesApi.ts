import type { GebApiClient } from '@geb/api-client';
import type { Portal, RespuestaPaginada } from '../../../shared/tipos/dominio';

export interface VacanteResumen {
  jobRequisitionId: string;
  titulo: string;
  area: string | null;
  ciudad: string | null;
  totalCandidatos: number;
  pendientesDecision: number;
  numeroVacantes: number | null;
  cerrada: boolean;
  conteoPorEstado: Record<string, number>;
}

/** TODO: confirmar el shape exacto de `EtapaPipeline` contra el contrato — es una aproximación. */
export interface EtapaPipeline {
  clave: string;
  etiqueta: string;
  cantidadCandidatos: number;
}

export interface ParametrosListarVacantes {
  page?: number;
  pageSize?: number;
  q?: string;
  soloConPendientes?: boolean;
}

export function listarVacantes(
  clienteApi: GebApiClient,
  parametros: ParametrosListarVacantes = {},
) {
  return clienteApi.get<RespuestaPaginada<VacanteResumen>>('/vacantes', { params: parametros });
}

export function obtenerVacante(clienteApi: GebApiClient, jobRequisitionId: string) {
  return clienteApi.get<VacanteResumen>(`/vacantes/${jobRequisitionId}`);
}

export function obtenerPipeline(
  clienteApi: GebApiClient,
  jobRequisitionId: string,
  portal?: Portal,
) {
  return clienteApi.get<EtapaPipeline[]>(`/vacantes/${jobRequisitionId}/pipeline`, {
    params: portal ? { portal } : undefined,
  });
}

export function recalcularAfinidadVacante(clienteApi: GebApiClient, jobRequisitionId: string) {
  return clienteApi.post<{ jobRequisitionId: string; candidatosEncolados: number }>(
    `/vacantes/${jobRequisitionId}/afinidad`,
  );
}
