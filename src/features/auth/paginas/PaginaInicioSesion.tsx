import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '@geb/auth';
import { useDevAuth } from '../../../shared/auth/DevAuthContext';
import { ROL_ADMINISTRADOR, ROL_LIDER, ROL_RECLUTADOR } from '../../../shared/tipos/dominio';

/**
 * TODO: pantalla de login real — @geb/ui no tiene un componente de login
 * predefinido, así que se construye con MUI directo.
 */

const ROLES_DISPONIBLES = [
  { valor: ROL_RECLUTADOR, etiqueta: 'Reclutador' },
  { valor: ROL_LIDER, etiqueta: 'Líder de área' },
  { valor: ROL_ADMINISTRADOR, etiqueta: 'Administrador' },
] as const;

export function PaginaInicioSesion() {
  const { estado, login } = useAuth();
  const devAuth = useDevAuth();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  // Login de desarrollo: se elige con qué roles entrar en vez de recibir todos
  // a la vez (con todos, el dispatch de "Procesos" siempre abría la pantalla
  // del líder y nunca la del reclutador).
  const [roles, setRoles] = useState<string[]>([ROL_RECLUTADOR]);

  const alternarRol = (valor: string, marcado: boolean) => {
    setRoles((previos) =>
      marcado ? [...new Set([...previos, valor])] : previos.filter((rol) => rol !== valor),
    );
  };

  if (devAuth) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 360, margin: '10% auto' }}>
        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          IA Talento
        </Typography>
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
        <FormGroup>
          <FormLabel sx={{ mb: 0.5 }}>Roles</FormLabel>
          {ROLES_DISPONIBLES.map((rol) => (
            <FormControlLabel
              key={rol.valor}
              control={
                <Checkbox
                  checked={roles.includes(rol.valor)}
                  onChange={(e) => alternarRol(rol.valor, e.target.checked)}
                />
              }
              label={rol.etiqueta}
            />
          ))}
        </FormGroup>
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
