export { PaginaProcesos } from './paginas/PaginaProcesos';
export { PaginaProcesosReclutador } from './paginas/PaginaProcesosReclutador';
export { PaginaProcesosLider } from './paginas/PaginaProcesosLider';
export { PaginaDetalleCandidato } from './paginas/PaginaDetalleCandidato';
export * from './api/vacantes';
export * from './api/candidatos';
export * from './api/prefiltro';
export * from './api/catalogos';
export * from './api/entrevistas';
export * from './api/oferta';
export * from './api/bandejas';
export * from './api/serializacion';

// Lógica de derivación de la vista de Procesos.
export {
  CLAVE_ETAPA_RANKING,
  ESTADOS_POR_ETAPA,
  estadosDeEtapa,
  esEtapaOperativa,
  esPasoSelecta,
} from './logica/mapaEstadosPorEtapa';
// Pipeline del reclutador: fases SAP y pasos internos.
export {
  PASOS_PIPELINE,
  FASES_SAP,
  PASO_INICIAL,
  nombrePaso,
  type PasoPipeline,
  type FaseSap,
} from './logica/pipelineReclutador';
export { URL_SUCCESSFACTORS, abrirSuccessFactors } from './logica/successFactors';
export {
  ETIQUETA_ESTADO_PROCESO,
  etiquetaEstado,
  colorEstado,
  colorPorCategoria,
  resolverEtiquetaEstado,
  resolverColorEstado,
  type ColorChipEstado,
} from './logica/etiquetasEstado';
export { formatearFecha, formatearFechaHora, SIN_FECHA } from './logica/formatoFecha';
export { descripcionMatch } from './logica/descripcionMatch';
export { construirLineaTiempo, type HitoProceso } from './logica/lineaTiempoProceso';
export { aPaginaServidor, aPaginaTabla } from './logica/paginacion';
export { resumenEtapaVacante, etiquetaEstadoVacante } from './logica/resumenEtapaVacante';

// Componentes reutilizables por los pasos siguientes del pipeline.
export { LayoutPasoPipeline, type LayoutPasoPipelineProps } from './components/LayoutPasoPipeline';
export { PasoEnConstruccion } from './components/PasoEnConstruccion';
export { IndicadorAfinidad } from './components/IndicadorAfinidad';
export { colorAfinidad } from './logica/afinidad';

// Componentes de la subpágina de detalle del candidato.
export { Metrica, ListaTexto } from './components/PiezasAfinidad';
export { MigasDetalleCandidato } from './components/MigasDetalleCandidato';
export { LayoutDetalleCandidato } from './components/LayoutDetalleCandidato';
export { TarjetaPerfilCandidato } from './components/TarjetaPerfilCandidato';
export { TarjetaMatchIa } from './components/TarjetaMatchIa';
export { InformacionPrefiltro } from './components/InformacionPrefiltro';
export { LineaTiempoProceso } from './components/LineaTiempoProceso';
export { EmbudoProceso } from './components/EmbudoProceso';
export { SeguimientoTerceros } from './components/SeguimientoTerceros';

// Hooks de datos y de interacción.
export { usePeticion, type EstadoPeticion } from './hooks/usePeticion';
export { useVacantes } from './hooks/useVacantes';
export { useDetalleVacante } from './hooks/useDetalleVacante';
export { useCandidatosEtapa } from './hooks/useCandidatosEtapa';
export { useDetalleCandidato } from './hooks/useDetalleCandidato';
export { useHistorialCandidato } from './hooks/useHistorialCandidato';
export { usePrefiltroCandidato } from './hooks/usePrefiltroCandidato';
export { usePipelineVacante } from './hooks/usePipelineVacante';
export { useCatalogoEstados, limpiarCacheCatalogoEstados } from './hooks/useCatalogoEstados';
export { useContextoOrigen, type ContextoOrigen } from './hooks/useContextoOrigen';
export { useSeleccionMultiple, type SeleccionMultiple } from './hooks/useSeleccionMultiple';
export {
  useEnviarPrefiltro,
  type ResultadoEnvioPrefiltro,
  type FalloPrefiltro,
} from './hooks/useEnviarPrefiltro';
