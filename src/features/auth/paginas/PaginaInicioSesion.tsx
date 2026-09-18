import { Box, Stack } from '@mui/material';
import { useAuth } from '@geb/auth';
import { useDevAuth } from '../../../shared/auth/DevAuthContext';
import { PanelHeroLogin } from '../components/PanelHeroLogin';
import { EncabezadoCompactoLogin } from '../components/EncabezadoCompactoLogin';
import { FormularioAccesoReal } from '../components/FormularioAccesoReal';
import { FormularioAccesoDesarrollo } from '../components/FormularioAccesoDesarrollo';

export function PaginaInicioSesion() {
  const { estado, login } = useAuth();
  const devAuth = useDevAuth();

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
          {devAuth ? (
            <FormularioAccesoDesarrollo />
          ) : (
            <FormularioAccesoReal estado={estado} onIniciarSesion={() => void login()} />
          )}
        </Box>
      </Box>
    </Stack>
  );
}
