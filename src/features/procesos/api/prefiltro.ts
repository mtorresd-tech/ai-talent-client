import type { GebApiClient } from '@geb/api-client';
import type { SincronizacionSfsf } from '../../../shared/tipos/dominio';
import type { OpcionesPeticion } from './vacantes';

export interface Prefiltro {
  jobApplicationId: string;
  cumplePerfil: boolean | null;
  interesContinuidad: boolean | null;
  desempenoUltimoAnio: string | null;
  tiempoVinculacion: string | null;
  sancionadoUltimoAnio: boolean | null;
  promovidoUltimoAnio: boolean | null;
  observaciones: string | null;
  registradoPor: string | null;
  registradoEn: string;
  sincronizacionSfsf: SincronizacionSfsf;
}

export interface PrefiltroRequest {
  cumplePerfil: boolean;
  interesContinuidad: boolean;
  desempenoUltimoAnio?: string;
  tiempoVinculacion?: string;
  sancionadoUltimoAnio?: boolean;
  promovidoUltimoAnio?: boolean;
  observaciones?: string;
}

/** 404 si aún no se ha diligenciado. */
export async function obtenerPrefiltro(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  opciones: OpcionesPeticion = {},
): Promise<Prefiltro> {
  const prefiltro = await clienteApi.get<Prefiltro>(`/candidatos/${jobApplicationId}/prefiltro`, {
    signal: opciones.signal,
  });
  return {
    ...prefiltro,
    sincronizacionSfsf: {
      ...prefiltro.sincronizacionSfsf,
      intentos: prefiltro.sincronizacionSfsf?.intentos ?? 0,
    },
  };
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
