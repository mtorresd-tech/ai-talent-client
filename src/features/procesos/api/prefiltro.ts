import type { GebApiClient } from '@geb/api-client';
import type { SincronizacionSfsf } from '../../../shared/tipos/dominio';

export interface Prefiltro {
  jobApplicationId: string;
  cumplePerfil: boolean | null;
  interesContinuidad: boolean | null;
  desempenoUltimoAnio: string | null;
  /** Monto en pesos colombianos. */
  aspiracionSalarial: number | null;
  disponibilidad: string | null;
  observaciones: string | null;
  registradoPor: string | null;
  registradoEn: string;
  sincronizacionSfsf: SincronizacionSfsf;
}

export interface PrefiltroRequest {
  cumplePerfil: boolean;
  interesContinuidad: boolean;
  desempenoUltimoAnio?: string;
  aspiracionSalarial?: number;
  disponibilidad?: string;
  observaciones?: string;
}

/** 404 si aún no se ha diligenciado. */
export function obtenerPrefiltro(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<Prefiltro>(`/candidatos/${jobApplicationId}/prefiltro`);
}

/**
 * Guarda el resultado de la llamada previa a la anonimización — requisito
 * para poder enviar el candidato al líder. La respuesta confirma el guardado
 * en IA Talento, no en SFSF (ver `sincronizacionSfsf`).
 */
export function registrarPrefiltro(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  datos: PrefiltroRequest,
) {
  return clienteApi.post<{
    jobApplicationId: string;
    registradoEn: string;
    sincronizacionSfsf: SincronizacionSfsf;
  }>(`/candidatos/${jobApplicationId}/prefiltro`, datos);
}
