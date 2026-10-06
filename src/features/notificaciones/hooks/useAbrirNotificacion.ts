import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GebApiClient } from '@geb/api-client';
import { marcarNotificacionLeida, type Notificacion } from '../api/notificaciones';
import { rutaNotificacion } from '../logica/rutaNotificacion';

/**
 * Marca una notificación como leída (si no lo estaba) y navega a su ruta de
 * destino según el rol de quien la ve (`rutaNotificacion`). Compartido entre
 * `PaginaNotificaciones` y la campana de la navbar para no duplicar la
 * secuencia marcar-y-redirigir. Cada consumidor sigue siendo responsable de
 * recargar sus propios datos (contador, lista) después de un `abrir` exitoso.
 */
export function useAbrirNotificacion(clienteApi: GebApiClient, esReclutador: boolean) {
  const navigate = useNavigate();

  const abrir = useCallback(
    async (notificacion: Notificacion): Promise<boolean> => {
      if (!notificacion.leida) {
        await marcarNotificacionLeida(clienteApi, notificacion.id);
      }

      const ruta = rutaNotificacion(notificacion, esReclutador);
      if (ruta) navigate(ruta);
      return true;
    },
    [clienteApi, esReclutador, navigate],
  );

  return { abrir };
}
