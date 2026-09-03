import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { EtapaPipeline } from '../api/vacantes';

export interface EmbudoProcesoProps {
  etapas: EtapaPipeline[] | null;
  /** `EtapaPipeline.clave` de la etapa de origen (query param `?paso`). */
  claveEtapaOrigen: string | null;
}

/**
 * Embudo de contexto: las etapas del pipeline de la vacante ordenadas por
 * `orden`, con la etapa de origen resaltada, las anteriores marcadas como
 * recorridas y las siguientes como pendientes. Se oculta si no hay pipeline o
 * no se conoce la etapa de origen.
 */
export function EmbudoProceso({ etapas, claveEtapaOrigen }: EmbudoProcesoProps) {
  const ordenadas = useMemo(
    () => (etapas ? [...etapas].sort((a, b) => a.orden - b.orden) : []),
    [etapas],
  );

  const ordenOrigen = ordenadas.find((etapa) => etapa.clave === claveEtapaOrigen)?.orden ?? null;

  if (ordenadas.length === 0 || !claveEtapaOrigen || ordenOrigen === null) {
    return null;
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Avance en el proceso
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 1, minWidth: 'min-content' }}>
          {ordenadas.map((etapa) => {
            const esOrigen = etapa.orden === ordenOrigen;
            const recorrida = etapa.orden < ordenOrigen;
            return (
              <Box
                key={etapa.clave}
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: esOrigen ? 'primary.main' : 'divider',
                  bgcolor: esOrigen ? 'primary.main' : recorrida ? 'action.hover' : 'transparent',
                  color: esOrigen ? 'primary.contrastText' : 'text.primary',
                  opacity: !esOrigen && !recorrida ? 0.6 : 1,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                  {etapa.nombre}
                </Typography>
                <Typography variant="caption">{etapa.total} en etapa</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
