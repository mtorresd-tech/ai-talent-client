import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import type { ErrorMatriz } from '../logica/erroresMatriz';
import { formatearPuntaje } from '../logica/formatoMatriz';

export interface ModalConfirmarEnvioMatrizProps {
  abierto: boolean;
  posicion: number;
  /** Nombre o alias (vista ciega) del candidato. */
  nombre: string;
  total: number | null;
  /** `true` si el envío reemplaza una elección que el líder objetó. */
  reemplazaObjetado: boolean;
  enviando: boolean;
  /** Error del último intento que permite reintentar desde el propio modal. */
  error: ErrorMatriz | null;
  onCancelar: () => void;
  onConfirmar: () => void;
}

/**
 * Confirmación del envío de la matriz al líder: resume el candidato y su
 * total, advierte que después no se puede modificar y, si hubo una objeción,
 * que el envío reemplaza la elección objetada.
 */
export function ModalConfirmarEnvioMatriz({
  abierto,
  posicion,
  nombre,
  total,
  reemplazaObjetado,
  enviando,
  error,
  onCancelar,
  onConfirmar,
}: ModalConfirmarEnvioMatrizProps) {
  const tema = useTheme();
  const pantallaChica = useMediaQuery(tema.breakpoints.down('sm'));

  return (
    <Dialog
      open={abierto}
      onClose={enviando ? undefined : onCancelar}
      fullWidth
      maxWidth="sm"
      fullScreen={pantallaChica}
      aria-labelledby="titulo-confirmar-envio-matriz"
    >
      <DialogTitle id="titulo-confirmar-envio-matriz">Enviar la matriz al líder</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
              Candidato #{posicion} — {nombre}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Puntaje total: {formatearPuntaje(total) || 'Pendiente'}
            </Typography>
          </Stack>

          {reemplazaObjetado && (
            <Alert severity="info">Este candidato reemplaza la elección que el líder objetó.</Alert>
          )}

          <Alert severity="warning">
            Después de enviarla, la justificación no se puede modificar mientras el líder no la
            objete.
          </Alert>

          {error && (
            <Alert severity="error">
              {error.mensaje}
              {error.idCorrelacion ? ` (ID de correlación: ${error.idCorrelacion})` : ''}
            </Alert>
          )}

          {enviando && <LinearProgress aria-label="Enviando la matriz al líder" />}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onConfirmar} disabled={enviando}>
          {error ? 'Reintentar' : 'Confirmar envío'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
