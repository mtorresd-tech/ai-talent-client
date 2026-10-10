import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

export interface RecuadroMatrizProps {
  children: ReactNode;
  /** Si se indica, el recuadro se expone como región con este nombre accesible. */
  etiqueta?: string;
}

/**
 * Recuadro con borde gris que agrupa la información que acompaña a la matriz
 * de selección: los avisos de arriba y la barra del candidato de abajo.
 */
export function RecuadroMatriz({ children, etiqueta }: RecuadroMatrizProps) {
  return (
    <Box
      role={etiqueta ? 'region' : undefined}
      aria-label={etiqueta}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        px: { xs: 2, sm: 2.5 },
        py: 1.5,
        minWidth: 0,
      }}
    >
      {children}
    </Box>
  );
}
