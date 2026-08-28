import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PhoneIcon from '@mui/icons-material/PhoneInTalk';
import ClearIcon from '@mui/icons-material/Clear';

export interface BarraAccionPrefiltroProps {
  cantidadSeleccionados: number;
  onAbrirConfirmacion: () => void;
  onLimpiar: () => void;
}

/**
 * Barra que aparece cuando hay candidatos marcados en la etapa de ranking:
 * muestra el conteo y el botón "Prefiltro telefónico" que abre el modal de
 * confirmación. Textos compactos para no restar espacio a la lista.
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
        flexWrap: 'wrap',
        gap: 1,
        px: 1.5,
        py: 0.75,
        mb: 1,
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Typography sx={{ fontSize: '0.625rem', fontWeight: 700 }}>
        {cantidadSeleccionados} seleccionado{cantidadSeleccionados === 1 ? '' : 's'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Button
          size="small"
          color="inherit"
          startIcon={<ClearIcon />}
          onClick={onLimpiar}
          sx={{ fontSize: '0.625rem', py: 0.25, '& .MuiSvgIcon-root': { fontSize: 13 } }}
        >
          Limpiar
        </Button>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          startIcon={<PhoneIcon />}
          onClick={onAbrirConfirmacion}
          sx={{ fontSize: '0.625rem', py: 0.25, '& .MuiSvgIcon-root': { fontSize: 13 } }}
        >
          Prefiltro telefónico
        </Button>
      </Box>
    </Box>
  );
}
