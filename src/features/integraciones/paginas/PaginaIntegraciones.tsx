import { useParams } from 'react-router-dom';
import { GebEmptyState } from '@geb/ui';

/** TODO: vista de seguimiento Bluesite/Cosinte/Medilaboral por vacante, con acción "refrescar". */
export function PaginaIntegraciones() {
  const { jobRequisitionId } = useParams<{ jobRequisitionId: string }>();

  return (
    <GebEmptyState
      titulo="Integraciones con proveedores"
      descripcion={`TODO: estado de Bluesite/Cosinte/Medilaboral para ${jobRequisitionId ?? ''} (GET /vacantes/{id}/integraciones).`}
    />
  );
}
