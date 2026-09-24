import type { Notificacion } from '../api/notificaciones';

/**
 * Ruta de destino al hacer clic en una notificación. La decisión depende del
 * rol de quien la ve, no del `tipo` de la notificación: un Reclutador navega
 * al detalle del candidato sin importar el tipo; cualquier otro rol nunca
 * navega.
 */
export function rutaNotificacion(notificacion: Notificacion, esReclutador: boolean): string | null {
  if (!esReclutador) return null;
  return `/procesos/candidato/${notificacion.jobApplicationId}`;
}
