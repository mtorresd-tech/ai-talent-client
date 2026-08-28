import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { ApiError } from '@geb/api-client';
import type { VacanteDetalle } from '../api/vacantes';
import { formatearFecha } from '../logica/formatoFecha';
import { etiquetaEstadoVacante } from '../logica/resumenEtapaVacante';
import { EstadoError } from './EstadoError';

export interface TarjetaDetalleVacanteProps {
  detalle: VacanteDetalle | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
        {etiqueta}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {valor}
      </Typography>
    </Box>
  );
}

/**
 * Card oscura on-brand con el detalle de la vacante seleccionada. Los nulos se
 * muestran como "Sin definir" / "No disponible".
 */
export function TarjetaDetalleVacante({
  detalle,
  cargando,
  error,
  onReintentar,
}: TarjetaDetalleVacanteProps) {
  const contenido = () => {
    if (error) {
      return <EstadoError error={error} onReintentar={onReintentar} />;
    }
    if (cargando && !detalle) {
      return (
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Cargando detalle de la vacante…
        </Typography>
      );
    }
    if (!detalle) return null;

    const areaCiudad = [detalle.area, detalle.ciudad].filter(Boolean).join(' · ') || 'Sin definir';

    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
          >
            {detalle.titulo}
          </Typography>
          <Chip
            size="small"
            label={etiquetaEstadoVacante(detalle.cerrada)}
            sx={{ bgcolor: 'rgba(153,207,22,0.18)', color: '#d7f08a', fontWeight: 600 }}
          />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <Campo etiqueta="Área · ciudad" valor={areaCiudad} />
          <Campo etiqueta="Candidatos en proceso" valor={String(detalle.totalCandidatos)} />
          <Campo etiqueta="Fecha de apertura" valor={formatearFecha(detalle.fechaPublicacion)} />
          <Campo etiqueta="Fecha estimada de cierre" valor={formatearFecha(detalle.fechaCierre)} />
          <Campo
            etiqueta="Reclutador a cargo"
            valor={detalle.reclutador?.nombre ?? 'No disponible'}
          />
        </Box>
      </>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        p: { xs: 2, sm: 3 },
        color: '#fff',
        background: 'linear-gradient(135deg, #0b1a33, #16305c)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: '50%',
          bgcolor: 'rgba(153,207,22,0.1)',
        }}
      />
      <Box sx={{ position: 'relative' }}>{contenido()}</Box>
    </Box>
  );
}
