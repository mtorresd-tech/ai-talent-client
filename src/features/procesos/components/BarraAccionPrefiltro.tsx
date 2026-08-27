import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export interface BarraAccionPrefiltroProps {
  cantidadSeleccionados: number;
  onAbrirConfirmacion: () => void;
  onLimpiar: () => void;
}

/**
 * Barra que aparece cuando hay candidatos marcados en la etapa de ranking:
 * muestra el conteo y el botón "Prefiltro telefónico" que abre el modal de
 * confirmación.
 */
export function BarraAccionPrefiltro({
  cantidadSeleccionados,
  onAbrirConfirmacion,
  onLimpiar,
}: BarraAccionPrefiltroProps) {
  if (cantidadSeleccionados === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 1.5,
        mb: 1,
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {cantidadSeleccionados} seleccionado{cantidadSeleccionados === 1 ? '' : 's'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size="small" color="inherit" onClick={onLimpiar}>
          Limpiar
        </Button>
        <Button size="small" variant="contained" color="secondary" onClick={onAbrirConfirmacion}>
          Prefiltro telefónico
        </Button>
      </Box>
    </Box>
  );
}
