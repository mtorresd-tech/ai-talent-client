import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { GebStatCard } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import type { ResumenMetricas } from '../api/metricas';
import { EstadoError } from '../../procesos/components/EstadoError';

export interface PanelResumenProps {
  datos: ResumenMetricas | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;
}

/** Tres indicadores agregados del rango elegido: requisiciones, candidatos activos y tasa de cierre. */
export function PanelResumen({ datos, cargando, error, onReintentar }: PanelResumenProps) {
  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (cargando && !datos) {
    return <Skeleton variant="rounded" height={110} />;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      <GebStatCard etiqueta="Requisiciones gestionadas" valor={datos?.totalRequisiciones ?? 0} />
      <GebStatCard etiqueta="Candidatos activos" valor={datos?.candidatosActivos ?? 0} />
      <GebStatCard etiqueta="Tasa de cierre" valor={datos ? `${datos.tasaCierre}%` : '0%'} />
    </Box>
  );
}
