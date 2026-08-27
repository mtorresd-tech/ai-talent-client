import { GebEmptyState } from '@geb/ui';

/**
 * TODO: pantalla "Procesos" del líder — selector de vacantes asignadas, rail
 * de 3 etapas fijas (Anonimización, Entrevista jefe inmediato, Segunda
 * entrevista) y tabla correspondiente a la etapa activa. En Anonimización el
 * candidato se muestra solo por alias hasta que el líder decide (nunca
 * nombre real).
 */
export function PaginaProcesosLider() {
  return (
    <GebEmptyState
      titulo="Procesos"
      descripcion="TODO: informes incógnitos y calificación de entrevistas del líder (GET /vacantes/{id}/informes-incognito, /candidatos/{id}/entrevistas/{tipo})."
    />
  );
}
