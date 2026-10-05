import { useMemo } from 'react';
import type { GebApiClient } from '@geb/api-client';
import type { Notificacion } from '../api/notificaciones';
import { useNotificaciones } from './useNotificaciones';
import { useContadorNoLeidas } from './useContadorNoLeidas';

const MAXIMO_VISIBLES = 5;

export interface EstadoNotificacionesNavbar {
  notificaciones: Notificacion[];
  /** Conteo real de no leídas, no limitado a `notificaciones`. */
  totalNoLeidas: number;
  cargando: boolean;
  recargar: () => void;
}

/**
 * Últimas notificaciones para el panel desplegable de la campana de la
 * navbar: recorta la bandeja completa (`useNotificaciones`, ya ordenada por
 * `creadaEn` descendente) a las más recientes. El total de no leídas se toma
 * de `useContadorNoLeidas`, no del subconjunto visible.
 */
export function useNotificacionesNavbar(clienteApi: GebApiClient): EstadoNotificacionesNavbar {
  const consulta = useNotificaciones(clienteApi, {});
  const contador = useContadorNoLeidas(clienteApi);

  const notificaciones = useMemo(
    () => (consulta.datos ?? []).slice(0, MAXIMO_VISIBLES),
    [consulta.datos],
  );

  return {
    notificaciones,
    totalNoLeidas: contador.cantidad,
    cargando: consulta.cargando,
    recargar: () => {
      consulta.recargar();
      contador.recargar();
    },
  };
}
