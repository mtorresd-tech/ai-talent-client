import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

export interface LayoutPasoPipelineProps {
  /** Columna angosta: lista de candidatos de la etapa (o placeholder). */
  izquierda: ReactNode;
  /** Columna ancha: detalle/resultado del candidato (o estado vacío). */
  derecha: ReactNode;
}

/**
 * Layout de dos columnas reutilizable por todos los pasos del pipeline: una
 * columna fija de 340 px y otra fluida, con separación de 20 px. Por debajo de
 * 900 px colapsa a una sola columna (la izquierda arriba).
 */
export function LayoutPasoPipeline({ izquierda, derecha }: LayoutPasoPipelineProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '340px 1fr' },
        gap: '20px',
        alignItems: 'start',
      }}
    >
      <Box sx={{ minWidth: 0 }}>{izquierda}</Box>
      <Box sx={{ minWidth: 0 }}>{derecha}</Box>
    </Box>
  );
}
