import { Box, Button, Stack } from '@mui/material';
import { GebErrorState } from '@geb/ui';
import { useAuth } from '@geb/auth';
import { useSesionApi } from '../../../shared/auth/SesionApiContext';

/**
 * Pantalla mostrada a una persona autenticada en Entra ID cuya cuenta no
 * tiene el rol de Reclutador ni de Líder de área asignado en IA Talento —
 * ya sea porque nunca lo tuvo, o porque una petición a la API respondió 403
 * durante una sesión ya iniciada. Bloquea el acceso a `AppLayout` y a toda
 * ruta de la aplicación.
 */
export function PaginaSinAcceso() {
  const { logout } = useAuth();
  const { limpiarSesionSinRol } = useSesionApi();

  const cerrarSesion = () => {
    limpiarSesionSinRol();
    void logout();
  };

  return (
    <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <GebErrorState
          titulo="Tu cuenta no tiene acceso a IA Talento"
          descripcion="No tienes un rol asignado en la aplicación. Contacta al administrador de tu empresa para que te asigne el rol de Reclutador o Líder de área."
        />
        <Stack sx={{ alignItems: 'center' }}>
          <Button variant="outlined" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
