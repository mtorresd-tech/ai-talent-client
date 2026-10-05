import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import type { EstadoSesion } from '@geb/auth';

interface FormularioAccesoRealProps {
  estado: EstadoSesion;
  onIniciarSesion: () => void;
}

/** Formulario de acceso en modo real, con login vía Microsoft Entra ID (`@geb/auth`). */
export function FormularioAccesoReal({ estado, onIniciarSesion }: FormularioAccesoRealProps) {
  const cargando = estado === 'cargando';

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
      <Box>
        <Typography
          component="h2"
          sx={{ color: 'text.primary', fontSize: '34px', lineHeight: '42px', fontWeight: 700 }}
        >
          Bienvenido a{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            Selecta 2.0
          </Box>
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Inicia sesión para continuar
        </Typography>
      </Box>
      <Button
        variant="contained"
        disabled={cargando}
        startIcon={cargando ? <CircularProgress size={20} color="inherit" /> : undefined}
        onClick={onIniciarSesion}
        sx={{
          px: '18px',
          py: '11px',
          fontSize: '14px',
          fontWeight: 600,
          borderRadius: '8px',
          bgcolor: '#0b1a33',
          '&:hover': { bgcolor: '#152a52' },
        }}
      >
        Iniciar sesión con Microsoft Entra ID
      </Button>
      {estado === 'error' && (
        <Typography color="error" role="alert">
          No se pudo iniciar sesión. Intenta de nuevo.
        </Typography>
      )}
      <Typography sx={{ color: 'text.secondary', fontSize: '12.5px' }}>
        ¿No tienes acceso? Contacta al administrador de tu empresa.
      </Typography>
    </Stack>
  );
}
