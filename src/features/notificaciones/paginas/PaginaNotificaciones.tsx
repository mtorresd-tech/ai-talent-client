import { useCallback, useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { EncabezadoPagina } from '../../../shared/components/EncabezadoPagina';
import { useClienteApi } from '../../../shared/api/clienteApi';
import { usePortalActivo } from '../../../shared/auth/PortalActivoContext';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useAbrirNotificacion } from '../hooks/useAbrirNotificacion';
import type { Notificacion } from '../api/notificaciones';
import { FiltroLeidas, type ValorFiltroLeidas } from '../componentes/FiltroLeidas';
import { ListaNotificaciones } from '../componentes/ListaNotificaciones';

function leidaDelFiltro(filtro: ValorFiltroLeidas): boolean | undefined {
  if (filtro === 'no-leidas') return false;
  if (filtro === 'leidas') return true;
  return undefined;
}

/**
 * Bandeja de notificaciones, visible en ambos portales. La navegación al
 * hacer clic en un ítem depende del rol de quien la ve y del tipo de la
 * notificación (`useAbrirNotificacion`).
 */
export function PaginaNotificaciones() {
  const clienteApi = useClienteApi();
  const { portalActivo } = usePortalActivo();
  const esReclutador = portalActivo === 'RECLUTADOR';

  const [filtro, setFiltro] = useState<ValorFiltroLeidas>('todas');
  const [avisoError, setAvisoError] = useState<string | null>(null);

  const consulta = useNotificaciones(clienteApi, { leida: leidaDelFiltro(filtro) });
  const { abrir } = useAbrirNotificacion(clienteApi, esReclutador);

  const alClicItem = useCallback(
    async (notificacion: Notificacion) => {
      setAvisoError(null);
      try {
        await abrir(notificacion);
        consulta.recargar();
      } catch {
        setAvisoError('No se pudo marcar la notificación como leída. Vuelve a intentarlo.');
      }
    },
    [abrir, consulta],
  );

  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0, contain: 'inline-size' }}>
      <EncabezadoPagina
        titulo="Notificaciones"
        subtitulo="Mantente al tanto de las novedades de tus procesos de selección."
      />

      <FiltroLeidas valor={filtro} onCambio={setFiltro} />

      {avisoError && (
        <Alert severity="error" onClose={() => setAvisoError(null)}>
          {avisoError}
        </Alert>
      )}

      <ListaNotificaciones
        notificaciones={consulta.datos}
        cargando={consulta.cargando}
        error={consulta.error}
        onReintentar={consulta.recargar}
        esReclutador={esReclutador}
        filtro={filtro}
        onClicItem={alClicItem}
      />
    </Stack>
  );
}
