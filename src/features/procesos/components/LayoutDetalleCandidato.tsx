import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

export interface LayoutDetalleCandidatoProps {
  izquierda: ReactNode;
  derecha: ReactNode;
}

/**
 * Grid de dos columnas del detalle del candidato (`300px 1fr` en escritorio).
 * Colapsa a una sola columna por debajo de `md` (900 px), primero la izquierda.
 */
export function LayoutDetalleCandidato({ izquierda, derecha }: LayoutDetalleCandidatoProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
        gap: '20px',
        alignItems: 'start',
        minWidth: 0,
      }}
    >
      <Box sx={{ minWidth: 0 }}>{izquierda}</Box>
      <Box sx={{ minWidth: 0 }}>{derecha}</Box>
    </Box>
  );
}
