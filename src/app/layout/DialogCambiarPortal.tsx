import { useState, type ComponentType } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import { GebStatusChip } from '@geb/ui';
import type { Portal } from '../../shared/tipos/dominio';

interface DialogCambiarPortalProps {
  abierto: boolean;
  portalActivo: Portal;
  onSeleccionar: (portal: Portal) => void;
  onCerrar: () => void;
}

const OPCIONES_PORTAL: {
  portal: Portal;
  etiqueta: string;
  descripcion: string;
  Icono: ComponentType<SvgIconProps>;
}[] = [
  {
    portal: 'RECLUTADOR',
    etiqueta: 'Portal Reclutador',
    descripcion: 'Gestiona el proceso de selección.',
    Icono: BadgeOutlinedIcon,
  },
  {
    portal: 'LIDER',
    etiqueta: 'Portal Líder',
    descripcion: 'Evalúa informes incógnitos y entrevistas.',
    Icono: SupervisorAccountOutlinedIcon,
  },
];

/** Diálogo para elegir entre "Portal Reclutador" y "Portal Líder"; requiere confirmación explícita, no cambia al primer clic. */
export function DialogCambiarPortal({
  abierto,
  portalActivo,
  onSeleccionar,
  onCerrar,
}: DialogCambiarPortalProps) {
  const [seleccionado, setSeleccionado] = useState<Portal>(portalActivo);

  // Arranca siempre mostrando el portal activo, no una elección sin
  // confirmar de una apertura anterior del diálogo — ajuste de estado
  // durante el render (no un efecto), disparado solo cuando `abierto` pasa
  // de `false` a `true`.
  const [abiertoPrevio, setAbiertoPrevio] = useState(abierto);
  if (abierto !== abiertoPrevio) {
    setAbiertoPrevio(abierto);
    if (abierto) {
      setSeleccionado(portalActivo);
    }
  }

  const confirmar = () => {
    onSeleccionar(seleccionado);
    onCerrar();
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="xs">
      <DialogTitle>Cambiar de rol</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Elige con qué portal quieres trabajar.
        </Typography>
        {/* Mismo criterio visual que GebModeToggle (@geb/ui): grupo con un
            solo borde de 1px, radio 8px y overflow oculto, en vez de un
            borde propio por opción. */}
        <ToggleButtonGroup
          exclusive
          orientation="vertical"
          value={seleccionado}
          onChange={(_evento, siguiente: Portal | null) => {
            if (siguiente) setSeleccionado(siguiente);
          }}
          sx={{
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            '& .MuiToggleButtonGroup-grouped': {
              border: 0,
              borderRadius: 0,
              margin: 0,
              width: '100%',
            },
          }}
        >
          {OPCIONES_PORTAL.map(({ portal, etiqueta, descripcion, Icono }) => (
            <ToggleButton
              key={portal}
              value={portal}
              aria-label={etiqueta}
              disableRipple
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                gap: 1.5,
                px: 1.5,
                py: 1.25,
                color: 'text.primary',
                '&:not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'divider' },
                '&.Mui-selected': {
                  bgcolor: (tema) => alpha(tema.palette.primary.main, 0.08),
                  '&:hover': { bgcolor: (tema) => alpha(tema.palette.primary.main, 0.08) },
                },
              }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (tema) => alpha(tema.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <Icono fontSize="small" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {etiqueta}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {descripcion}
                </Typography>
              </Box>
              {portalActivo === portal && (
                <GebStatusChip
                  estado="neutral"
                  size="small"
                  label="Actual"
                  sx={{ flexShrink: 0 }}
                />
              )}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar}>Cancelar</Button>
        <Button variant="contained" onClick={confirmar} disabled={seleccionado === portalActivo}>
          Cambiar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
