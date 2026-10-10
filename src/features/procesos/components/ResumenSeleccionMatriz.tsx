import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert, { type AlertColor } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GebKeyValueList, GebStatusChip, type GebParClaveValor } from '@geb/ui';
import type { ActorDecision } from '../../../shared/tipos/dominio';
import type { MatrizSeleccion, SeleccionMatriz } from '../api/matriz';
import { nombreCandidato } from '../logica/candidato';
import {
  estadoEnvioMatriz,
  type EstadoEnvioMatriz,
  type ObjecionCandidatoMatriz,
} from '../logica/estadoEnvioMatriz';
import { formatearFechaHora } from '../logica/formatoFecha';
import { formatearPuntaje } from '../logica/formatoMatriz';

/** La columna de etiquetas se adapta al ancho disponible para no desbordar en pantallas angostas. */
const ANCHO_ETIQUETA = 'minmax(110px, 35%)';

function quien(actor: ActorDecision): string {
  return actor.upn ?? (actor.tipo === 'SISTEMA' ? 'Sistema' : 'Sin registrar');
}

/** Nombre o alias del candidato, o su identificador si ya no está en la matriz. */
function candidatoEnMatriz(matriz: MatrizSeleccion, jobApplicationId: string): string {
  const fila = matriz.candidatos.find(
    (candidato) => candidato.jobApplicationId === jobApplicationId,
  );
  return fila ? nombreCandidato(fila) : jobApplicationId;
}

/** `true` si el plazo de decisión ya pasó sin respuesta del líder. */
function plazoVencido(matriz: MatrizSeleccion, ahora: Date): boolean {
  if (matriz.decisionLider !== null || !matriz.plazoDecisionHasta) return false;
  const plazo = new Date(matriz.plazoDecisionHasta);
  return !Number.isNaN(plazo.getTime()) && plazo.getTime() < ahora.getTime();
}

/** Agrega el punto final si el texto no termina ya en punto (p. ej. "10:00 a. m."). */
const conPuntoFinal = (texto: string) => (texto.endsWith('.') ? texto : `${texto}.`);

const SEVERIDAD_AVISO: Record<Exclude<EstadoEnvioMatriz, 'ABIERTA'>, AlertColor> = {
  ENVIADA_PENDIENTE: 'info',
  AVALADA: 'success',
  OBJETADA: 'warning',
};

/** Estado de la decisión del líder, en una frase para el aviso del candidato enviado. */
function fraseEstado(matriz: MatrizSeleccion, estado: EstadoEnvioMatriz): string {
  if (estado === 'AVALADA') return 'Avalado por el líder.';
  if (estado === 'OBJETADA') {
    const motivo = (matriz.decisionLider?.motivo ?? 'Sin motivo registrado').replace(/[.\s]+$/, '');
    return `Objetado por el líder: ${motivo}. Puedes volver a enviar este candidato o elegir otro.`;
  }
  return matriz.plazoDecisionHasta
    ? `Pendiente de respuesta del líder (plazo hasta ${formatearFechaHora(matriz.plazoDecisionHasta)}).`
    : 'Pendiente de respuesta del líder.';
}

export interface ResumenSeleccionMatrizProps {
  /** Matriz ya enviada al líder (`seleccion !== null`). */
  matriz: MatrizSeleccion;
  /** Fecha de referencia para saber si el plazo venció. */
  ahora?: Date;
}

/**
 * Envío de la matriz al líder: un aviso con el candidato enviado, la fecha y
 * el estado de la decisión (pendiente con su plazo, avalado u objetado con el
 * motivo); debajo, el puntaje final, quién envió y quién decidió y, si las
 * hay, las elecciones objetadas anteriormente en una sección plegable.
 */
export function ResumenSeleccionMatriz({
  matriz,
  ahora = new Date(),
}: ResumenSeleccionMatrizProps) {
  const { seleccion, decisionLider } = matriz;
  if (!seleccion) return null;

  const estado = estadoEnvioMatriz(matriz);
  if (estado === 'ABIERTA') return null;
  const vencido = plazoVencido(matriz, ahora);
  const objeciones = matriz.objeciones ?? [];

  const items: GebParClaveValor[] = [
    { etiqueta: 'Puntaje final', valor: formatearPuntaje(seleccion.puntajeFinal) || 'Pendiente' },
    { etiqueta: 'Enviada por', valor: quien(seleccion.seleccionadaPor) },
  ];
  if (estado !== 'ENVIADA_PENDIENTE' && decisionLider) {
    const verbo = estado === 'AVALADA' ? 'Avalada' : 'Objetada';
    items.push(
      { etiqueta: `${verbo} por`, valor: quien(decisionLider.decididaPor) },
      { etiqueta: `${verbo} el`, valor: formatearFechaHora(decisionLider.decididaEn) },
    );
  }

  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }}>
      <Alert severity={SEVERIDAD_AVISO[estado]} sx={{ overflowWrap: 'anywhere' }}>
        <Typography variant="body2">
          <Box component="strong">{candidatoEnMatriz(matriz, seleccion.jobApplicationId)}</Box> fue
          el candidato seleccionado y enviado al líder el{' '}
          {conPuntoFinal(formatearFechaHora(seleccion.seleccionadaEn))}
        </Typography>
        <Typography variant="body2">{fraseEstado(matriz, estado)}</Typography>
        {vencido && (
          <Box sx={{ mt: 1 }}>
            <GebStatusChip estado="danger" enfasis="fuerte" label="Plazo vencido" />
          </Box>
        )}
      </Alert>

      <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        <GebKeyValueList items={items} anchoEtiqueta={ANCHO_ETIQUETA} />
      </Box>

      {objeciones.length > 0 && (
        <Accordion disableGutters variant="outlined" sx={{ borderRadius: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Elecciones objetadas anteriormente ({objeciones.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2} component="ol" sx={{ m: 0, pl: 2.5 }}>
              {objeciones.map((objecion) => (
                <Box
                  component="li"
                  key={`${objecion.jobApplicationId}-${objecion.decididaEn}`}
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {candidatoEnMatriz(matriz, objecion.jobApplicationId)}
                  </Typography>
                  <Typography variant="body2">
                    Motivo: {objecion.motivo ?? 'Sin motivo registrado'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Objetada por {quien(objecion.decididaPor)} el{' '}
                    {formatearFechaHora(objecion.decididaEn)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Stack>
  );
}

export interface JustificacionEnviadaMatrizProps {
  /** Justificación enviada; `null` para un objetado histórico, del que solo se conserva el motivo. */
  seleccion: SeleccionMatriz | null;
  /** Objeción del líder sobre el candidato, si la hubo. */
  objecion: ObjecionCandidatoMatriz | null;
}

/** Justificación enviada al líder en solo lectura, con el motivo de la objeción si el candidato fue objetado. */
export function JustificacionEnviadaMatriz({
  seleccion,
  objecion,
}: JustificacionEnviadaMatrizProps) {
  const items: GebParClaveValor[] = seleccion
    ? [
        { etiqueta: 'Fortalezas', valor: seleccion.fortalezas },
        {
          etiqueta: 'Oportunidades de desarrollo',
          valor: seleccion.oportunidadesDesarrollo ?? '—',
        },
        { etiqueta: 'Criterio de desempate', valor: seleccion.criterioDesempate ?? '—' },
        { etiqueta: 'Equivalencias aplicadas', valor: seleccion.equivalenciasAplicadas ?? '—' },
        { etiqueta: 'Observaciones', valor: seleccion.observaciones ?? '—' },
      ]
    : [];

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
        minWidth: 0,
      }}
    >
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Justificación enviada al líder
        </Typography>
        {objecion && (
          <Alert severity="error">
            <AlertTitle>Objetado por el líder</AlertTitle>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              Motivo: {objecion.motivo ?? 'Sin motivo registrado'}
            </Typography>
            <Typography variant="body2">
              Objetado por {quien(objecion.decididaPor)} el{' '}
              {formatearFechaHora(objecion.decididaEn)}
            </Typography>
          </Alert>
        )}
        {items.length > 0 ? (
          <Box sx={{ minWidth: 0, overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>
            <GebKeyValueList items={items} anchoEtiqueta={ANCHO_ETIQUETA} />
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Este candidato fue una elección anterior; su justificación no se conserva.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
