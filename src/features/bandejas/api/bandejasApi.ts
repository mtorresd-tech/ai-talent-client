import type { GebApiClient } from '@geb/api-client';
import type { Compuerta, RespuestaPaginada } from '../../../shared/tipos/dominio';

export interface ItemBandeja {
  jobApplicationId: string;
  jobRequisitionId: string;
  alias: string;
  compuerta: Compuerta;
  esperandoDesde: string;
}

export interface ResumenBandeja {
  compuerta: Compuerta;
  pendientes: number;
  masAntiguo: string | null;
}

export interface InformeIncognito {
  alias: string;
  generadoEn: string;
  aniosExperienciaTotal: number | null;
  nivelAcademicoMaximo: string | null;
}

export interface DecisionRequest {
  decision: 'APRUEBA' | 'RECHAZA';
  /** Obligatorio cuando `decision` es RECHAZA. */
  motivo?: string;
}

export function obtenerBandeja(
  clienteApi: GebApiClient,
  compuerta: Compuerta,
  parametros: { page?: number; pageSize?: number; jobRequisitionId?: string } = {},
) {
  return clienteApi.get<RespuestaPaginada<ItemBandeja>>(`/bandejas/${compuerta}`, {
    params: parametros,
  });
}

export function obtenerResumenBandejas(clienteApi: GebApiClient) {
  return clienteApi.get<ResumenBandeja[]>('/bandejas/resumen');
}

export function listarInformesIncognito(
  clienteApi: GebApiClient,
  jobRequisitionId: string,
  parametros: { page?: number; pageSize?: number; jobApplicationIds?: string[] } = {},
) {
  return clienteApi.get<RespuestaPaginada<InformeIncognito>>(
    `/vacantes/${jobRequisitionId}/informes-incognito`,
    { params: parametros },
  );
}

export function obtenerInformeIncognito(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<InformeIncognito>(`/candidatos/${jobApplicationId}/informe-incognito`);
}

/**
 * Solo aplica a compuertas en política MANUAL — 409 si la compuerta está en
 * AUTOMATICA (la resuelve el backend) o si no corresponde al estado actual.
 */
export function registrarDecision(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  datos: DecisionRequest,
) {
  return clienteApi.post<{ jobApplicationId: string; estadoNuevo: string }>(
    `/candidatos/${jobApplicationId}/decisiones`,
    datos,
  );
}
