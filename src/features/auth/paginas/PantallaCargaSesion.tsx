import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { PanelHeroLogin } from '../components/PanelHeroLogin';
import { EncabezadoCompactoLogin } from '../components/EncabezadoCompactoLogin';

/**
 * Pantalla mostrada mientras se resuelve el estado de la sesión: durante la
 * inicialización de `GebAuthProvider` y mientras se resuelve el redirect de
 * vuelta de Microsoft Entra ID. Reutiliza el mismo shell de dos columnas que
 * `PaginaInicioSesion` para mantener la estética de marca en toda transición.
 */
export function PantallaCargaSesion() {
  return (
    <Stack direction="row" sx={{ minHeight: '100vh' }}>
      <PanelHeroLogin />
      <Box
        sx={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper',
          padding: { xs: 3, md: '48px' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <EncabezadoCompactoLogin />
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ color: 'text.secondary' }}>Cargando tu sesión…</Typography>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
