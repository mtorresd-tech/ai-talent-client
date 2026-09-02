import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export interface LayoutPasoPipelineProps {
  /** Columna angosta: lista de candidatos de la etapa (o placeholder). */
  izquierda: ReactNode;
  /** Columna ancha: detalle/resultado del candidato (o estado vacío). */
  derecha: ReactNode;
  /**
   * Solo se usa por debajo de 900 px (`md`), donde el layout muestra una vista a
   * la vez: `true` muestra el slot `derecha` (detalle); `false` (por defecto)
   * muestra el slot `izquierda` (lista). En `>= md` se ignora y conviven las dos
   * columnas.
   */
  haySeleccion?: boolean;
  /**
   * Callback del botón "Volver a la lista", visible sobre el slot `derecha` por
   * debajo de 900 px. Si no se pasa, no se renderiza la barra de volver.
   */
  onVolver?: () => void;
}

/**
 * Layout de dos columnas reutilizable por todos los pasos del pipeline: una
 * columna fija de 340 px y otra fluida, con separación de 20 px. Por debajo de
 * 900 px aplica un patrón master–detail: se muestra la lista y, al haber una
 * selección, su detalle precedido por un botón "Volver a la lista".
 */
export function LayoutPasoPipeline({
  izquierda,
  derecha,
  haySeleccion = false,
  onVolver,
}: LayoutPasoPipelineProps) {
  const tema = useTheme();
  const unaColumna = useMediaQuery(tema.breakpoints.down('md'));

  if (unaColumna) {
    if (!haySeleccion) {
      return <Box sx={{ minWidth: 0 }}>{izquierda}</Box>;
    }
    return (
      <Box sx={{ minWidth: 0 }}>
        {onVolver && (
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onVolver} sx={{ mb: 1.5 }}>
            Volver a la lista
          </Button>
        )}
        {derecha}
      </Box>
    );
  }

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
