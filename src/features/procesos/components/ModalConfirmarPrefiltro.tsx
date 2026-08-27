import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import type { CandidatoResumen } from '../api/candidatos';
import { nombreCandidato } from '../logica/candidato';
import type { ProgresoEnvio, ResultadoEnvioPrefiltro } from '../hooks/useEnviarPrefiltro';

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
 * diligenciamiento real (cumple perfil, interés, aspiración salarial, ...) se
 * hace luego en SAP SuccessFactors. Al confirmar, cada candidato seleccionado
 * pasa de "En ranking" a "Prefiltro pendiente".
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

  return (
    <Dialog open={abierto} onClose={enviando ? undefined : onCancelar} fullWidth maxWidth="sm">
      <DialogTitle>Enviar a prefiltro telefónico</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          El prefiltro telefónico se diligencia en SAP SuccessFactors. Aquí solo se registra que
          estos candidatos avanzan a la etapa de prefiltro.
        </Alert>

        {!hayResultado && (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Se enviarán {seleccionados.length} candidato
              {seleccionados.length === 1 ? '' : 's'}:
            </Typography>
            <List dense>
              {seleccionados.map((candidato) => (
                <ListItem key={candidato.jobApplicationId} disableGutters>
                  <ListItemText
                    primary={nombreCandidato(candidato)}
                    secondary={
                      candidato.rankingPosicion !== null
                        ? `Ranking #${candidato.rankingPosicion}`
                        : undefined
                    }
                  />
                </ListItem>
              ))}
            </List>
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
