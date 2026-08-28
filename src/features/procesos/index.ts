export { PaginaProcesos } from './paginas/PaginaProcesos';
export { PaginaProcesosReclutador } from './paginas/PaginaProcesosReclutador';
export { PaginaProcesosLider } from './paginas/PaginaProcesosLider';
export * from './api/vacantes';
export * from './api/candidatos';
export * from './api/prefiltro';
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
export { ETIQUETA_ESTADO_PROCESO, etiquetaEstado } from './logica/etiquetasEstado';
export { formatearFecha, SIN_FECHA } from './logica/formatoFecha';
export { aPaginaServidor, aPaginaTabla } from './logica/paginacion';
export { resumenEtapaVacante, etiquetaEstadoVacante } from './logica/resumenEtapaVacante';

// Componentes reutilizables por los pasos siguientes del pipeline.
export { LayoutPasoPipeline, type LayoutPasoPipelineProps } from './components/LayoutPasoPipeline';
export { PasoEnConstruccion } from './components/PasoEnConstruccion';
export { IndicadorAfinidad } from './components/IndicadorAfinidad';
export { colorAfinidad } from './logica/afinidad';

// Hooks de datos y de interacción.
export { usePeticion, type EstadoPeticion } from './hooks/usePeticion';
export { useVacantes } from './hooks/useVacantes';
export { useDetalleVacante } from './hooks/useDetalleVacante';
export { useCandidatosEtapa } from './hooks/useCandidatosEtapa';
export { useDetalleCandidato } from './hooks/useDetalleCandidato';
export { useSeleccionMultiple, type SeleccionMultiple } from './hooks/useSeleccionMultiple';
export {
  useEnviarPrefiltro,
  type ResultadoEnvioPrefiltro,
  type FalloPrefiltro,
} from './hooks/useEnviarPrefiltro';
