import { useParams } from 'react-router-dom';
import { GebEmptyState } from '@geb/ui';

/**
 * TODO: formulario de prefiltro telefónico (P-04) con @geb/forms. En el
 * mockup de referencia es un modal, no una página — decidir al implementar.
 */
export function PaginaPrefiltro() {
  const { jobApplicationId } = useParams<{ jobApplicationId: string }>();

  return (
    <GebEmptyState
      titulo="Prefiltro telefónico"
      descripcion={`TODO: registrar el prefiltro de ${jobApplicationId ?? ''} (POST /candidatos/{id}/prefiltro).`}
    />
  );
}
