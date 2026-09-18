import { useState } from 'react';
import { Alert, Box, Button, FormLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { useDevAuth } from '../../../shared/auth/DevAuthContext';
import { ROL_LIDER, ROL_RECLUTADOR } from '../../../shared/tipos/dominio';

/** Formulario de acceso en modo desarrollo, sin app registration de Entra ID configurado. */
export function FormularioAccesoDesarrollo() {
  const devAuth = useDevAuth();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  // Login de desarrollo: se elige con qué rol entrar (uno solo, no varios a la
  // vez — con ambos, el dispatch de "Procesos" siempre abría la pantalla del
  // líder y nunca la del reclutador).
  const [rol, setRol] = useState<string>(ROL_RECLUTADOR);
  const esLider = rol === ROL_LIDER;

  if (!devAuth) {
    return null;
  }

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
      <Alert severity="warning">
        Modo desarrollo: no hay app registration de Entra ID configurado (VITE_ENTRA_CLIENT_ID).
        Este formulario no valida nada — cualquier correo entra con los roles que elijas.
      </Alert>
      <TextField
        label="Correo electrónico"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />
      <TextField
        label="Contraseña"
        type="password"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
      />
      <Stack spacing={0.5}>
        <FormLabel>Rol</FormLabel>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.23)',
            borderRadius: 1,
            px: 1.5,
            py: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontWeight: esLider ? 400 : 700 }}>Reclutador</Typography>
            <Switch
              checked={esLider}
              onChange={(e) => setRol(e.target.checked ? ROL_LIDER : ROL_RECLUTADOR)}
              slotProps={{ input: { 'aria-label': 'Cambiar entre Reclutador y Líder de área' } }}
            />
            <Typography sx={{ fontWeight: esLider ? 700 : 400 }}>Líder de área</Typography>
          </Stack>
        </Box>
      </Stack>
      <Button
        variant="contained"
        size="large"
        disabled={!correo}
        onClick={() => devAuth.iniciarSesion(correo, [rol])}
      >
        Iniciar sesión
      </Button>
    </Stack>
  );
}
