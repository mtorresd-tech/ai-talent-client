import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import type { CandidatoResumen } from '../api/candidatos';
import { nombreCandidato } from '../logica/candidato';
import type { ProgresoEnvio, ResultadoEnvioPrefiltro } from '../hooks/useEnviarPrefiltro';
import { AvatarIniciales } from './AvatarIniciales';

export interface ModalConfirmarPrefiltroProps {
  abierto: boolean;
  seleccionados: CandidatoResumen[];
  enviando: boolean;
  progreso: ProgresoEnvio | null;
  resultado: ResultadoEnvioPrefiltro | null;
  onCancelar: () => void;
  onConfirmar: () => void;
  onCerrar: () => void;
}

/**
 * Modal de confirmación del prefiltro telefónico. Solo confirma la acción: el
 * diligenciamiento real (cumple perfil, interés, tiempo de vinculación, …) se
 * hace luego en SAP SuccessFactors. Cada candidato seleccionado pasa de "En
 * ranking" a "Prefiltro pendiente".
 */
export function ModalConfirmarPrefiltro({
  abierto,
  seleccionados,
  enviando,
  progreso,
  resultado,
  onCancelar,
  onConfirmar,
  onCerrar,
}: ModalConfirmarPrefiltroProps) {
  const hayResultado = resultado !== null;
  const tema = useTheme();
  const pantallaChica = useMediaQuery(tema.breakpoints.down('sm'));

  return (
    <Dialog
      open={abierto}
      onClose={enviando ? undefined : onCancelar}
      fullWidth
      maxWidth="sm"
      fullScreen={pantallaChica}
    >
      <DialogTitle>Enviar a prefiltro telefónico</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          El prefiltro telefónico se diligencia en SAP SuccessFactors. Al confirmar, estos
          candidatos pasan a "Prefiltro pendiente"; luego, dirígete a SuccessFactors para registrar
          el resultado de la llamada.
        </Alert>

        {!hayResultado && (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Se enviarán {seleccionados.length} candidato
              {seleccionados.length === 1 ? '' : 's'}:
            </Typography>
            <Stack
              spacing={1}
              sx={{
                maxHeight: 260,
                overflowY: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 1,
              }}
            >
              {seleccionados.map((candidato) => (
                <Box
                  key={candidato.jobApplicationId}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <AvatarIniciales nombre={nombreCandidato(candidato)} tamano={32} />
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                    {nombreCandidato(candidato)}
                  </Typography>
                  {candidato.rankingPosicion !== null && (
                    <Chip size="small" label={`Ranking #${candidato.rankingPosicion}`} />
                  )}
                </Box>
              ))}
            </Stack>
          </>
        )}

        {enviando && progreso && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Enviando {progreso.procesados} de {progreso.total}…
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progreso.total === 0 ? 0 : (progreso.procesados / progreso.total) * 100}
            />
          </Box>
        )}

        {hayResultado && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {resultado.exitosos.length} enviado
              {resultado.exitosos.length === 1 ? '' : 's'}
              {resultado.fallidos.length > 0 ? `, ${resultado.fallidos.length} con error` : ''}
            </Typography>
            {resultado.fallidos.length > 0 && (
              <List dense>
                {resultado.fallidos.map((fallo) => (
                  <ListItem key={fallo.id} disableGutters>
                    <ListItemText
                      primary={fallo.motivo}
                      secondary={
                        fallo.correlationId
                          ? `ID de correlación: ${fallo.correlationId}`
                          : undefined
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {hayResultado ? (
          <Button onClick={onCerrar} variant="contained">
            Cerrar
          </Button>
        ) : (
          <>
            <Button onClick={onCancelar} disabled={enviando}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirmar}
              variant="contained"
              disabled={enviando || seleccionados.length === 0}
            >
              Confirmar
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
