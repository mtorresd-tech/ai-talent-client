import { useState } from 'react';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ApiError } from '@geb/api-client';
import type { MatrizSeleccion, SeleccionMatrizRequest } from '../api/matriz';
import { interpretarErrorSeleccion } from '../logica/erroresMatriz';
import { esElegible, estadoEnvioMatriz } from '../logica/estadoEnvioMatriz';
import { BarraCandidatoMatriz } from './BarraCandidatoMatriz';
import { EstadoError } from './EstadoError';
import { FormularioJustificacionMatriz } from './FormularioJustificacionMatriz';
import { RecuadroMatriz } from './RecuadroMatriz';
import { ResumenSeleccionMatriz } from './ResumenSeleccionMatriz';
import { TablaMatrizSeleccion } from './TablaMatrizSeleccion';

export interface PanelMatrizSeleccionProps {
  matriz: MatrizSeleccion | null;
  cargando: boolean;
  error: ApiError | null;
  onReintentar: () => void;

  /** Candidato elegido en la tabla; `null` si no hay ninguno. */
  candidatoActivoId: string | null;
  onSeleccionarCandidato: (jobApplicationId: string) => void;
  /** Cambia cada vez que se guarda o descarta un borrador, para recalcular el estado de la barra. */
  versionBorradores?: number;

  /** Justificación validada a la espera de confirmación; mientras exista, el modal está abierto. */
  solicitudEnvio: SeleccionMatrizRequest | null;
  enviandoSeleccion: boolean;
  errorSeleccion: ApiError | null;
  /** `true` tras un envío exitoso, para mostrar la confirmación. */
  envioExitoso: boolean;
  onSolicitarEnvio: (datos: SeleccionMatrizRequest) => void;
  onCancelarEnvio: () => void;
  onConfirmarEnvio: () => void;
  onCambioBorrador?: () => void;
}

/**
 * Paso "Matriz de selección" a todo el ancho, en una sola pila: aviso y
 * resumen del envío al líder, tabla comparativa (donde se elige el candidato)
 * con su configuración en solo lectura y la barra del candidato activo. El formulario
 * de justificación (o la justificación enviada) solo se despliega bajo demanda
 * desde la barra, y se pliega al cambiar de candidato o tras un envío exitoso.
 */
export function PanelMatrizSeleccion({
  matriz,
  cargando,
  error,
  onReintentar,
  candidatoActivoId,
  onSeleccionarCandidato,
  solicitudEnvio,
  enviandoSeleccion,
  errorSeleccion,
  envioExitoso,
  onSolicitarEnvio,
  onCancelarEnvio,
  onConfirmarEnvio,
  onCambioBorrador,
}: PanelMatrizSeleccionProps) {
  const [abierto, setAbierto] = useState(false);
  // Se pliega al cambiar de candidato y cuando un envío termina con éxito; se
  // ajusta durante el render para no mostrar un cuadro con el estado anterior.
  const [previo, setPrevio] = useState({ candidato: candidatoActivoId, exito: envioExitoso });
  if (previo.candidato !== candidatoActivoId || previo.exito !== envioExitoso) {
    if (previo.candidato !== candidatoActivoId || envioExitoso) setAbierto(false);
    setPrevio({ candidato: candidatoActivoId, exito: envioExitoso });
  }

  if (error) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (!matriz) {
    return <LinearProgress aria-label="Cargando matriz de selección" />;
  }

  const estado = estadoEnvioMatriz(matriz);
  const indiceActivo = matriz.candidatos.findIndex(
    (fila) => fila.jobApplicationId === candidatoActivoId,
  );
  const filaActiva = indiceActivo === -1 ? null : matriz.candidatos[indiceActivo];
  const posicionActiva = indiceActivo + 1;
  const hayCandidatos = matriz.candidatos.length > 0;
  // Tras una objeción, el objetado vigente se puede volver a enviar con su justificación precargada.
  const esObjetadoVigente =
    estado === 'OBJETADA' &&
    filaActiva !== null &&
    matriz.seleccion?.jobApplicationId === filaActiva.jobApplicationId;
  const sinElegibles =
    estado === 'OBJETADA' && !matriz.candidatos.some((fila) => esElegible(matriz, fila));

  const errorEnvio = errorSeleccion ? interpretarErrorSeleccion(errorSeleccion) : null;
  // Los errores que obligan a recargar se muestran en el panel: tras la recarga el
  // formulario puede dejar de aplicar al candidato. El de desempate va al campo.
  const avisoErrorEnvio = errorEnvio?.recargar && errorEnvio.campo === null ? errorEnvio : null;
  // Lo que se muestra arriba de la matriz va en un solo recuadro, si hay algo:
  // un error de envío o, una vez enviada, el resumen del envío.
  const hayInformacionSuperior = Boolean(avisoErrorEnvio) || estado !== 'ABIERTA';
  const errorDesempate = errorEnvio?.campo === 'criterioDesempate' ? errorEnvio.mensaje : null;
  const errorModal = errorEnvio && !errorEnvio.recargar ? errorEnvio : null;

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      {cargando && <LinearProgress aria-label="Actualizando matriz de selección" />}

      {hayInformacionSuperior && (
        <RecuadroMatriz etiqueta="Envío al líder">
          <Stack spacing={1.5} sx={{ minWidth: 0 }}>
            {envioExitoso && estado !== 'ABIERTA' && (
              <Alert severity="success">Matriz enviada al líder.</Alert>
            )}

            {avisoErrorEnvio && (
              <Alert severity="error">
                {avisoErrorEnvio.mensaje}
                {avisoErrorEnvio.idCorrelacion
                  ? ` (ID de correlación: ${avisoErrorEnvio.idCorrelacion})`
                  : ''}
              </Alert>
            )}

            <ResumenSeleccionMatriz matriz={matriz} />

            {sinElegibles && (
              <Alert severity="warning">
                No hay candidatos con la calificación completa para elegir.
              </Alert>
            )}
          </Stack>
        </RecuadroMatriz>
      )}

      <TablaMatrizSeleccion
        matriz={matriz}
        candidatoActivoId={candidatoActivoId}
        onSeleccionarCandidato={onSeleccionarCandidato}
      />

      {hayCandidatos && !filaActiva && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Elige un candidato de la matriz.
        </Typography>
      )}

      {filaActiva && (
        <BarraCandidatoMatriz
          matriz={matriz}
          fila={filaActiva}
          abierto={abierto}
          onAbrir={() => setAbierto(true)}
          onCerrar={() => setAbierto(false)}
          formulario={
            <FormularioJustificacionMatriz
              key={`${matriz.jobRequisitionId}:${filaActiva.jobApplicationId}`}
              jobRequisitionId={matriz.jobRequisitionId}
              fila={filaActiva}
              posicion={posicionActiva}
              candidatos={matriz.candidatos}
              reemplazaObjetado={estado === 'OBJETADA' && !esObjetadoVigente}
              justificacionEnviada={esObjetadoVigente ? matriz.seleccion : null}
              confirmacionAbierta={solicitudEnvio?.jobApplicationId === filaActiva.jobApplicationId}
              enviando={enviandoSeleccion}
              errorEnvio={errorModal}
              errorDesempate={errorDesempate}
              onSolicitarEnvio={onSolicitarEnvio}
              onCancelarEnvio={onCancelarEnvio}
              onConfirmarEnvio={onConfirmarEnvio}
              onCambioBorrador={onCambioBorrador}
              onCancelar={() => setAbierto(false)}
            />
          }
        />
      )}
    </Stack>
  );
}
