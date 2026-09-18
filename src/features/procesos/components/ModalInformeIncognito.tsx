import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import type { ApiError } from '@geb/api-client';
import type { InformeIncognito } from '../api/bandejas';
import { formatearFechaHora } from '../logica/formatoFecha';
import { TarjetaMatchIa } from './TarjetaMatchIa';

export interface ModalInformeIncognitoProps {
  abierto: boolean;
  /** Informe de la fila; se reutiliza tal cual, sin una segunda llamada. */
  informe: InformeIncognito | null;
  /** `null` si el alias del informe no se pudo resolver a un candidato. */
  jobApplicationId: string | null;
  enviando: boolean;
  /** Error del intento anterior de decisión, si lo hubo. */
  error: ApiError | null;
  onDecidir: (decision: 'APRUEBA' | 'RECHAZA', motivo?: string, comentario?: string) => void;
  onCerrar: () => void;
}

function textoContador(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

/**
 * Modal del informe anonimizado: cabecera con el alias y la fecha de
 * generación, resumen de experiencia y nivel académico, competencias,
 * contadores de experiencia/estudios, el desglose de afinidad generado por IA
 * y, debajo, la sección de decisión (aprobar o rechazar al candidato con un
 * único campo de comentario, obligatorio solo al rechazar).
 */
export function ModalInformeIncognito({
  abierto,
  informe,
  jobApplicationId,
  enviando,
  error,
  onDecidir,
  onCerrar,
}: ModalInformeIncognitoProps) {
  const tema = useTheme();
  const pantallaChica = useMediaQuery(tema.breakpoints.down('sm'));

  const [comentario, setComentario] = useState('');
  const [aliasMostrado, setAliasMostrado] = useState(informe?.alias ?? null);

  // El informe mostrado cambió (nueva apertura): el campo no arrastra texto
  // de una revisión anterior. Se ajusta en el propio render, no en un efecto,
  // siguiendo el patrón recomendado por React para resetear estado derivado
  // de una prop.
  if (aliasMostrado !== (informe?.alias ?? null)) {
    setAliasMostrado(informe?.alias ?? null);
    setComentario('');
  }

  const competencias = informe?.competencias ?? [];
  const experiencia = informe?.experiencia ?? [];
  const estudios = informe?.estudios ?? [];
  const tieneResumen =
    informe != null &&
    (informe.aniosExperienciaTotal !== null || informe.nivelAcademicoMaximo !== null);

  const candidatoNoIdentificado = jobApplicationId === null;
  const comentarioLimpio = comentario.trim();

  // Un solo campo de texto: el comentario del líder sobre su decisión. Se
  // envía como `comentario` siempre, y también como `motivo` al rechazar
  // (el contrato del backend distingue ambos campos, pero para el líder es
  // el mismo texto — no tiene sentido pedirle que escriba dos veces lo mismo).
  const aprobar = (): void => {
    onDecidir('APRUEBA', undefined, comentarioLimpio || undefined);
  };

  const rechazar = (): void => {
    onDecidir('RECHAZA', comentarioLimpio, comentarioLimpio || undefined);
  };

  return (
    <Dialog
      open={abierto}
      onClose={enviando ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
      fullScreen={pantallaChica}
    >
      {informe && (
        <>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack spacing={0.25}>
              <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
                {informe.alias}
              </Typography>
              <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                Generado el {formatearFechaHora(informe.generadoEn)}
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              {tieneResumen && (
                <Stack spacing={0.5}>
                  {informe.aniosExperienciaTotal !== null && (
                    <Typography variant="body2">
                      <strong>Experiencia total:</strong> {informe.aniosExperienciaTotal} años
                    </Typography>
                  )}
                  {informe.nivelAcademicoMaximo !== null && (
                    <Typography variant="body2">
                      <strong>Nivel académico máximo:</strong> {informe.nivelAcademicoMaximo}
                    </Typography>
                  )}
                </Stack>
              )}

              {competencias.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Competencias
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {competencias.map((competencia) => (
                      <Chip key={competencia} size="small" label={competencia} />
                    ))}
                  </Box>
                </Box>
              )}

              {experiencia.length > 0 && (
                <Typography variant="body2">
                  {textoContador(
                    experiencia.length,
                    'experiencia registrada',
                    'experiencias registradas',
                  )}
                </Typography>
              )}
              {estudios.length > 0 && (
                <Typography variant="body2">
                  {textoContador(estudios.length, 'estudio registrado', 'estudios registrados')}
                </Typography>
              )}

              <TarjetaMatchIa
                desglose={informe.desgloseAfinidad}
                scoreAfinidad={informe.desgloseAfinidad?.porcentajeTotal ?? null}
              />

              {candidatoNoIdentificado ? (
                <Alert severity="warning">
                  No fue posible identificar al candidato para registrar una decisión. Puede deberse
                  a que ya fue evaluado por otra vía.
                </Alert>
              ) : (
                <TextField
                  label="Comentario"
                  multiline
                  minRows={2}
                  maxRows={3}
                  fullWidth
                  value={comentario}
                  onChange={(evento) => setComentario(evento.target.value)}
                  helperText="Obligatorio si va a rechazar al candidato. Se guarda junto con la decisión para el equipo de selección."
                  disabled={enviando}
                />
              )}

              {error && (
                <Alert severity="error">
                  {error.problem.title}
                  {error.idCorrelacion ? ` (ID de correlación: ${error.idCorrelacion})` : ''}
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCerrar} disabled={enviando} sx={{ mr: 'auto' }}>
              Cerrar
            </Button>
            <Button
              onClick={rechazar}
              color="error"
              variant="outlined"
              disabled={enviando || candidatoNoIdentificado || comentarioLimpio.length === 0}
            >
              Rechazar
            </Button>
            <Button
              onClick={aprobar}
              variant="contained"
              disabled={enviando || candidatoNoIdentificado}
            >
              Aprobar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
