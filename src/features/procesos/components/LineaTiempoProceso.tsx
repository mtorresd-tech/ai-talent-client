import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { GebEmptyState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import type { EstadoCatalogo } from '../api/catalogos';
import type { EventoHistorial } from '../api/candidatos';
import { colorPorCategoria } from '../logica/etiquetasEstado';
import { formatearFechaHora } from '../logica/formatoFecha';
import { construirLineaTiempo, type HitoProceso } from '../logica/lineaTiempoProceso';
import { EstadoError } from './EstadoError';

export interface LineaTiempoProcesoProps {
  historial: EventoHistorial[] | null;
  catalogo: EstadoCatalogo[] | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
}

function colorPunto(hito: HitoProceso): string {
  const color = colorPorCategoria(hito.categoria);
  return color === 'default' ? 'grey.400' : `${color}.main`;
}

/**
 * Línea de tiempo vertical del avance del proceso, construida a partir del
 * historial del candidato y las etiquetas del catálogo de estados. Muestra un
 * vacío informativo si no hay eventos y un error aislado con reintento si la
 * carga del historial falló.
 */
export function LineaTiempoProceso({
  historial,
  catalogo,
  cargando,
  error,
  onReintentar,
}: LineaTiempoProcesoProps) {
  const hitos = useMemo(() => construirLineaTiempo(historial, catalogo), [historial, catalogo]);

  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (cargando && hitos.length === 0) {
    return <Skeleton variant="rounded" height={220} />;
  }

  if (hitos.length === 0) {
    return (
      <GebEmptyState
        titulo="Sin eventos"
        descripcion="Todavía no hay eventos registrados en el proceso de este candidato."
      />
    );
  }

  return (
    <Box sx={{ overflowX: 'auto', minWidth: 0 }}>
      <Box sx={{ minWidth: 240 }}>
        {hitos.map((hito, indice) => {
          const atenuado = hito.tipoEvento === 'NOTIFICACION' || hito.tipoEvento === 'ERROR';
          return (
            <Box
              key={`${hito.fechaIso}-${indice}`}
              sx={{ display: 'flex', gap: 1.5, opacity: atenuado ? 0.6 : 1 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: colorPunto(hito),
                    border: hito.estadoVisual === 'actual' ? '3px solid' : 'none',
                    borderColor: 'background.paper',
                    boxShadow: hito.estadoVisual === 'actual' ? 2 : 0,
                    mt: 0.5,
                  }}
                />
                {indice < hitos.length - 1 && (
                  <Box sx={{ width: '2px', flex: 1, bgcolor: 'divider', minHeight: 24 }} />
                )}
              </Box>
              <Box sx={{ pb: 2, minWidth: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {hito.titulo}
                  </Typography>
                  {hito.estadoVisual === 'actual' && (
                    <Typography variant="caption" sx={{ color: 'primary.main' }}>
                      Actual
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {formatearFechaHora(hito.fechaIso)}
                </Typography>
                {hito.descripcion && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                    {hito.descripcion}
                  </Typography>
                )}
                {hito.actorTexto && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                    {hito.actorTexto}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
