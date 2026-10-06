import { Stack, Typography } from '@mui/material';
import { GebLogo } from '@geb/ui';

/** Encabezado de marca compacto, visible solo en mobile (`< md`) sobre el formulario. */
export function EncabezadoCompactoLogin() {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ display: { xs: 'flex', md: 'none' }, mb: 3, alignItems: 'center' }}
    >
      <GebLogo src="/logo_geb.png" width={105} height={50} fondoClaro alt="GEB" />
      <Typography variant="h6">Selecta 2.0</Typography>
    </Stack>
  );
}
