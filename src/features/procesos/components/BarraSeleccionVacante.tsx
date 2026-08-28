import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

export interface BarraSeleccionVacanteProps {
  /** Nombre de la vacante activa, o `null` si todavía no se seleccionó una. */
  nombreVacante: string | null;
}

/**
 * Toolbar sobre el área de trabajo: muestra la vacante activa y un botón
 * "Filtrar" deshabilitado. La búsqueda por texto funciona desde el buscador de
 * la tabla.
 */
export function BarraSeleccionVacante({ nombreVacante }: BarraSeleccionVacanteProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        py: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        noWrap
        sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}
        title={nombreVacante ?? undefined}
      >
        {nombreVacante ?? 'Selecciona una vacante'}
      </Typography>
      <Tooltip title="Disponible próximamente">
        <span>
          <Button variant="outlined" size="small" disabled>
            Filtrar
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}
