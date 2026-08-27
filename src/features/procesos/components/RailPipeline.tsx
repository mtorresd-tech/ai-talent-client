import { useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { ApiError } from '@geb/api-client';
import type { EtapaPipeline } from '../api/vacantes';
import { EstadoError } from './EstadoError';

export interface RailPipelineProps {
  pipeline: EtapaPipeline[] | null;
  cargando: boolean;
  error: ApiError | null;
  etapaActivaClave: string | null;
  onSeleccionarEtapa: (etapa: EtapaPipeline) => void;
  onReintentar: () => void;
}

const DESPLAZAMIENTO_PX = 240;

/**
 * Rail horizontal del pipeline dinámico: una ficha por etapa (ordenadas por
 * `orden`), navegable con flechas que se deshabilitan en los extremos. La
 * etapa activa se resalta. Cambiar de etapa no cambia de ruta.
 */
export function RailPipeline({
  pipeline,
  cargando,
  error,
  etapaActivaClave,
  onSeleccionarEtapa,
  onReintentar,
}: RailPipelineProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);

  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (cargando && !pipeline) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
        Cargando pipeline…
      </Typography>
    );
  }

  const etapas = [...(pipeline ?? [])].sort((a, b) => a.orden - b.orden);
  if (etapas.length === 0) return null;

  const indiceActivo = etapas.findIndex((etapa) => etapa.clave === etapaActivaClave);
  const enPrimera = indiceActivo <= 0;
  const enUltima = indiceActivo === -1 || indiceActivo >= etapas.length - 1;

  const desplazar = (direccion: -1 | 1) => {
    contenedorRef.current?.scrollBy?.({
      left: direccion * DESPLAZAMIENTO_PX,
      behavior: 'smooth',
    });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        aria-label="Etapa anterior"
        size="small"
        disabled={enPrimera}
        onClick={() => desplazar(-1)}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Box
        ref={contenedorRef}
        sx={{
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          flex: 1,
          py: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {etapas.map((etapa) => {
          const activa = etapa.clave === etapaActivaClave;
          return (
            <Box
              key={etapa.clave}
              component="button"
              type="button"
              aria-pressed={activa}
              onClick={() => onSeleccionarEtapa(etapa)}
              sx={{
                flexShrink: 0,
                minWidth: 150,
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 2,
                border: '1px solid',
                borderColor: activa ? 'primary.main' : 'divider',
                bgcolor: activa ? 'primary.main' : 'background.paper',
                color: activa ? 'primary.contrastText' : 'text.primary',
                px: 1.5,
                py: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {etapa.nombre}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {etapa.total} candidato{etapa.total === 1 ? '' : 's'}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <IconButton
        aria-label="Etapa siguiente"
        size="small"
        disabled={enUltima}
        onClick={() => desplazar(1)}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}
