import { CircularProgress, Stack, Typography } from '@mui/material';
import { LayoutAutenticacion } from '../components/LayoutAutenticacion';

/**
 * Pantalla mostrada mientras se resuelve el estado de la sesión: durante la
 * inicialización de `GebAuthProvider` y mientras se resuelve el redirect de
 * vuelta de Microsoft Entra ID. Reutiliza el mismo shell de dos columnas que
 * `PaginaInicioSesion` para mantener la estética de marca en toda transición.
 */
export function PantallaCargaSesion() {
  return (
    <LayoutAutenticacion>
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ color: 'text.secondary' }}>Cargando tu sesión…</Typography>
      </Stack>
    </LayoutAutenticacion>
  );
}
