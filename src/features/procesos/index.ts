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
export * from './api/matriz';

// Lógica de derivación de la vista de Procesos.
export {
  CLAVE_ETAPA_RANKING,
  CLAVE_ETAPA_ANONIMIZACION,
  CLAVE_ETAPA_MATRIZ,
  ESTADOS_POR_ETAPA,
  estadosDeEtapa,
  esEtapaOperativa,
  esPasoSelecta,
  esPasoAnonimizacion,
  esPasoMatriz,
  tipoPanelPaso,
  type TipoPanelPaso,
} from './logica/mapaEstadosPorEtapa';
export {
  estadoCandidatoMatriz,
  posicionesMatriz,
  ETIQUETA_ESTADO_CANDIDATO_MATRIZ,
  ESTADO_REGISTRO_CANDIDATO_MATRIZ,
  MATRIZ_SIN_PUNTAJES,
  type EstadoCandidatoMatriz,
} from './logica/candidatosMatriz';
export { hayEmpateDeTotal } from './logica/empateMatriz';
export {
  estadoEnvioMatriz,
  idsObjetados,
  objecionDe,
  esElegible,
  puedeEnviar,
  type EstadoEnvioMatriz,
  type ObjecionCandidatoMatriz,
} from './logica/estadoEnvioMatriz';
export { interpretarErrorSeleccion, type ErrorMatriz } from './logica/erroresMatriz';
export {
  leerBorrador,
  guardarBorrador,
  eliminarBorrador,
  eliminarBorradoresDeVacante,
  limpiarBorradoresJustificacionMatriz,
  type BorradorJustificacionMatriz,
} from './logica/borradorJustificacionMatriz';
export {
  colorFondoMatriz,
  colorTextoMatriz,
  coloresConfiguracionMatriz,
  colorFilaActiva,
  colorBordeFilaActiva,
  colorFilaEnviada,
  colorFilaObjetada,
  colorIconoEnviado,
  colorTextoObjetado,
  colorIconoObjecion,
  type BloqueMatriz,
  type NivelColorMatriz,
  type ColoresConfiguracionMatriz,
} from './logica/coloresMatriz';
export { formatearPeso, formatearPuntaje } from './logica/formatoMatriz';
export {
  describirEstadoRevisionLider,
  type ResumenRevisionLider,
} from './logica/seguimientoAnonimizacion';
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
export { DistintivoTipoCandidato } from './components/DistintivoTipoCandidato';
export { EstadoSincronizacionSfsf } from './components/EstadoSincronizacionSfsf';
export { SeguimientoAnonimizacion } from './components/SeguimientoAnonimizacion';

// Componentes de la matriz de selección.
export { TablaMatrizSeleccion } from './components/TablaMatrizSeleccion';
export { FormularioJustificacionMatriz } from './components/FormularioJustificacionMatriz';
export { CampoTextoLargo } from './components/CampoTextoLargo';
export { ModalConfirmarEnvioMatriz } from './components/ModalConfirmarEnvioMatriz';
export {
  ResumenSeleccionMatriz,
  JustificacionEnviadaMatriz,
} from './components/ResumenSeleccionMatriz';
export { BarraCandidatoMatriz } from './components/BarraCandidatoMatriz';
export { RecuadroMatriz } from './components/RecuadroMatriz';
export type { RecuadroMatrizProps } from './components/RecuadroMatriz';
export { PanelMatrizSeleccion } from './components/PanelMatrizSeleccion';

// Hooks de datos y de interacción.
export { usePeticion, type EstadoPeticion } from './hooks/usePeticion';
export { useVacantes } from './hooks/useVacantes';
export { useDetalleVacante } from './hooks/useDetalleVacante';
export { useCandidatosEtapa } from './hooks/useCandidatosEtapa';
export { useMatriz, type EstadoMatriz } from './hooks/useMatriz';
export {
  useSeleccionarCandidatoMatriz,
  type SeleccionarCandidatoMatriz,
  type ResultadoSeleccionMatriz,
} from './hooks/useSeleccionarCandidatoMatriz';
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
export {
  useCandidatosEnRevisionLider,
  type CandidatosEnRevisionLider,
} from './hooks/useCandidatosEnRevisionLider';
export { useDecisionLider, type DecisionLider } from './hooks/useDecisionLider';
