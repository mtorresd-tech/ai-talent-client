import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useWatch, type Control } from 'react-hook-form';
import { z } from 'zod';
import { GebForm, useGebForm } from '@geb/forms';
import type { FilaMatriz, SeleccionMatriz, SeleccionMatrizRequest } from '../api/matriz';
import {
  borradorVacio,
  eliminarBorrador,
  guardarBorrador,
  leerBorrador,
  type BorradorJustificacionMatriz,
} from '../logica/borradorJustificacionMatriz';
import { nombreCandidato } from '../logica/candidato';
import { hayEmpateDeTotal } from '../logica/empateMatriz';
import type { ErrorMatriz } from '../logica/erroresMatriz';
import { CampoTextoLargo } from './CampoTextoLargo';
import { ModalConfirmarEnvioMatriz } from './ModalConfirmarEnvioMatriz';

const ESPERA_GUARDADO_BORRADOR_MS = 500;

const VACIO: BorradorJustificacionMatriz = {
  fortalezas: '',
  oportunidadesDesarrollo: '',
  criterioDesempate: '',
  equivalenciasAplicadas: '',
  observaciones: '',
};

function construirEsquemaJustificacion(hayEmpate: boolean) {
  return z
    .object({
      fortalezas: z.string().trim().min(1, 'Este campo es obligatorio').max(2000),
      oportunidadesDesarrollo: z.string().max(2000),
      criterioDesempate: z.string().max(1000),
      equivalenciasAplicadas: z.string().max(1000),
      observaciones: z.string().max(2000),
    })
    .superRefine((valores, ctx) => {
      if (hayEmpate && !valores.criterioDesempate.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['criterioDesempate'],
          message: 'Hay empate de puntaje con otro candidato: describe el criterio de desempate.',
        });
      }
    });
}

function textoOpcional(valor: string | undefined): string | null {
  const recortado = valor?.trim() ?? '';
  return recortado === '' ? null : recortado;
}

/** Justificación ya enviada al líder en forma de borrador, para precargar el formulario. */
function justificacionComoBorrador(seleccion: SeleccionMatriz): BorradorJustificacionMatriz {
  return {
    fortalezas: seleccion.fortalezas,
    oportunidadesDesarrollo: seleccion.oportunidadesDesarrollo ?? '',
    criterioDesempate: seleccion.criterioDesempate ?? '',
    equivalenciasAplicadas: seleccion.equivalenciasAplicadas ?? '',
    observaciones: seleccion.observaciones ?? '',
  };
}

function aBorrador(valores: Partial<BorradorJustificacionMatriz>): BorradorJustificacionMatriz {
  return {
    fortalezas: valores.fortalezas ?? '',
    oportunidadesDesarrollo: valores.oportunidadesDesarrollo ?? '',
    criterioDesempate: valores.criterioDesempate ?? '',
    equivalenciasAplicadas: valores.equivalenciasAplicadas ?? '',
    observaciones: valores.observaciones ?? '',
  };
}

function persistirBorrador(
  jobRequisitionId: string,
  jobApplicationId: string,
  borrador: BorradorJustificacionMatriz,
  esBorrador: boolean,
): void {
  if (esBorrador) guardarBorrador(jobRequisitionId, jobApplicationId, borrador);
  else eliminarBorrador(jobRequisitionId, jobApplicationId);
}

export interface FormularioJustificacionMatrizProps {
  jobRequisitionId: string;
  fila: FilaMatriz;
  posicion: number;
  /** Todos los candidatos de la matriz, para detectar empate de total. */
  candidatos: readonly FilaMatriz[];
  /** `true` si el envío reemplaza una elección objetada por el líder. */
  reemplazaObjetado: boolean;
  /**
   * Justificación enviada de este mismo candidato cuando el líder la objetó:
   * precarga los campos si no hay borrador guardado.
   */
  justificacionEnviada?: SeleccionMatriz | null;
  /** `true` mientras el modal de confirmación de este candidato está abierto. */
  confirmacionAbierta: boolean;
  enviando: boolean;
  /** Error del envío que se muestra en el modal (red, servidor). */
  errorEnvio: ErrorMatriz | null;
  /** Mensaje del backend para el campo "Criterio de desempate". */
  errorDesempate: string | null;
  onSolicitarEnvio: (datos: SeleccionMatrizRequest) => void;
  onCancelarEnvio: () => void;
  onConfirmarEnvio: () => void;
  /** Se llama cuando el borrador guardado cambia (para refrescar el estado en la lista). */
  onCambioBorrador?: () => void;
  /** Pliega el formulario conservando el borrador; sin él no se muestra "Cancelar". */
  onCancelar?: () => void;
}

/**
 * Justificación de la selección de un candidato elegible. Arranca con el
 * borrador guardado o, si no lo hay, con `justificacionEnviada` (o vacío). Lo
 * que difiere de ese punto de partida se guarda como borrador en la sesión del
 * navegador mientras no se envía; "Enviar al líder" valida y abre la
 * confirmación. Montarlo con `key` por candidato para reiniciar el formulario
 * al cambiar de candidato.
 */
export function FormularioJustificacionMatriz({
  jobRequisitionId,
  fila,
  posicion,
  candidatos,
  reemplazaObjetado,
  justificacionEnviada = null,
  confirmacionAbierta,
  enviando,
  errorEnvio,
  errorDesempate,
  onSolicitarEnvio,
  onCancelarEnvio,
  onConfirmarEnvio,
  onCambioBorrador,
  onCancelar,
}: FormularioJustificacionMatrizProps) {
  const { jobApplicationId } = fila;
  const hayEmpate = hayEmpateDeTotal(candidatos, jobApplicationId);
  const esquema = useMemo(() => construirEsquemaJustificacion(hayEmpate), [hayEmpate]);
  const [borradorInicial] = useState(() => leerBorrador(jobRequisitionId, jobApplicationId));
  const [hayBorrador, setHayBorrador] = useState(borradorInicial !== null);
  const [base] = useState(() =>
    justificacionEnviada ? justificacionComoBorrador(justificacionEnviada) : VACIO,
  );
  const precargado = justificacionEnviada !== null;

  const form = useGebForm({ schema: esquema, valoresIniciales: borradorInicial ?? base });
  // `@geb/forms` tipa el formulario contra su propia copia de react-hook-form;
  // en ejecución es la misma instancia (alias en la configuración de Vite).
  const valores = useWatch({
    control: form.control as unknown as Control<BorradorJustificacionMatriz>,
  });
  // Se serializa para que el guardado dependa del contenido y no de la identidad del objeto.
  const valoresSerializados = JSON.stringify(aBorrador(valores));

  // Último valor pendiente de guardar; se guarda al desmontar para no perder
  // lo escrito justo antes de cambiar de candidato.
  const pendiente = useRef<BorradorJustificacionMatriz | null>(null);
  const baseSerializada = JSON.stringify(base);
  const onCambioBorradorRef = useRef(onCambioBorrador);
  useEffect(() => {
    onCambioBorradorRef.current = onCambioBorrador;
  }, [onCambioBorrador]);

  useEffect(() => {
    const borrador = JSON.parse(valoresSerializados) as BorradorJustificacionMatriz;
    pendiente.current = borrador;
    // Lo que coincide con el punto de partida (vacío o la justificación enviada) no es borrador.
    const esBorrador = valoresSerializados !== baseSerializada && !borradorVacio(borrador);
    const temporizador = window.setTimeout(() => {
      pendiente.current = null;
      persistirBorrador(jobRequisitionId, jobApplicationId, borrador, esBorrador);
      setHayBorrador(esBorrador);
      onCambioBorradorRef.current?.();
    }, ESPERA_GUARDADO_BORRADOR_MS);
    return () => window.clearTimeout(temporizador);
  }, [valoresSerializados, baseSerializada, jobRequisitionId, jobApplicationId]);

  useEffect(
    () => () => {
      if (pendiente.current) {
        const borrador = pendiente.current;
        const esBorrador = JSON.stringify(borrador) !== baseSerializada && !borradorVacio(borrador);
        persistirBorrador(jobRequisitionId, jobApplicationId, borrador, esBorrador);
        onCambioBorradorRef.current?.();
      }
    },
    [baseSerializada, jobRequisitionId, jobApplicationId],
  );

  const erroresServidor = useMemo(
    () => (errorDesempate ? { criterioDesempate: [errorDesempate] } : undefined),
    [errorDesempate],
  );

  const descartarBorrador = () => {
    eliminarBorrador(jobRequisitionId, jobApplicationId);
    form.reset(base);
    pendiente.current = null;
    setHayBorrador(false);
    onCambioBorrador?.();
  };

  const manejarEnvio = (datos: BorradorJustificacionMatriz) => {
    onSolicitarEnvio({
      jobApplicationId,
      fortalezas: datos.fortalezas.trim(),
      oportunidadesDesarrollo: textoOpcional(datos.oportunidadesDesarrollo),
      criterioDesempate: textoOpcional(datos.criterioDesempate),
      equivalenciasAplicadas: textoOpcional(datos.equivalenciasAplicadas),
      observaciones: textoOpcional(datos.observaciones),
    });
  };

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
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Justificación de la selección
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {precargado &&
          'Los campos traen la justificación que enviaste; ajústala antes de volver a enviarla. '}
        Lo que escribas se guarda como borrador en este navegador hasta que envíes la matriz al
        líder.
      </Typography>

      <GebForm
        form={form}
        onSubmit={manejarEnvio}
        erroresServidor={erroresServidor}
        deshabilitado={enviando}
      >
        <Stack spacing={2}>
          <CampoTextoLargo name="fortalezas" label="Fortalezas" maximo={2000} requerido />
          <CampoTextoLargo
            name="oportunidadesDesarrollo"
            label="Oportunidades de desarrollo"
            maximo={2000}
          />
          <CampoTextoLargo
            name="criterioDesempate"
            label="Criterio de desempate"
            maximo={1000}
            requerido={hayEmpate}
            filasMinimas={2}
            ayuda={
              hayEmpate
                ? 'Obligatorio: este candidato empata en puntaje con otro.'
                : 'Solo es obligatorio si hay empate de puntaje entre candidatos.'
            }
          />
          <CampoTextoLargo
            name="equivalenciasAplicadas"
            label="Equivalencias aplicadas"
            maximo={1000}
            filasMinimas={2}
          />
          <CampoTextoLargo name="observaciones" label="Observaciones" maximo={2000} />

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}
          >
            {hayBorrador && (
              <Button type="button" onClick={descartarBorrador}>
                Descartar borrador
              </Button>
            )}
            {onCancelar && (
              <Button type="button" onClick={onCancelar}>
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="contained">
              Enviar al líder
            </Button>
          </Stack>
        </Stack>
      </GebForm>

      <ModalConfirmarEnvioMatriz
        abierto={confirmacionAbierta}
        posicion={posicion}
        nombre={nombreCandidato(fila)}
        total={fila.resultado.total}
        reemplazaObjetado={reemplazaObjetado}
        enviando={enviando}
        error={errorEnvio}
        onCancelar={onCancelarEnvio}
        onConfirmar={onConfirmarEnvio}
      />
    </Box>
  );
}
