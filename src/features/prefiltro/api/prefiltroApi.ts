import type { GebApiClient } from '@geb/api-client';

export interface Prefiltro {
  jobApplicationId: string;
  fechaFiltro: string;
  validacion: string;
  validacion2: string;
  observaciones: string | null;
}

export interface PrefiltroRequest {
  fechaFiltro: string;
  validacion: string;
  validacion2: string;
  observaciones?: string;
}

export function obtenerPrefiltro(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<Prefiltro>(`/candidatos/${jobApplicationId}/prefiltro`);
}

export function registrarPrefiltro(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  datos: PrefiltroRequest,
) {
  return clienteApi.post<{ jobApplicationId: string; registradoEn: string }>(
    `/candidatos/${jobApplicationId}/prefiltro`,
    datos,
  );
}
