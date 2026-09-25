import { useCallback, useState } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { marcarNotificacionLeida, type Notificacion } from '../api/notificaciones';

export interface EstadoNotificacionesLeidas {
  notificaciones: Notificacion[];
  /** Marca la notificación como leída de forma optimista; revierte si el `POST` falla. */
  marcarLeida: (notificacionId: string) => Promise<void>;
}

/**
 * Aplica sobre `notificacionesBase` marcas de "leída" optimistas por id, para
 * no esperar la respuesta del backend, y revertir la marca si el `POST`
 * falla. Las marcas se reinician cuando llega una `notificacionesBase` nueva
 * (recarga de la bandeja o cambio de filtro).
 */
export function useMarcarNotificacionLeida(
  clienteApi: GebApiClient,
  notificacionesBase: Notificacion[] | null,
): EstadoNotificacionesLeidas {
  const [baseAnterior, setBaseAnterior] = useState(notificacionesBase);
  const [marcasLeida, setMarcasLeida] = useState<Record<string, boolean>>({});

  if (notificacionesBase !== baseAnterior) {
    setBaseAnterior(notificacionesBase);
    setMarcasLeida({});
  }

  const notificaciones = (notificacionesBase ?? []).map((notificacion) =>
    notificacion.id in marcasLeida
      ? { ...notificacion, leida: marcasLeida[notificacion.id] }
      : notificacion,
  );

  const marcarLeida = useCallback(
    async (notificacionId: string) => {
      setMarcasLeida((actuales) => ({ ...actuales, [notificacionId]: true }));
      try {
        await marcarNotificacionLeida(clienteApi, notificacionId);
      } catch (problema) {
        setMarcasLeida((actuales) => ({ ...actuales, [notificacionId]: false }));
        throw problema;
      }
    },
    [clienteApi],
  );

  return { notificaciones, marcarLeida };
}
