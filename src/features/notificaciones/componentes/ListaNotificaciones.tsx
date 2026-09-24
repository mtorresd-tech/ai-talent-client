import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { GebEmptyState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import type { Notificacion } from '../api/notificaciones';
import { rutaNotificacion } from '../logica/rutaNotificacion';
import { EstadoError } from '../../procesos/components/EstadoError';
import { ItemNotificacion } from './ItemNotificacion';
import type { ValorFiltroLeidas } from './FiltroLeidas';

const MENSAJE_VACIO: Record<ValorFiltroLeidas, string> = {
  todas: 'No tienes notificaciones',
  'no-leidas': 'Estás al día',
  leidas: 'Todavía no has leído ninguna notificación',
};

export interface ListaNotificacionesProps {
  notificaciones: Notificacion[] | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
  esReclutador: boolean;
  filtro: ValorFiltroLeidas;
  onClicItem: (notificacion: Notificacion) => void;
}

/** Bandeja de notificaciones: cada fila navega o no según el rol de quien la ve. */
export function ListaNotificaciones({
  notificaciones,
  cargando,
  error,
  onReintentar,
  esReclutador,
  filtro,
  onClicItem,
}: ListaNotificacionesProps) {
  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (cargando && !notificaciones) {
    return (
      <Stack spacing={1}>
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={56} />
      </Stack>
    );
  }

  if (!notificaciones || notificaciones.length === 0) {
    return <GebEmptyState titulo={MENSAJE_VACIO[filtro]} />;
  }

  return (
    <Stack>
      {notificaciones.map((notificacion) => (
        <ItemNotificacion
          key={notificacion.id}
          notificacion={notificacion}
          esReclutable={rutaNotificacion(notificacion, esReclutador) !== null}
          onClic={() => onClicItem(notificacion)}
        />
      ))}
    </Stack>
  );
}
