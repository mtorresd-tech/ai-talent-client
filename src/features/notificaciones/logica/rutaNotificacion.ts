import type { Notificacion } from '../api/notificaciones';
import { pasoPorTipoNotificacion } from './mapaTipoAPaso';

/**
 * Ruta de destino al hacer clic en una notificación. Depende del rol de quien
 * la ve y del paso del pipeline asociado a su `tipo` (`pasoPorTipoNotificacion`):
 * un Reclutador navega a la vista de pipeline inline, en el paso y candidato
 * correspondientes; un Líder solo navega cuando el paso es `ANONIMIZACION`
 * (el único informe que revisa). Sin paso asociado, no hay ruta para nadie.
 */
export function rutaNotificacion(notificacion: Notificacion, esReclutador: boolean): string | null {
  const paso = pasoPorTipoNotificacion(notificacion.tipo);
  if (!paso) return null;

  const { jobRequisitionId, jobApplicationId } = notificacion;

  if (esReclutador) {
    return `/procesos?vacante=${jobRequisitionId}&paso=${paso}&candidato=${jobApplicationId}`;
  }

  if (paso === 'ANONIMIZACION') {
    return `/procesos?vacante=${jobRequisitionId}&candidato=${jobApplicationId}`;
  }

  return null;
}
