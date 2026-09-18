import { useState, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';

/** Checklist fijo que ayuda al líder a mantener un criterio consistente entre informes. */
const PUNTOS_GUIA = [
  'Lea atentamente el perfil completo de cada persona candidata antes de decidir.',
  'Evalúe un máximo de 8 informes por sesión para mantener un criterio consistente.',
  'Base su decisión en habilidades y evaluaciones, no en la redacción del informe.',
  'Use el campo de comentarios para justificar su decisión ante el equipo de selección.',
];

/**
 * Botón "Guía de evaluación" que abre un popover con un checklist estático sobre
 * cómo evaluar cada informe incógnito. Sin datos externos: el contenido está
 * fijo en el frontend.
 */
export function GuiaEvaluacionInformes() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const abrir = (evento: MouseEvent<HTMLElement>) => setAnchorEl(evento.currentTarget);
  const cerrar = () => setAnchorEl(null);

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<HelpOutlineIcon />}
        onClick={abrir}
        sx={{ flexShrink: 0 }}
      >
        Guía de evaluación
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={cerrar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { maxWidth: '92vw', p: 2 } } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Cómo evaluar cada informe
        </Typography>
        <Box
          component="ul"
          sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}
        >
          {PUNTOS_GUIA.map((punto) => (
            <Typography key={punto} component="li" variant="body2">
              {punto}
            </Typography>
          ))}
        </Box>
      </Popover>
    </>
  );
}
