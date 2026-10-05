import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GebEmptyState } from '@geb/ui';
import { useClienteApi } from '../../../shared/api/clienteApi';
import { EncabezadoPagina } from '../../../shared/components/EncabezadoPagina';
import type { InformeIncognito } from '../api/bandejas';
import type { VacanteResumen } from '../api/vacantes';
import { useVacantesConInformesIncognito } from '../hooks/useVacantesConInformesIncognito';
import { useInformesIncognito } from '../hooks/useInformesIncognito';
import { useCandidatosEnRevisionLider } from '../hooks/useCandidatosEnRevisionLider';
import { useDecisionLider } from '../hooks/useDecisionLider';
import { useInformeIncognitoDirecto } from '../hooks/useInformeIncognitoDirecto';
import { GuiaEvaluacionInformes } from '../components/GuiaEvaluacionInformes';
import { TablaVacantesLider } from '../components/TablaVacantesLider';
import { TablaInformesIncognito } from '../components/TablaInformesIncognito';
import { ModalInformeIncognito } from '../components/ModalInformeIncognito';

/** Tamaño de página inicial de las dos tablas; el líder puede ajustarlo. */
const TAMANO_PAGINA_INICIAL = 5;

/**
 * Pantalla "Procesos" del portal del líder. Encabeza un bloque de título +
 * guía de evaluación y un banner de anonimización siempre visible; debajo, la
 * tabla de las vacantes que tienen informes incógnitos por revisar (con
 * buscador y su conteo) y, al seleccionar una, la lista paginada de esos
 * informes anonimizados. El ícono de ojo de cada fila abre el informe en un
 * modal (estado local, sin navegación) desde donde el líder aprueba o rechaza
 * al candidato. La vacante seleccionada se refleja en el query param
 * `?vacante`. Una notificación también puede llegar con `?candidato`: ese
 * caso pide el informe directo por `jobApplicationId` (sin pasar por la
 * tabla) y abre el modal apenas resuelve.
 */
export function PaginaProcesosLider() {
  const clienteApi = useClienteApi();
  const [searchParams, setSearchParams] = useSearchParams();

  const [paginaVacantes, setPaginaVacantes] = useState(0);
  const [tamanoPaginaVacantes, setTamanoPaginaVacantes] = useState(TAMANO_PAGINA_INICIAL);
  const [busquedaVacantes, setBusquedaVacantes] = useState('');
  const [vacanteId, setVacanteId] = useState<string | null>(
    () => searchParams.get('vacante') || null,
  );
  const [paginaInformes, setPaginaInformes] = useState(0);
  const [tamanoPaginaInformes, setTamanoPaginaInformes] = useState(TAMANO_PAGINA_INICIAL);
  const [informeSeleccionadoDeTabla, setInformeSeleccionadoDeTabla] =
    useState<InformeIncognito | null>(null);
  const [modalAbiertoDeTabla, setModalAbiertoDeTabla] = useState(false);
  const [jobApplicationIdDirecto, setJobApplicationIdDirecto] = useState<string | null>(null);

  const vacantes = useVacantesConInformesIncognito(
    clienteApi,
    paginaVacantes,
    tamanoPaginaVacantes,
    busquedaVacantes,
  );
  const informes = useInformesIncognito(
    clienteApi,
    vacanteId,
    paginaInformes,
    tamanoPaginaInformes,
  );
  const candidatosEnRevision = useCandidatosEnRevisionLider(clienteApi, vacanteId);
  const decisionLider = useDecisionLider(clienteApi);
  const informeDirecto = useInformeIncognitoDirecto(clienteApi, jobApplicationIdDirecto);

  // Detecta `?candidato` (llegada desde una notificación): selecciona la
  // vacante si cambió y dispara la carga directa del informe. El estado se
  // ajusta durante el propio render (no en un efecto) para reaccionar a
  // cambios de `searchParams` más allá del montaje — p. ej. abrir la campana
  // ya estando en esta misma página — sin disparar un round-trip adicional.
  const [candidatoParamProcesado, setCandidatoParamProcesado] = useState<string | null>(null);
  const candidatoParam = searchParams.get('candidato');
  if (candidatoParam && candidatoParam !== candidatoParamProcesado) {
    setCandidatoParamProcesado(candidatoParam);
    const vacanteParam = searchParams.get('vacante');
    if (vacanteParam && vacanteParam !== vacanteId) {
      setVacanteId(vacanteParam);
      setPaginaInformes(0);
    }
    setJobApplicationIdDirecto(candidatoParam);
  }

  // El informe/modal/aviso de la llegada directa se derivan en el propio
  // render a partir de `informeDirecto`, sin copiarlos a estado propio: nunca
  // quedan desincronizados de la petición en curso.
  const informeSeleccionado =
    jobApplicationIdDirecto !== null ? informeDirecto.datos : informeSeleccionadoDeTabla;
  const modalAbierto =
    jobApplicationIdDirecto !== null ? informeDirecto.datos !== null : modalAbiertoDeTabla;
  const avisoInformeNoListo =
    jobApplicationIdDirecto !== null && informeDirecto.error?.problem.status === 409;

  // Limpia `?candidato` una vez la carga directa resuelve (éxito o error),
  // para que un refresh de página no vuelva a dispararla. Solo sincroniza con
  // el router — no fija estado propio — así que puede vivir en un efecto.
  useEffect(() => {
    if (jobApplicationIdDirecto === null) return;
    if (informeDirecto.cargando) return;
    if (informeDirecto.datos === null && informeDirecto.error === null) return;

    setSearchParams(
      (previos) => {
        const siguiente = new URLSearchParams(previos);
        siguiente.delete('candidato');
        return siguiente;
      },
      { replace: true },
    );
  }, [
    jobApplicationIdDirecto,
    informeDirecto.cargando,
    informeDirecto.datos,
    informeDirecto.error,
    setSearchParams,
  ]);

  const buscarVacantes = useCallback((texto: string) => {
    setBusquedaVacantes(texto);
    setPaginaVacantes(0);
  }, []);

  const seleccionarVacante = useCallback(
    (vacante: VacanteResumen) => {
      setVacanteId(vacante.jobRequisitionId);
      setPaginaInformes(0);
      setSearchParams({ vacante: vacante.jobRequisitionId }, { replace: true });
    },
    [setSearchParams],
  );

  const cambioPaginaVacantes = useCallback((pagina: number, tamano: number) => {
    setPaginaVacantes(pagina);
    setTamanoPaginaVacantes(tamano);
  }, []);

  const cambioPaginaInformes = useCallback((pagina: number, tamano: number) => {
    setPaginaInformes(pagina);
    setTamanoPaginaInformes(tamano);
  }, []);

  const verInforme = useCallback((informe: InformeIncognito) => {
    setJobApplicationIdDirecto(null);
    setInformeSeleccionadoDeTabla(informe);
    setModalAbiertoDeTabla(true);
  }, []);

  // Solo se baja la bandera: el informe se conserva para que el contenido no
  // parpadee durante la animación de cierre; la próxima apertura lo reemplaza.
  // También libera el `jobApplicationId` directo, para que la próxima
  // apertura desde la tabla vuelva a resolverlo por alias.
  const cerrarModal = useCallback(() => {
    setModalAbiertoDeTabla(false);
    setJobApplicationIdDirecto(null);
  }, []);

  const jobApplicationId =
    jobApplicationIdDirecto ??
    candidatosEnRevision.mapa.get(informeSeleccionado?.alias ?? '') ??
    null;

  const decidir = useCallback(
    async (decision: 'APRUEBA' | 'RECHAZA', motivo?: string, comentario?: string) => {
      if (jobApplicationId === null) return;
      const resultado = await decisionLider.decidir(jobApplicationId, decision, motivo, comentario);
      if (resultado) {
        setModalAbiertoDeTabla(false);
        setJobApplicationIdDirecto(null);
        informes.recargar();
        candidatosEnRevision.recargar();
      }
    },
    [jobApplicationId, decisionLider, informes, candidatosEnRevision],
  );

  return (
    // `contain: inline-size` fija el ancho de la página al del viewport; el
    // contenido ancho scrollea dentro de cada componente, no de la página.
    <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0, contain: 'inline-size' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <EncabezadoPagina
          eyebrow="Gestión de procesos"
          titulo="Informe Incógnito"
          subtitulo="Evaluación libre de sesgos — la identidad se revela solo tras su decisión."
        />
        <GuiaEvaluacionInformes />
      </Stack>

      <Alert severity="info">
        <AlertTitle sx={{ fontWeight: 700 }}>Evaluación libre de sesgos</AlertTitle>
        La información presentada está anonimizada. La identidad de la persona candidata permanecerá
        oculta hasta finalizar su decisión.
      </Alert>

      {avisoInformeNoListo && (
        <Alert severity="warning" onClose={() => setJobApplicationIdDirecto(null)}>
          El informe de este candidato aún no está listo para revisión.
        </Alert>
      )}

      <Typography variant="body2">
        Sus vacantes con finalistas asignados — seleccione una para evaluar sus informes:
      </Typography>

      <TablaVacantesLider
        respuesta={vacantes.datos}
        cargando={vacantes.cargando}
        error={vacantes.error}
        pagina={paginaVacantes}
        tamanoPagina={tamanoPaginaVacantes}
        vacanteSeleccionadaId={vacanteId}
        onCambioPagina={cambioPaginaVacantes}
        onBuscar={buscarVacantes}
        onSeleccionar={seleccionarVacante}
        onReintentar={vacantes.recargar}
      />

      {vacanteId ? (
        <Stack spacing={1.5} sx={{ pt: 3 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Informes anonimizados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Haga clic en el ícono de ojo para revisar y decidir
            </Typography>
          </Stack>
          <TablaInformesIncognito
            respuesta={informes.datos}
            cargando={informes.cargando}
            error={informes.error}
            pagina={paginaInformes}
            tamanoPagina={tamanoPaginaInformes}
            onCambioPagina={cambioPaginaInformes}
            onVerInforme={verInforme}
            onReintentar={informes.recargar}
          />
        </Stack>
      ) : (
        <GebEmptyState titulo="Selecciona una vacante para ver sus informes." />
      )}

      <ModalInformeIncognito
        abierto={modalAbierto}
        informe={informeSeleccionado}
        jobApplicationId={jobApplicationId}
        enviando={decisionLider.enviando}
        error={decisionLider.error}
        onDecidir={decidir}
        onCerrar={cerrarModal}
      />
    </Stack>
  );
}
