import { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '@geb/auth';
import { useDevAuth } from '../../../shared/auth/DevAuthContext';
import { ROL_ADMINISTRADOR, ROL_LIDER, ROL_RECLUTADOR } from '../../../shared/tipos/dominio';

/**
 * TODO: pantalla de login real (ver mockup en contexto de diseño) — @geb/ui
 * no tiene un componente de login predefinido, así que se construye con MUI
 * directo (ver skill geb-lib).
 */
export function PaginaInicioSesion() {
  const { estado, login } = useAuth();
  const devAuth = useDevAuth();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');

  if (devAuth) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 360, margin: '10% auto' }}>
        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          IA Talento
        </Typography>
        <Alert severity="warning">
          Modo desarrollo: no hay app registration de Entra ID configurado (VITE_ENTRA_CLIENT_ID).
          Este formulario no valida nada — cualquier correo entra con todos los roles.
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
        <Button
          variant="contained"
          size="large"
          disabled={!correo}
          onClick={() =>
            devAuth.iniciarSesion(correo, [ROL_RECLUTADOR, ROL_LIDER, ROL_ADMINISTRADOR])
          }
        >
          Iniciar sesión
        </Button>
      </Stack>
    );
  }

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
