import { GebEmptyState } from '@geb/ui';

/**
 * TODO: historial de decisiones del líder. El contrato actual no tiene un
 * endpoint agregado para esto — evaluar si se arma sobre el historial por
 * candidato (GET /candidatos/{id}/historial) o si hace falta pedirlo al backend.
 */
export function PaginaHistorialLider() {
  return (
    <GebEmptyState
      titulo="Historial"
      descripcion="TODO: decisiones previas del líder — endpoint agregado pendiente de definir con el backend."
    />
  );
}
