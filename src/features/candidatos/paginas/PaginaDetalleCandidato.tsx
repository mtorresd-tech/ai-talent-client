import { useParams } from 'react-router-dom';
import { GebEmptyState } from '@geb/ui';

/**
 * TODO: perfil del candidato — desglose de afinidad, línea de tiempo
 * (historial), extracción/registro manual y documentos.
 */
export function PaginaDetalleCandidato() {
  const { jobApplicationId } = useParams<{ jobApplicationId: string }>();

  return (
    <GebEmptyState
      titulo="Detalle de candidato"
      descripcion={`TODO: perfil, afinidad e historial de ${jobApplicationId ?? ''} (GET /candidatos/{id}, /candidatos/{id}/historial).`}
    />
  );
}
