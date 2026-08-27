import { useParams } from 'react-router-dom';
import { GebEmptyState } from '@geb/ui';

/** TODO: bandeja de aprobaciones del reclutador con GebApprovalInbox de @geb/ui. */
export function PaginaBandeja() {
  const { compuerta } = useParams<{ compuerta: string }>();

  return (
    <GebEmptyState
      titulo="Bandeja de aprobaciones"
      descripcion={`TODO: pendientes de la compuerta ${compuerta ?? ''} (GET /bandejas/{compuerta}).`}
    />
  );
}
