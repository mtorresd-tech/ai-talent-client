import type { GebApiClient } from '@geb/api-client';
import type {
  Proveedor,
  RespuestaPaginada,
  SubestadoIntegracion,
} from '../../../shared/tipos/dominio';

export interface SeguimientoIntegracion {
  jobApplicationId: string;
  proveedor: Proveedor;
  subestado: SubestadoIntegracion;
  fechaSolicitud: string | null;
  fechaResultado: string | null;
  intentos: number;
}

export interface ParametrosListarIntegraciones {
  page?: number;
  pageSize?: number;
  proveedor?: Proveedor;
  soloAtencion?: boolean;
}

export function listarIntegracionesDeVacante(
  clienteApi: GebApiClient,
  jobRequisitionId: string,
  parametros: ParametrosListarIntegraciones = {},
) {
  return clienteApi.get<RespuestaPaginada<SeguimientoIntegracion>>(
    `/vacantes/${jobRequisitionId}/integraciones`,
    { params: parametros },
  );
}

/** Limitado a una invocación por candidato y proveedor cada 5 min — el backend devuelve 429 si se excede. */
export function refrescarIntegracion(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  proveedor: Proveedor,
) {
  return clienteApi.post<{ proveedor: Proveedor; subestado: SubestadoIntegracion }>(
    `/candidatos/${jobApplicationId}/integraciones/${proveedor}/refrescar`,
  );
}
