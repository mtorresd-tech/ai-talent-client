import { useParams } from 'react-router-dom';
import { GebEmptyState } from '@geb/ui';

/** TODO: formulario de calificación por criterio (P-14) con @geb/forms — criterios vía listarCriteriosEntrevista. */
export function PaginaCalificarEntrevista() {
  const { jobApplicationId, tipo } = useParams<{ jobApplicationId: string; tipo: string }>();

  return (
    <GebEmptyState
      titulo="Calificar entrevista"
      descripcion={`TODO: calificar entrevista ${tipo ?? ''} de ${jobApplicationId ?? ''} (PUT /candidatos/{id}/entrevistas/{tipo}).`}
    />
  );
}
