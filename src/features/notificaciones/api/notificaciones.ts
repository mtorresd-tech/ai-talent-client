import type { GebApiClient } from '@geb/api-client';

export interface Notificacion {
  id: string;
  jobRequisitionId: string;
  jobApplicationId: string;
  tipo:
    | 'INFORME_SELECTA_LISTO'
    | 'INFORME_ANONIMIZACION_LISTO'
    | 'MATRIZ_ENVIADA_AL_LIDER'
    | 'MATRIZ_REVISADA_POR_EL_LIDER';
  mensaje: string;
  /** ISO date-time. */
  creadaEn: string;
  leida: boolean;
}

export interface ParametrosListarNotificaciones {
  /** Se omite para "Todas". */
  leida?: boolean;
}

/** El `rol` no se envía: el backend lo infiere del token. */
export function listarNotificaciones(
  clienteApi: GebApiClient,
  parametros: ParametrosListarNotificaciones = {},
  opciones: { signal?: AbortSignal } = {},
) {
  return clienteApi.get<Notificacion[]>('/notificaciones', {
    params: parametros,
    signal: opciones.signal,
  });
}

export function marcarNotificacionLeida(clienteApi: GebApiClient, notificacionId: string) {
  return clienteApi.post<Notificacion>(`/notificaciones/${notificacionId}/leida`);
}
