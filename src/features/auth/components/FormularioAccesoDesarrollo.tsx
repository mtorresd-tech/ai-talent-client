import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Stack,
  TextField,
} from '@mui/material';
import { useDevAuth } from '../../../shared/auth/DevAuthContext';
import { ROL_LIDER, ROL_RECLUTADOR } from '../../../shared/tipos/dominio';

/** Formulario de acceso en modo desarrollo, sin app registration de Entra ID configurado. */
export function FormularioAccesoDesarrollo() {
  const devAuth = useDevAuth();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [esReclutador, setEsReclutador] = useState(true);
  const [esLider, setEsLider] = useState(false);

  if (!devAuth) {
    return null;
  }

  const roles = [esReclutador && ROL_RECLUTADOR, esLider && ROL_LIDER].filter(
    (rol): rol is string => Boolean(rol),
  );

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
        <FormLabel>Roles</FormLabel>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.23)',
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={esReclutador}
                onChange={(e) => setEsReclutador(e.target.checked)}
              />
            }
            label="Reclutador"
          />
          <FormControlLabel
            control={<Checkbox checked={esLider} onChange={(e) => setEsLider(e.target.checked)} />}
            label="Líder de área"
          />
        </Box>
      </Stack>
      <Button
        variant="contained"
        size="large"
        disabled={!correo || roles.length === 0}
        onClick={() => devAuth.iniciarSesion(correo, roles)}
      >
        Iniciar sesión
      </Button>
    </Stack>
  );
}
