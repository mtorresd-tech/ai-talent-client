import { GebEmptyState } from '@geb/ui';

/**
 * TODO: portal del líder — selector de vacante, step rail de sus 3 etapas y
 * tabla de informes incógnito con GebApprovalInbox/GebDataTable de @geb/ui.
 */
export function PaginaInformesIncognito() {
  return (
    <GebEmptyState
      titulo="Informes incógnitos"
      descripcion="TODO: informes anonimizados pendientes de decisión del líder (GET /vacantes/{id}/informes-incognito)."
    />
  );
}
