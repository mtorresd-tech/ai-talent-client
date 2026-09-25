import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { listarNotificaciones, type Notificacion } from '../api/notificaciones';
import { usePeticion, type EstadoPeticion } from '../../procesos/hooks/usePeticion';

export interface ParametrosNotificaciones {
  /** `undefined` trae "Todas"; el backend no garantiza orden, se ordena aquí. */
  leida?: boolean;
}

/** Bandeja de notificaciones (`GET /notificaciones`), ordenada por `creadaEn` descendente. */
export function useNotificaciones(
  clienteApi: GebApiClient,
  { leida }: ParametrosNotificaciones,
): EstadoPeticion<Notificacion[]> {
  const ejecutor = useCallback(
    async (signal: AbortSignal) => {
      const respuesta = await listarNotificaciones(clienteApi, { leida }, { signal });
      return [...respuesta].sort(
        (a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime(),
      );
    },
    [clienteApi, leida],
  );

  return usePeticion(ejecutor, [ejecutor]);
}
