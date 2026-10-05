import { useState, type ReactNode } from 'react';
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
import { GebEmptyState } from '@geb/ui';
import type { ApiError } from '@geb/api-client';
import type { EstudioInforme, ExperienciaInforme, InformeIncognito } from '../api/bandejas';
import { formatearFechaHora } from '../logica/formatoFecha';
import { formatearRangoExperiencia } from '../logica/formatoRangoExperiencia';
import { agrupaEstudios } from '../logica/agrupaEstudios';
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

/** Valores únicos de `competencias`, si hay alguno; si no, la fila no se muestra. */
function areasDelResumen(competencias: string[]): { etiqueta: string; valores: string[] } | null {
  if (competencias.length === 0) return null;
  return { etiqueta: 'Áreas', valores: [...new Set(competencias)] };
}

/** Título de sección del modal: mismo peso visual en "Resumen", "Formación académica", etc. */
function TituloSeccion({ children }: { children: string }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

/** Etiqueta pequeña sobre su valor, igual al patrón de `InformacionPrefiltro.tsx`. */
function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {etiqueta}
      </Typography>
      <Typography variant="body2">{valor}</Typography>
    </Box>
  );
}

/** Tarjeta con borde para un ítem de experiencia o formación — límite visual claro entre ítems. */
function TarjetaItem({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.25, minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
        {titulo}
      </Typography>
      <Stack spacing={0.75}>{children}</Stack>
    </Box>
  );
}

function ItemExperiencia({ experiencia }: { experiencia: ExperienciaInforme }) {
  return (
    <TarjetaItem titulo={experiencia.cargo}>
      {experiencia.compania && <Fila etiqueta="Compañía" valor={experiencia.compania} />}
      <Fila
        etiqueta="Periodo"
        valor={formatearRangoExperiencia(experiencia.fechaInicio, experiencia.fechaFin)}
      />
      {experiencia.funciones && <Fila etiqueta="Funciones" valor={experiencia.funciones} />}
    </TarjetaItem>
  );
}

function ItemEstudio({ estudio }: { estudio: EstudioInforme }) {
  return (
    <TarjetaItem titulo={estudio.nombreEstudio ?? 'Formación académica'}>
      <Fila etiqueta="Nivel académico" valor={estudio.nivelAcademico} />
      {estudio.institucion && <Fila etiqueta="Institución" valor={estudio.institucion} />}
    </TarjetaItem>
  );
}

/**
 * Modal del informe anonimizado: cabecera con el alias y la fecha de
 * generación, resumen de experiencia, nivel académico y áreas, formación
 * académica agrupada, experiencia profesional completa, competencias, el
 * desglose de afinidad generado por IA y, debajo, la sección de decisión
 * (aprobar o rechazar al candidato con un único campo de comentario,
 * obligatorio solo al rechazar).
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
  const areas = informe ? areasDelResumen(competencias) : null;
  const gruposEstudios = agrupaEstudios(estudios);

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
              {(tieneResumen || areas) && (
                <Stack spacing={1}>
                  <TituloSeccion>Resumen</TituloSeccion>
                  <Stack spacing={0.75}>
                    {informe.aniosExperienciaTotal !== null && (
                      <Fila
                        etiqueta="Experiencia total"
                        valor={`${informe.aniosExperienciaTotal} años`}
                      />
                    )}
                    {informe.nivelAcademicoMaximo !== null && (
                      <Fila
                        etiqueta="Nivel académico máximo"
                        valor={informe.nivelAcademicoMaximo}
                      />
                    )}
                    {areas && <Fila etiqueta={areas.etiqueta} valor={areas.valores.join(', ')} />}
                  </Stack>
                </Stack>
              )}

              <Stack spacing={1}>
                <TituloSeccion>Formación académica</TituloSeccion>
                {gruposEstudios.length === 0 ? (
                  <GebEmptyState titulo="Sin estudios registrados" />
                ) : (
                  <Stack spacing={1.5}>
                    {gruposEstudios.map((grupo) => (
                      <Box key={grupo.grupo}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.75 }}
                        >
                          {grupo.titulo}
                        </Typography>
                        <Stack spacing={1}>
                          {grupo.estudios.map((estudio, indice) => (
                            <ItemEstudio key={indice} estudio={estudio} />
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>

              <Stack spacing={1}>
                <TituloSeccion>Experiencia profesional</TituloSeccion>
                {experiencia.length === 0 ? (
                  <GebEmptyState titulo="Sin experiencia registrada" />
                ) : (
                  <Stack spacing={1}>
                    {experiencia.map((item, indice) => (
                      <ItemExperiencia key={indice} experiencia={item} />
                    ))}
                  </Stack>
                )}
              </Stack>

              {competencias.length > 0 && (
                <Stack spacing={1}>
                  <TituloSeccion>Competencias</TituloSeccion>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {competencias.map((competencia) => (
                      <Chip key={competencia} size="small" label={competencia} />
                    ))}
                  </Box>
                </Stack>
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
