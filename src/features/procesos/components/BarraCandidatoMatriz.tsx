import { useReducer, useRef, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GebStatusChip } from '@geb/ui';
import type { FilaMatriz, MatrizSeleccion } from '../api/matriz';
import { leerBorrador } from '../logica/borradorJustificacionMatriz';
import { nombreCandidato } from '../logica/candidato';
import {
  ESTADO_REGISTRO_CANDIDATO_MATRIZ,
  ETIQUETA_ESTADO_CANDIDATO_MATRIZ,
  estadoCandidatoMatriz,
} from '../logica/candidatosMatriz';
import {
  estadoEnvioMatriz,
  idsObjetados,
  objecionDe,
  puedeEnviar,
} from '../logica/estadoEnvioMatriz';
import { formatearPuntaje } from '../logica/formatoMatriz';
import { DistintivoTipoCandidato } from './DistintivoTipoCandidato';
import { RecuadroMatriz } from './RecuadroMatriz';
import { JustificacionEnviadaMatriz } from './ResumenSeleccionMatriz';

/**
 * Aviso de una línea bajo el candidato: el motivo de la objeción del líder
 * (solo informativo) o por qué no se puede justificar ni enviar.
 */
function avisoCandidato(matriz: MatrizSeleccion, fila: FilaMatriz): string | null {
  const objecion = idsObjetados(matriz).has(fila.jobApplicationId)
    ? objecionDe(matriz, fila.jobApplicationId)
    : null;
  if (objecion) return `Objetado por el líder: ${objecion.motivo ?? 'Sin motivo registrado'}`;
  if (matriz.seleccion?.jobApplicationId === fila.jobApplicationId) return null;
  if (!fila.resultado.completa) return 'Calificación incompleta';

  const estado = estadoEnvioMatriz(matriz);
  if (estado === 'ENVIADA_PENDIENTE') {
    return 'La matriz ya se envió al líder; no se puede cambiar la elección mientras el líder no responda.';
  }
  if (estado === 'AVALADA') {
    return 'El líder avaló la matriz; la elección quedó en firme.';
  }
  return null;
}

export interface BarraCandidatoMatrizProps {
  matriz: MatrizSeleccion;
  /** Candidato activo. */
  fila: FilaMatriz;
  /** `true` si el formulario o la justificación enviada están desplegados. */
  abierto: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
  /** Formulario de justificación del candidato; solo se renderiza al desplegarse. */
  formulario: ReactNode;
}

/**
 * Barra del candidato activo bajo la matriz: nombre o alias, si es interno o
 * externo, total (o "Pendiente") y estado. Si el candidato se puede enviar al
 * líder ofrece "Seleccionar este candidato" ("Volver a enviar este candidato"
 * si es el objetado vigente, "Continuar justificación" si tiene borrador) y
 * despliega su formulario; si es el candidato enviado ofrece ver la
 * justificación enviada. Debajo muestra el motivo de la objeción, si la hubo,
 * o por qué no se puede elegir.
 */
export function BarraCandidatoMatriz({
  matriz,
  fila,
  abierto,
  onAbrir,
  onCerrar,
  formulario,
}: BarraCandidatoMatrizProps) {
  const contenidoRef = useRef<HTMLDivElement>(null);
  // Al plegarse, el formulario guarda el borrador al desmontarse: se vuelve a
  // renderizar para que el botón pase a "Continuar justificación".
  const [, releerBorrador] = useReducer((version: number) => version + 1, 0);
  // El objetado vigente puede desplegar tanto el formulario como la justificación enviada.
  const [vista, setVista] = useState<'formulario' | 'enviada'>('formulario');

  const tieneBorrador = leerBorrador(matriz.jobRequisitionId, fila.jobApplicationId) !== null;
  const estado = estadoCandidatoMatriz(fila, matriz, tieneBorrador);
  const esSeleccionado = matriz.seleccion?.jobApplicationId === fila.jobApplicationId;
  const enviable = puedeEnviar(matriz, fila);
  const motivo = avisoCandidato(matriz, fila);
  const total = formatearPuntaje(fila.resultado.total);

  const vistaActual =
    esSeleccionado && (!enviable || vista === 'enviada') ? 'enviada' : 'formulario';
  let contenido: ReactNode = null;
  if (vistaActual === 'enviada') {
    contenido = (
      <JustificacionEnviadaMatriz
        seleccion={matriz.seleccion}
        objecion={objecionDe(matriz, fila.jobApplicationId)}
      />
    );
  } else if (enviable) {
    contenido = formulario;
  }
  const formularioAbierto = abierto && vistaActual === 'formulario';
  const enviadaAbierta = abierto && vistaActual === 'enviada';

  let textoSeleccionar = 'Seleccionar este candidato';
  if (tieneBorrador) textoSeleccionar = 'Continuar justificación';
  else if (esSeleccionado) textoSeleccionar = 'Volver a enviar este candidato';

  const abrirVista = (nueva: 'formulario' | 'enviada') => {
    setVista(nueva);
    onAbrir();
  };

  const desplazarAlContenido = () =>
    contenidoRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <RecuadroMatriz>
        <Stack
          direction="row"
          spacing={1.5}
          useFlexGap
          sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap', alignItems: 'center', minWidth: 0 }}
          >
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}
            >
              {nombreCandidato(fila)}
            </Typography>
            <DistintivoTipoCandidato tipo={fila.tipoCandidato} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Total: {total || 'Pendiente'}
            </Typography>
            <GebStatusChip
              size="small"
              estado={ESTADO_REGISTRO_CANDIDATO_MATRIZ[estado]}
              label={ETIQUETA_ESTADO_CANDIDATO_MATRIZ[estado]}
            />
          </Stack>

          {(enviable && !formularioAbierto) || esSeleccionado ? (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {esSeleccionado && (
                <Button
                  variant="outlined"
                  aria-expanded={enviadaAbierta}
                  onClick={enviadaAbierta ? onCerrar : () => abrirVista('enviada')}
                >
                  {enviadaAbierta ? 'Ocultar justificación enviada' : 'Ver justificación enviada'}
                </Button>
              )}
              {enviable && !formularioAbierto && (
                <Button variant="contained" onClick={() => abrirVista('formulario')}>
                  {textoSeleccionar}
                </Button>
              )}
            </Stack>
          ) : null}
        </Stack>

        {motivo && (
          <Typography
            variant="body2"
            sx={{ mt: 1, color: 'text.secondary', overflowWrap: 'anywhere' }}
          >
            {motivo}
          </Typography>
        )}
      </RecuadroMatriz>

      {/* La `key` remonta el despliegue al cambiar de candidato o tras el envío, para no
          animar el cierre mostrando el contenido del caso nuevo. */}
      <Collapse
        key={`${fila.jobApplicationId}:${vistaActual}`}
        in={abierto && contenido !== null}
        unmountOnExit
        onEntered={desplazarAlContenido}
        onExited={releerBorrador}
      >
        <Box ref={contenidoRef} sx={{ minWidth: 0, scrollMarginTop: (theme) => theme.spacing(2) }}>
          {contenido}
        </Box>
      </Collapse>
    </Stack>
  );
}
