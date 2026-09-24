import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useAuth } from '@geb/auth';
import { EncabezadoPagina } from '../../../shared/components/EncabezadoPagina';
import { useClienteApi } from '../../../shared/api/clienteApi';
import { ROL_RECLUTADOR } from '../../../shared/tipos/dominio';
import { useNotificaciones } from '../hooks/useNotificaciones';
import { useMarcarNotificacionLeida } from '../hooks/useMarcarNotificacionLeida';
import { rutaNotificacion } from '../logica/rutaNotificacion';
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
 * hacer clic en un ítem depende del rol de quien la ve (`rutaNotificacion`),
 * no del tipo de la notificación.
 */
export function PaginaNotificaciones() {
  const clienteApi = useClienteApi();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esReclutador = usuario?.roles.includes(ROL_RECLUTADOR) ?? false;

  const [filtro, setFiltro] = useState<ValorFiltroLeidas>('todas');
  const [avisoError, setAvisoError] = useState<string | null>(null);

  const consulta = useNotificaciones(clienteApi, { leida: leidaDelFiltro(filtro) });
  const { notificaciones, marcarLeida } = useMarcarNotificacionLeida(clienteApi, consulta.datos);

  const alClicItem = useCallback(
    async (notificacion: Notificacion) => {
      setAvisoError(null);
      const ruta = rutaNotificacion(notificacion, esReclutador);

      if (!notificacion.leida) {
        try {
          await marcarLeida(notificacion.id);
        } catch {
          setAvisoError('No se pudo marcar la notificación como leída. Vuelve a intentarlo.');
          return;
        }
      }

      if (ruta) navigate(ruta);
    },
    [esReclutador, marcarLeida, navigate],
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
        notificaciones={consulta.datos ? notificaciones : null}
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
