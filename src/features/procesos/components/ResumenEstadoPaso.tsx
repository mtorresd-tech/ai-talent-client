import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatearFecha } from '../logica/formatoFecha';

export interface ResumenEstadoPasoProps {
  titulo: string;
  descripcion: string;
  estadoDesde: string | null;
}

/**
 * Bloque común de los paneles de seguimiento de un paso: título y descripción
 * en lenguaje claro del estado actual, más "En este estado desde <fecha>".
 */
export function ResumenEstadoPaso({ titulo, descripcion, estadoDesde }: ResumenEstadoPasoProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {titulo}
      </Typography>
      {descripcion && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {descripcion}
        </Typography>
      )}
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
        En este estado desde {formatearFecha(estadoDesde)}
      </Typography>
    </Box>
  );
}
