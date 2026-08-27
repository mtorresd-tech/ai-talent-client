import type { GebApiClient } from '@geb/api-client';

export interface Oferta {
  jobApplicationId: string;
  cargo: string;
  ciudad: string;
  modalidad: string;
  fechaEstimadaIngreso: string;
}

export interface OfertaRequest {
  cargo: string;
  ciudad: string;
  modalidad: string;
  fechaEstimadaIngreso: string;
}

export function obtenerOferta(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<Oferta>(`/candidatos/${jobApplicationId}/oferta`);
}

export function generarOferta(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  datos: OfertaRequest,
) {
  return clienteApi.post<Oferta>(`/candidatos/${jobApplicationId}/oferta`, datos);
}
