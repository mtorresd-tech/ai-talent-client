import type { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import { PanelHeroLogin, GRADIENTE_MARCA_LOGIN } from './PanelHeroLogin';
import { EncabezadoCompactoLogin } from './EncabezadoCompactoLogin';

interface LayoutAutenticacionProps {
  children: ReactNode;
}

/**
 * Shell de dos columnas compartido por las pantallas de autenticación:
 * `PanelHeroLogin` a la izquierda (visible desde `md`) y, a la derecha,
 * `EncabezadoCompactoLogin` seguido del contenido variable de cada pantalla
 * (formulario de acceso o indicador de carga). En mobile, donde
 * `PanelHeroLogin` queda oculto, el panel derecho toma el mismo gradiente de
 * marca como fondo — de lo contrario, el encabezado compacto y el formulario
 * quedan centrados sobre una pantalla plana que se ve vacía.
 */
export function LayoutAutenticacion({ children }: LayoutAutenticacionProps) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} className="altura-viewport-segura">
      <PanelHeroLogin />
      <Box
        sx={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper',
          backgroundImage: { xs: GRADIENTE_MARCA_LOGIN, md: 'none' },
          padding: { xs: 3, md: '48px' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <EncabezadoCompactoLogin />
          {children}
        </Box>
      </Box>
    </Stack>
  );
}
