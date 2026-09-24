import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { listarNotificaciones } from '../api/notificaciones';
import { usePeticion } from '../../procesos/hooks/usePeticion';

export interface ContadorNoLeidas {
  cantidad: number;
  recargar: () => void;
}

/**
 * Cantidad de notificaciones sin leer, para el badge de la campana de la
 * navbar. Un fallo de red se traduce en `0` (badge apagado) en vez de
 * propagar el error — no bloquea el resto de la navegación.
 */
export function useContadorNoLeidas(clienteApi: GebApiClient): ContadorNoLeidas {
  const ejecutor = useCallback(
    (signal: AbortSignal) => listarNotificaciones(clienteApi, { leida: false }, { signal }),
    [clienteApi],
  );

  const { datos, recargar } = usePeticion(ejecutor, [ejecutor]);

  return { cantidad: datos?.length ?? 0, recargar };
}
