import type { GebApiClient } from '@geb/api-client';
import type { Compuerta, EstadoProceso } from '../../../shared/tipos/dominio';

export interface CandidatoResumen {
  jobApplicationId: string;
  jobRequisitionId: string;
  alias: string;
  nombre: string | null;
  numeroDocumento: string | null;
  estado: EstadoProceso;
  estadoDesde: string;
  scoreAfinidad: number | null;
  rankingPosicion: number | null;
  esperandoDecision: boolean;
  compuertaPendiente: Compuerta | null;
}

export interface EventoHistorial {
  fecha: string;
  descripcion: string;
  actor: string | null;
}

export function obtenerCandidato(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<CandidatoResumen>(`/candidatos/${jobApplicationId}`);
}

export function obtenerHistorial(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<EventoHistorial[]>(`/candidatos/${jobApplicationId}/historial`);
}

export function recalcularAfinidad(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.post<{ jobApplicationId: string; correlationId: string }>(
    `/candidatos/${jobApplicationId}/afinidad`,
  );
}

export function obtenerUrlDocumento(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  documentoId: string,
) {
  return clienteApi.get<{ url: string; expiraEn: string; contentType?: string }>(
    `/candidatos/${jobApplicationId}/documentos/${documentoId}/url`,
  );
}
