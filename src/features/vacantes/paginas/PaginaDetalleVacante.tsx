import { useParams } from 'react-router-dom';
import { GebEmptyState } from '@geb/ui';

/**
 * TODO: detalle de vacante — pipeline (fases SAP + pasos IA Talento vía
 * obtenerPipeline) y tabla de candidatos con GebDataTable.
 */
export function PaginaDetalleVacante() {
  const { jobRequisitionId } = useParams<{ jobRequisitionId: string }>();

  return (
    <GebEmptyState
      titulo="Detalle de vacante"
      descripcion={`TODO: pipeline y candidatos de la vacante ${jobRequisitionId ?? ''} (GET /vacantes/{id}, /vacantes/{id}/pipeline, /vacantes/{id}/candidatos).`}
    />
  );
}
