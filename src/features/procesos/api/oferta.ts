import type { GebApiClient } from '@geb/api-client';
import type { SincronizacionSfsf } from '../../../shared/tipos/dominio';

export interface Oferta {
  jobApplicationId: string;
  estado: 'GENERADA' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA';
  cargo: string;
  ciudad: string;
  modalidad: 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO';
  fechaEstimadaIngreso: string;
  salario: number | null;
  observaciones: string | null;
  generadaPor: string | null;
  generadaEn: string;
  sincronizacionSfsf: SincronizacionSfsf;
}

export interface OfertaRequest {
  cargo: string;
  ciudad: string;
  modalidad: 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO';
  fechaEstimadaIngreso: string;
  salario?: number;
  observaciones?: string;
}

/** 404 si aún no se ha generado. */
export function obtenerOferta(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<Oferta>(`/candidatos/${jobApplicationId}/oferta`);
}

/** 409 si el candidato no completó las etapas previas, o si la vacante ya no tiene cupo. */
export function generarOferta(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  datos: OfertaRequest,
) {
  return clienteApi.post<Oferta>(`/candidatos/${jobApplicationId}/oferta`, datos);
}
