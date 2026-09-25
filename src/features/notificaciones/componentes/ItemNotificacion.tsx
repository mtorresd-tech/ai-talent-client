import type { KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { formatearFechaHora } from '../../../shared/logica/formatoFecha';
import type { Notificacion } from '../api/notificaciones';

export interface ItemNotificacionProps {
  notificacion: Notificacion;
  /** `true` cuando la notificación tiene un destino al que navegar para este usuario. */
  esReclutable: boolean;
  onClic: () => void;
}

/**
 * Fila de la bandeja de notificaciones: punto de acento si no está leída,
 * mensaje y fecha/hora, con ícono de flecha solo cuando la notificación
 * navega para el usuario actual. Toda la fila es clicable y accesible por
 * teclado.
 */
export function ItemNotificacion({ notificacion, esReclutable, onClic }: ItemNotificacionProps) {
  const manejarTecla = (evento: KeyboardEvent<HTMLDivElement>) => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      onClic();
    }
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClic}
      onKeyDown={manejarTecla}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        px: 1,
        cursor: esReclutable ? 'pointer' : 'default',
        borderBottom: 1,
        borderColor: 'divider',
        '&:hover': esReclutable ? { bgcolor: 'action.hover' } : undefined,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          visibility: notificacion.leida ? 'hidden' : 'visible',
          flexShrink: 0,
        }}
      />
      <Stack spacing={0.25} sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: notificacion.leida ? 400 : 600, overflowWrap: 'anywhere' }}
        >
          {notificacion.mensaje}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formatearFechaHora(notificacion.creadaEn)}
        </Typography>
      </Stack>
      {esReclutable && (
        <ChevronRightIcon
          aria-hidden
          fontSize="small"
          sx={{ color: 'text.secondary', flexShrink: 0 }}
        />
      )}
    </Box>
  );
}
