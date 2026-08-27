import { useParams } from 'react-router-dom';
import { GebEmptyState } from '@geb/ui';

/** TODO: pantalla de oferta laboral (P-10) — generar (@geb/forms) o mostrar la ya generada. */
export function PaginaOferta() {
  const { jobApplicationId } = useParams<{ jobApplicationId: string }>();

  return (
    <GebEmptyState
      titulo="Oferta laboral"
      descripcion={`TODO: oferta de ${jobApplicationId ?? ''} (GET/POST /candidatos/{id}/oferta).`}
    />
  );
}
