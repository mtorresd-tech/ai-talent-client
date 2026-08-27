import { Button, Stack, Typography } from '@mui/material';
import { useAuth } from '@geb/auth';

/**
 * TODO: pantalla de login real (ver mockup en contexto de diseño) — @geb/ui
 * no tiene un componente de login predefinido, así que se construye con MUI
 * directo (ver skill geb-lib).
 */
export function PaginaInicioSesion() {
  const { estado, login } = useAuth();

  return (
    <Stack spacing={2} sx={{ maxWidth: 360, margin: '10% auto', textAlign: 'center' }}>
      <Typography variant="h4">IA Talento</Typography>
      <Typography color="text.secondary">
        Inteligencia artificial al servicio del talento — Grupo Energía Bogotá.
      </Typography>
      <Button
        variant="contained"
        size="large"
        disabled={estado === 'cargando'}
        onClick={() => void login()}
      >
        Iniciar sesión con Microsoft Entra ID
      </Button>
      {estado === 'error' && (
        <Typography color="error" role="alert">
          No se pudo iniciar sesión. Intenta de nuevo.
        </Typography>
      )}
    </Stack>
  );
}
