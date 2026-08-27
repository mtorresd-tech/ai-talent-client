import { GebEmptyState } from '@geb/ui';

/**
 * TODO: sin endpoint dedicado todavía — visible en ambos portales.
 * Probablemente termine leyendo GET /bandejas/resumen a falta de un
 * endpoint propio, pero eso se confirma con backend cuando exista un
 * requirement real para esta pantalla; no asumirlo acá.
 */
export function PaginaNotificaciones() {
  return (
    <GebEmptyState
      titulo="Notificaciones"
      descripcion="TODO: pendiente de endpoints del backend."
    />
  );
}
