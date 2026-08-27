import { useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { GebEmptyState } from '@geb/ui';
import { useClienteApi } from '../../../shared/api/clienteApi';
import type { VacanteResumen } from '../api/vacantes';
import type { CandidatoResumen } from '../api/candidatos';
import { useVacantes } from '../hooks/useVacantes';
import { useDetalleVacante } from '../hooks/useDetalleVacante';
import { usePipeline } from '../hooks/usePipeline';
import { useCandidatosEtapa } from '../hooks/useCandidatosEtapa';
import { useDetalleCandidato } from '../hooks/useDetalleCandidato';
import { useSeleccionMultiple } from '../hooks/useSeleccionMultiple';
import { useEnviarPrefiltro } from '../hooks/useEnviarPrefiltro';
import { esEtapaOperativa, resolverEtapaOperativa } from '../logica/mapaEstadosPorEtapa';
import { subpasosDeEtapa } from '../logica/subpasosPorEtapa';
import { TablaVacantes } from '../components/TablaVacantes';
import { BarraSeleccionVacante } from '../components/BarraSeleccionVacante';
import { TarjetaDetalleVacante } from '../components/TarjetaDetalleVacante';
import { RailPipeline } from '../components/RailPipeline';
import { SubnavPasosEtapa } from '../components/SubnavPasosEtapa';
import { LayoutPasoPipeline } from '../components/LayoutPasoPipeline';
import { ListaRankingCandidatos } from '../components/ListaRankingCandidatos';
import { BarraAccionPrefiltro } from '../components/BarraAccionPrefiltro';
import { ModalConfirmarPrefiltro } from '../components/ModalConfirmarPrefiltro';
import { ResultadoSelecta } from '../components/ResultadoSelecta';
import { PasoEnConstruccion } from '../components/PasoEnConstruccion';

const TAMANO_PAGINA = 20;

/**
 * Pantalla "Procesos" del reclutador: tabla de vacantes → detalle de la
 * vacante → rail del pipeline dinámico → layout de dos columnas con la etapa
 * de ranking operativa (lista de candidatos por afinidad + resultado Selecta) y
 * la acción de prefiltro telefónico. Las demás etapas son navegables pero
 * muestran un placeholder. El estado (vacante → etapa → sub-paso → candidato)
 * vive en el componente; cambiar de etapa o de candidato no cambia de ruta.
 */
export function PaginaProcesosReclutador() {
  const clienteApi = useClienteApi();

  const [busqueda, setBusqueda] = useState('');
  const [paginaVacantes, setPaginaVacantes] = useState(0);
  const [vacanteId, setVacanteId] = useState<string | null>(null);
  // Etapa elegida explícitamente por el reclutador; si es `null` se usa la
  // etapa operativa que resuelve el pipeline (se deriva, sin efectos).
  const [etapaClaveManual, setEtapaClaveManual] = useState<string | null>(null);
  const [subPaso, setSubPaso] = useState<string | null>(null);
  const [paginaCandidatos, setPaginaCandidatos] = useState(0);
  const [candidatoId, setCandidatoId] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const vacantes = useVacantes(clienteApi, {
    pagina: paginaVacantes,
    tamanoPagina: TAMANO_PAGINA,
    busqueda,
  });
  const detalleVacante = useDetalleVacante(clienteApi, vacanteId);
  const pipeline = usePipeline(clienteApi, vacanteId);

  const seleccion = useSeleccionMultiple();
  const envio = useEnviarPrefiltro(clienteApi);

  const etapaClave = useMemo(() => {
    if (etapaClaveManual && pipeline.datos?.some((etapa) => etapa.clave === etapaClaveManual)) {
      return etapaClaveManual;
    }
    return resolverEtapaOperativa(pipeline.datos)?.clave ?? null;
  }, [etapaClaveManual, pipeline.datos]);

  const candidatos = useCandidatosEtapa(clienteApi, {
    jobRequisitionId: vacanteId,
    etapaClave,
    pagina: paginaCandidatos,
    tamanoPagina: TAMANO_PAGINA,
  });
  const detalleCandidato = useDetalleCandidato(clienteApi, candidatoId);

  const seleccionarVacante = useCallback(
    (vacante: VacanteResumen) => {
      setVacanteId(vacante.jobRequisitionId);
      setEtapaClaveManual(null);
      setSubPaso(null);
      setCandidatoId(null);
      setPaginaCandidatos(0);
      seleccion.limpiar();
    },
    [seleccion],
  );

  const seleccionarEtapa = useCallback(
    (clave: string) => {
      setEtapaClaveManual(clave);
      setSubPaso(null);
      setCandidatoId(null);
      setPaginaCandidatos(0);
      seleccion.limpiar();
    },
    [seleccion],
  );

  const buscarVacantes = useCallback((texto: string) => {
    setBusqueda(texto);
    setPaginaVacantes(0);
  }, []);

  const subpasos = subpasosDeEtapa(etapaClave);
  const subPasoActivo = subPaso ?? subpasos[0]?.clave ?? null;
  const subPasoActual = subpasos.find((paso) => paso.clave === subPasoActivo) ?? null;
  const etapaOperativa = esEtapaOperativa(etapaClave);
  const mostrarRanking =
    etapaOperativa && (subpasos.length === 0 || (subPasoActual?.operativo ?? false));

  const candidatosPagina: CandidatoResumen[] = useMemo(
    () => candidatos.datos?.data ?? [],
    [candidatos.datos],
  );
  const seleccionados = useMemo(
    () => candidatosPagina.filter((c) => seleccion.seleccionados.has(c.jobApplicationId)),
    [candidatosPagina, seleccion.seleccionados],
  );

  const confirmarPrefiltro = useCallback(async () => {
    await envio.enviar(seleccion.ids);
    seleccion.limpiar();
    candidatos.recargar();
  }, [envio, seleccion, candidatos]);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    envio.reiniciar();
  }, [envio]);

  const nombreVacante = detalleVacante.datos?.titulo ?? null;

  const columnaIzquierda = () => {
    if (!vacanteId) {
      return <GebEmptyState titulo="Selecciona una vacante para ver su pipeline" />;
    }
    if (mostrarRanking) {
      return (
        <Box>
          <BarraAccionPrefiltro
            cantidadSeleccionados={seleccion.cantidad}
            onAbrirConfirmacion={() => setModalAbierto(true)}
            onLimpiar={seleccion.limpiar}
          />
          <ListaRankingCandidatos
            respuesta={candidatos.datos}
            cargando={candidatos.cargando}
            error={candidatos.error}
            pagina={paginaCandidatos}
            tamanoPagina={TAMANO_PAGINA}
            estaSeleccionado={seleccion.estaSeleccionado}
            onAlternarSeleccion={seleccion.alternar}
            onCambioPagina={(p) => setPaginaCandidatos(p)}
            onClickCandidato={(candidato) => setCandidatoId(candidato.jobApplicationId)}
            onReintentar={candidatos.recargar}
          />
        </Box>
      );
    }
    return <PasoEnConstruccion nombre={subPasoActual?.nombre ?? undefined} />;
  };

  const columnaDerecha = () => {
    if (!mostrarRanking) {
      return <GebEmptyState titulo="Sin información para este paso" />;
    }
    return (
      <ResultadoSelecta
        candidato={detalleCandidato.datos}
        cargando={detalleCandidato.cargando}
        error={detalleCandidato.error}
        onReintentar={detalleCandidato.recargar}
      />
    );
  };

  return (
    <Stack spacing={2}>
      <TablaVacantes
        respuesta={vacantes.datos}
        cargando={vacantes.cargando}
        error={vacantes.error}
        pagina={paginaVacantes}
        tamanoPagina={TAMANO_PAGINA}
        onCambioPagina={(p) => setPaginaVacantes(p)}
        onBuscar={buscarVacantes}
        onSeleccionar={seleccionarVacante}
        onReintentar={vacantes.recargar}
      />

      {vacanteId && (
        <>
          <BarraSeleccionVacante nombreVacante={nombreVacante} />
          <TarjetaDetalleVacante
            detalle={detalleVacante.datos}
            cargando={detalleVacante.cargando}
            error={detalleVacante.error}
            onReintentar={detalleVacante.recargar}
          />
          <RailPipeline
            pipeline={pipeline.datos}
            cargando={pipeline.cargando}
            error={pipeline.error}
            etapaActivaClave={etapaClave}
            onSeleccionarEtapa={(etapa) => seleccionarEtapa(etapa.clave)}
            onReintentar={pipeline.recargar}
          />
          <SubnavPasosEtapa
            etapaClave={etapaClave}
            subPasoActivo={subPasoActivo}
            onSeleccionarSubPaso={setSubPaso}
          />
          <LayoutPasoPipeline izquierda={columnaIzquierda()} derecha={columnaDerecha()} />
        </>
      )}

      <ModalConfirmarPrefiltro
        abierto={modalAbierto}
        seleccionados={seleccionados}
        enviando={envio.enviando}
        progreso={envio.progreso}
        resultado={envio.resultado}
        onCancelar={cerrarModal}
        onConfirmar={confirmarPrefiltro}
        onCerrar={cerrarModal}
      />
    </Stack>
  );
}
