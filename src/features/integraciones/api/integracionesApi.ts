import type { GebApiClient } from '@geb/api-client';
import type {
  Proveedor,
  RespuestaPaginada,
  SubestadoIntegracion,
} from '../../../shared/tipos/dominio';
import type { ResultadoBluesite } from '../bluesite/tipos';
import type { ResultadoCosinte } from '../cosinte/tipos';
import type { ResultadoMedilaboral } from '../medilaboral/tipos';

export interface EstadoIntegracion {
  proveedor: Proveedor;
  subestado: SubestadoIntegracion;
  idExterno: string | null;
  fechaSolicitud: string | null;
  fechaResultado: string | null;
  fechaExpiracion: string | null;
  intentos: number;
  /** Shape según proveedor — Medilaboral no entrega dato estructurado, solo el PDF. */
  resultado: ResultadoBluesite | ResultadoCosinte | ResultadoMedilaboral | null;
}

export interface SeguimientoIntegracion {
  jobApplicationId: string;
  alias: string;
  nombre: string | null;
  integraciones: (EstadoIntegracion & {
    diasTranscurridos: number;
    /** ERROR, EXPIRADA, o ya superó la fecha estimada de entrega. */
    requiereAtencion: boolean;
  })[];
}

export interface ParametrosListarIntegraciones {
  page?: number;
  pageSize?: number;
  proveedor?: Proveedor;
  subestado?: SubestadoIntegracion[];
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
  return clienteApi.post<EstadoIntegracion>(
    `/candidatos/${jobApplicationId}/integraciones/${proveedor}/refrescar`,
  );
}
