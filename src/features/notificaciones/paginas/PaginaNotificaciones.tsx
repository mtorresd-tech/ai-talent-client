import Stack from '@mui/material/Stack';
import { GebEmptyState } from '@geb/ui';
import { EncabezadoPagina } from '../../../shared/components/EncabezadoPagina';

/**
 * TODO: sin endpoint dedicado todavía — visible en ambos portales.
 * Probablemente termine leyendo GET /bandejas/resumen a falta de un
 * endpoint propio, pero eso se confirma con backend cuando exista un
 * requirement real para esta pantalla; no asumirlo acá.
 */
export function PaginaNotificaciones() {
  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }}>
      <EncabezadoPagina
        titulo="Notificaciones"
        subtitulo="Mantente al tanto de las novedades de tus procesos de selección."
      />
      <GebEmptyState
        titulo="Muy pronto"
        descripcion="Esta sección estará disponible en una próxima entrega."
      />
    </Stack>
  );
}
