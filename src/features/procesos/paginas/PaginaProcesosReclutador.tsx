import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { GebEmptyState } from '@geb/ui';
import { useClienteApi } from '../../../shared/api/clienteApi';
import type { VacanteResumen } from '../api/vacantes';
import type { CandidatoResumen } from '../api/candidatos';
import { useVacantes } from '../hooks/useVacantes';
import { useDetalleVacante } from '../hooks/useDetalleVacante';
import { useCandidatosEtapa } from '../hooks/useCandidatosEtapa';
import { useDetalleCandidato } from '../hooks/useDetalleCandidato';
import { useCandidatoFinal } from '../hooks/useCandidatoFinal';
import { useIntegracionesEtapa } from '../hooks/useIntegracionesEtapa';
import { usePrefiltroCandidato } from '../hooks/usePrefiltroCandidato';
import { useCatalogoEstados } from '../hooks/useCatalogoEstados';
import { useSeleccionMultiple } from '../hooks/useSeleccionMultiple';
import { useEnviarPrefiltro } from '../hooks/useEnviarPrefiltro';
import {
  esEtapaOperativa,
  esPasoOferta,
  panelTieneIntegracionProveedor,
  proveedorDePanel,
  tipoPanelPaso,
  type TipoPanelPaso,
} from '../logica/mapaEstadosPorEtapa';
import { mapaAtencionProveedor } from '../logica/atencionIntegraciones';
import { PASO_INICIAL, nombrePaso } from '../logica/pipelineReclutador';
import { abrirSuccessFactors } from '../logica/successFactors';
import { nombreProveedor } from '../../integraciones';
import { TablaVacantes } from '../components/TablaVacantes';
import { BarraSeleccionVacante } from '../components/BarraSeleccionVacante';
import { TarjetaDetalleVacante } from '../components/TarjetaDetalleVacante';
import { RailPipeline } from '../components/RailPipeline';
import { LayoutPasoPipeline } from '../components/LayoutPasoPipeline';
import { ListaRankingCandidatos } from '../components/ListaRankingCandidatos';
import { BarraAccionPrefiltro } from '../components/BarraAccionPrefiltro';
import { ModalConfirmarPrefiltro } from '../components/ModalConfirmarPrefiltro';
import { ResultadoSelecta } from '../components/ResultadoSelecta';
import { ResultadoPrefiltro } from '../components/ResultadoPrefiltro';
import { SeguimientoAnonimizacion } from '../components/SeguimientoAnonimizacion';
import { SeguimientoBluesite } from '../components/SeguimientoBluesite';
import { SeguimientoCosinte } from '../components/SeguimientoCosinte';
import { SeguimientoMedilaboral } from '../components/SeguimientoMedilaboral';
import { SeguimientoOferta } from '../components/SeguimientoOferta';
import { PasoEnConstruccion } from '../components/PasoEnConstruccion';

// `OFERTA` no tiene entrada aquí: no lista candidatos (un único recurso por
// vacante vía `candidato-final`), así que el mensaje de "lista vacía" de
// `ListaRankingCandidatos` no aplica a este paso.
/** Mensaje de "sin candidatos" por panel operativo; los paneles sin entrada usan el mensaje genérico de la tabla. */
const MENSAJE_VACIO_POR_PANEL: Partial<Record<NonNullable<TipoPanelPaso>, string>> = {
  ANONIMIZACION: 'No hay candidatos en anonimización para esta vacante.',
  BLUESITE: 'No hay candidatos en Bluesite para esta vacante.',
  COSINTE: 'No hay candidatos en Cosinte para esta vacante.',
  MEDILABORAL: 'No hay candidatos en Medilaboral para esta vacante.',
};

/** Tamaño de página inicial de las dos tablas; el reclutador puede ajustarlo. */
const TAMANO_PAGINA_INICIAL = 5;

/**
 * Pantalla "Procesos" del reclutador: tabla de vacantes → detalle de la
 * vacante → rail del pipeline (fases SAP + pasos internos) → layout de dos
 * columnas con el paso de ranking operativo (lista de candidatos por afinidad +
 * resultado Selecta) y la acción de prefiltro telefónico. El listado de
 * filtrados, la anonimización, Bluesite, Cosinte y Medilaboral también son
 * operativos (estos cuatro últimos de solo consulta); los demás pasos son
 * navegables con un placeholder. El último paso, Oferta, también es operativo
 * pero no lista candidatos: muestra el candidato final de la vacante en un
 * panel único de ancho completo, sin el layout de dos columnas.
 * La selección (vacante → paso → candidato) vive en el componente
 * y se refleja en los query params `?vacante&paso&candidato`, de modo que la
 * subpágina de detalle del candidato puede reconstruir el listado al volver.
 * La paginación y la búsqueda de las tablas no se reflejan en la URL.
 */
export function PaginaProcesosReclutador() {
  const clienteApi = useClienteApi();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [busqueda, setBusqueda] = useState('');
  const [paginaVacantes, setPaginaVacantes] = useState(0);
  const [tamanoPaginaVacantes, setTamanoPaginaVacantes] = useState(TAMANO_PAGINA_INICIAL);
  const [vacanteId, setVacanteId] = useState<string | null>(
    () => searchParams.get('vacante') || null,
  );
  // Paso elegido explícitamente por el reclutador; `null` → el paso inicial.
  const [pasoClaveManual, setPasoClaveManual] = useState<string | null>(
    () => searchParams.get('paso') || null,
  );
  const [paginaCandidatos, setPaginaCandidatos] = useState(0);
  const [tamanoPaginaCandidatos, setTamanoPaginaCandidatos] = useState(TAMANO_PAGINA_INICIAL);
  const [candidatoId, setCandidatoId] = useState<string | null>(
    () => searchParams.get('candidato') || null,
  );
  const [modalAbierto, setModalAbierto] = useState(false);

  const vacantes = useVacantes(clienteApi, {
    pagina: paginaVacantes,
    tamanoPagina: tamanoPaginaVacantes,
    busqueda,
  });
  const detalleVacante = useDetalleVacante(clienteApi, vacanteId);
  // El catálogo de estados se resuelve una sola vez por sesión (caché de módulo);
  // si falla, la lista y el panel caen al respaldo local sin bloquear la pantalla.
  const catalogoEstados = useCatalogoEstados(clienteApi);
  const catalogo = catalogoEstados.datos;

  const seleccion = useSeleccionMultiple();
  const envio = useEnviarPrefiltro(clienteApi);

  const pasoClave = pasoClaveManual ?? PASO_INICIAL;

  // Mantiene la selección en la URL (sin apilar entradas de historial) para que
  // la subpágina de detalle pueda reconstruir el listado al volver.
  useEffect(() => {
    const siguiente = new URLSearchParams();
    if (vacanteId) siguiente.set('vacante', vacanteId);
    if (pasoClaveManual) siguiente.set('paso', pasoClaveManual);
    if (candidatoId) siguiente.set('candidato', candidatoId);
    setSearchParams(siguiente, { replace: true });
  }, [vacanteId, pasoClaveManual, candidatoId, setSearchParams]);

  const irADetalleCandidato = useCallback(
    (jobApplicationId: string) => {
      const params = new URLSearchParams();
      if (vacanteId) params.set('vacante', vacanteId);
      params.set('paso', pasoClave);
      navigate(`/procesos/candidato/${jobApplicationId}?${params.toString()}`);
    },
    [navigate, vacanteId, pasoClave],
  );

  const candidatos = useCandidatosEtapa(clienteApi, {
    jobRequisitionId: vacanteId,
    etapaClave: pasoClave,
    pagina: paginaCandidatos,
    tamanoPagina: tamanoPaginaCandidatos,
  });
  const detalleCandidato = useDetalleCandidato(clienteApi, candidatoId);

  const seleccionarVacante = useCallback(
    (vacante: VacanteResumen) => {
      setVacanteId(vacante.jobRequisitionId);
      setPasoClaveManual(null);
      setCandidatoId(null);
      setPaginaCandidatos(0);
      seleccion.limpiar();
    },
    [seleccion],
  );

  const seleccionarPaso = useCallback(
    (clave: string) => {
      setPasoClaveManual(clave);
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

  const cambioPaginaVacantes = useCallback((pagina: number, tamano: number) => {
    setPaginaVacantes(pagina);
    setTamanoPaginaVacantes(tamano);
  }, []);

  const cambioPaginaCandidatos = useCallback((pagina: number, tamano: number) => {
    setPaginaCandidatos(pagina);
    setTamanoPaginaCandidatos(tamano);
  }, []);

  // `esPasoOferta` compensa que `OFERTA` no tiene entrada en `ESTADOS_POR_ETAPA`
  // (no lista candidatos, así que `esEtapaOperativa` por sí sola daría `false`).
  const operativa = esEtapaOperativa(pasoClave) || esPasoOferta(pasoClave);
  // Discrimina el panel derecho por tipo de paso: Selecta (afinidad), prefiltro
  // (listado de filtrados), anonimización (seguimiento al líder), Bluesite
  // (pruebas psicotécnicas), Cosinte (estudio de seguridad) o Medilaboral
  // (exámenes médicos).
  const panel = tipoPanelPaso(pasoClave);
  const esSelecta = panel === 'SELECTA';

  const prefiltroCandidato = usePrefiltroCandidato(
    clienteApi,
    panel === 'PREFILTRO' ? candidatoId : null,
  );
  // No depende de `candidatoId`: a diferencia de los demás paneles, Oferta no
  // lista candidatos ni tiene selección — un único recurso por vacante activa.
  const candidatoFinal = useCandidatoFinal(clienteApi, panel === 'OFERTA' ? vacanteId : null);
  // Se deriva del candidato final devuelto por el endpoint, no de `candidatoId`
  // (que no existe en este paso: no hay selección de lista).
  const onVerDetalleCompletoOferta = candidatoFinal.datos
    ? () => irADetalleCandidato(candidatoFinal.datos!.jobApplicationId)
    : undefined;
  // Solo un panel está activo a la vez: una única instancia del hook alcanza,
  // el proveedor consultado cambia con el panel activo (Bluesite, Cosinte o Medilaboral).
  const proveedorIntegracion = useMemo(() => proveedorDePanel(panel) ?? 'BLUESITE', [panel]);
  const integracionesEtapa = useIntegracionesEtapa(clienteApi, {
    jobRequisitionId: vacanteId,
    proveedor: proveedorIntegracion,
    habilitado: panelTieneIntegracionProveedor(panel),
  });
  const atencionPorCandidato = useMemo(
    () => mapaAtencionProveedor(integracionesEtapa.datos?.data ?? null, proveedorIntegracion),
    [integracionesEtapa.datos, proveedorIntegracion],
  );

  const candidatosPagina: CandidatoResumen[] = useMemo(
    () => candidatos.datos?.data ?? [],
    [candidatos.datos],
  );
  const seleccionados = useMemo(
    () => candidatosPagina.filter((c) => seleccion.seleccionados.has(c.jobApplicationId)),
    [candidatosPagina, seleccion.seleccionados],
  );

  const confirmarPrefiltro = useCallback(async () => {
    const resultado = await envio.enviar(seleccion.ids);
    seleccion.limpiar();
    candidatos.recargar();
    if (resultado.exitosos.length > 0) abrirSuccessFactors();
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
    if (!operativa) {
      return <PasoEnConstruccion nombre={nombrePaso(pasoClave) ?? undefined} />;
    }
    return (
      <Box>
        {esSelecta && (
          <BarraAccionPrefiltro
            cantidadSeleccionados={seleccion.cantidad}
            onAbrirConfirmacion={() => setModalAbierto(true)}
            onLimpiar={seleccion.limpiar}
          />
        )}
        <ListaRankingCandidatos
          respuesta={candidatos.datos}
          cargando={candidatos.cargando}
          error={candidatos.error}
          pagina={paginaCandidatos}
          tamanoPagina={tamanoPaginaCandidatos}
          variante={esSelecta ? 'selecta' : 'simple'}
          catalogo={catalogo}
          mensajeVacio={panel ? MENSAJE_VACIO_POR_PANEL[panel] : undefined}
          atencionPorCandidato={
            panelTieneIntegracionProveedor(panel) ? atencionPorCandidato : undefined
          }
          nombreProveedorAtencion={
            panelTieneIntegracionProveedor(panel)
              ? nombreProveedor(proveedorIntegracion)
              : undefined
          }
          estaSeleccionado={seleccion.estaSeleccionado}
          onAlternarSeleccion={seleccion.alternar}
          onCambioPagina={cambioPaginaCandidatos}
          onClickCandidato={(candidato) => setCandidatoId(candidato.jobApplicationId)}
          onVerDetalle={(candidato) => irADetalleCandidato(candidato.jobApplicationId)}
          onReintentar={candidatos.recargar}
        />
      </Box>
    );
  };

  const columnaDerecha = () => {
    if (!operativa) {
      return <GebEmptyState titulo="Sin información para este paso" />;
    }
    const onVerDetalleCompleto = candidatoId ? () => irADetalleCandidato(candidatoId) : undefined;

    switch (panel) {
      case 'PREFILTRO':
        return (
          <ResultadoPrefiltro
            candidato={detalleCandidato.datos}
            cargando={detalleCandidato.cargando}
            error={detalleCandidato.error}
            onReintentar={detalleCandidato.recargar}
            prefiltro={prefiltroCandidato.datos}
            cargandoPrefiltro={prefiltroCandidato.cargando}
            errorPrefiltro={prefiltroCandidato.error}
            onReintentarPrefiltro={prefiltroCandidato.recargar}
            onVerDetalleCompleto={onVerDetalleCompleto}
          />
        );
      case 'ANONIMIZACION':
        return (
          <SeguimientoAnonimizacion
            candidato={detalleCandidato.datos}
            cargando={detalleCandidato.cargando}
            error={detalleCandidato.error}
            onReintentar={detalleCandidato.recargar}
            catalogo={catalogo}
            onVerDetalleCompleto={onVerDetalleCompleto}
          />
        );
      case 'BLUESITE':
        return (
          <SeguimientoBluesite
            candidato={detalleCandidato.datos}
            cargando={detalleCandidato.cargando}
            error={detalleCandidato.error}
            onReintentar={detalleCandidato.recargar}
            catalogo={catalogo}
            onVerDetalleCompleto={onVerDetalleCompleto}
          />
        );
      case 'COSINTE':
        return (
          <SeguimientoCosinte
            candidato={detalleCandidato.datos}
            cargando={detalleCandidato.cargando}
            error={detalleCandidato.error}
            onReintentar={detalleCandidato.recargar}
            catalogo={catalogo}
            onVerDetalleCompleto={onVerDetalleCompleto}
          />
        );
      case 'MEDILABORAL':
        return (
          <SeguimientoMedilaboral
            candidato={detalleCandidato.datos}
            cargando={detalleCandidato.cargando}
            error={detalleCandidato.error}
            onReintentar={detalleCandidato.recargar}
            catalogo={catalogo}
            onVerDetalleCompleto={onVerDetalleCompleto}
          />
        );
      case 'OFERTA':
        return (
          <SeguimientoOferta
            candidato={candidatoFinal.datos}
            cargando={candidatoFinal.cargando}
            error={candidatoFinal.error}
            onReintentar={candidatoFinal.recargar}
            catalogo={catalogo}
            tituloVacante={nombreVacante}
            onVerDetalleCompleto={onVerDetalleCompletoOferta}
          />
        );
      default:
        return (
          <ResultadoSelecta
            candidato={detalleCandidato.datos}
            cargando={detalleCandidato.cargando}
            error={detalleCandidato.error}
            onReintentar={detalleCandidato.recargar}
            onVerDetalleCompleto={onVerDetalleCompleto}
          />
        );
    }
  };

  return (
    // `contain: inline-size` fija el ancho de la página al del viewport; el
    // contenido ancho scrollea dentro de cada componente, no de la página.
    <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0, contain: 'inline-size' }}>
      <TablaVacantes
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

      {vacanteId && (
        <>
          <BarraSeleccionVacante nombreVacante={nombreVacante} />
          <TarjetaDetalleVacante
            detalle={detalleVacante.datos}
            cargando={detalleVacante.cargando}
            error={detalleVacante.error}
            onReintentar={detalleVacante.recargar}
          />
          <RailPipeline pasoActivo={pasoClave} onSeleccionarPaso={seleccionarPaso} />
          {panel === 'OFERTA' ? (
            // Oferta no lista candidatos: panel único de ancho completo, sin
            // el layout maestro-detalle de `LayoutPasoPipeline`.
            <Box sx={{ minWidth: 0 }}>{columnaDerecha()}</Box>
          ) : (
            <LayoutPasoPipeline
              izquierda={columnaIzquierda()}
              derecha={columnaDerecha()}
              haySeleccion={candidatoId !== null && operativa}
              onVolver={() => setCandidatoId(null)}
            />
          )}
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
