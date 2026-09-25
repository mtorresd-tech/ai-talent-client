import type { GebApiClient } from '@geb/api-client';
import type { Compuerta } from '../../../shared/tipos/dominio';

export interface ResumenMetricas {
  /** Vacantes publicadas en el rango. */
  totalRequisiciones: number;
  /** De esas vacantes, candidatos que no llegaron a estado terminal. */
  candidatosActivos: number;
  /** Escala 0–100, ya lista para concatenar `%`. */
  tasaCierre: number;
}

export interface EmbudoSelecta {
  /** Candidatos que llegaron a `RANKING_SELECTA`. */
  propuestosSelecta: number;
  llegaronPrefiltroTelefonico: number;
  enviadosPrefiltroManual: number;
}

export interface DuracionEtapa {
  /** Igual a `EtapaPipeline`. */
  clave: string;
  /** Etiqueta legible. */
  nombre: string;
  promedioDias: number;
  medianaDias: number;
  /** Escala 0–100. */
  porcentajeDelTotal: number;
}

export interface ConteoPorTipoCandidato {
  /** Candidatos con `tipoCandidato = INTERNO`. */
  internos: number;
  /** Candidatos con `tipoCandidato = EXTERNO`. */
  externos: number;
}

export interface EfectividadEtapa {
  compuerta: Compuerta;
  aprobados: ConteoPorTipoCandidato;
  rechazados: ConteoPorTipoCandidato;
}

export interface ParametrosRangoFechas {
  desde?: string;
  hasta?: string;
}

/** Filtra por fecha de publicación de la vacante. */
export function obtenerResumenMetricas(
  clienteApi: GebApiClient,
  parametros: ParametrosRangoFechas = {},
  opciones: { signal?: AbortSignal } = {},
) {
  return clienteApi.get<ResumenMetricas>('/metricas/resumen', {
    params: parametros,
    signal: opciones.signal,
  });
}

/** Filtra por fecha de postulación. */
export function obtenerEmbudoMetricas(
  clienteApi: GebApiClient,
  parametros: ParametrosRangoFechas = {},
  opciones: { signal?: AbortSignal } = {},
) {
  return clienteApi.get<EmbudoSelecta>('/metricas/embudo', {
    params: parametros,
    signal: opciones.signal,
  });
}

/** Filtra por fecha de postulación. Devuelve siempre 6 elementos. */
export function obtenerDuracionEtapas(
  clienteApi: GebApiClient,
  parametros: ParametrosRangoFechas = {},
  opciones: { signal?: AbortSignal } = {},
) {
  return clienteApi.get<DuracionEtapa[]>('/metricas/duracion-etapas', {
    params: parametros,
    signal: opciones.signal,
  });
}

/** Filtra por fecha de decisión. */
export function obtenerEfectividadEtapa(
  clienteApi: GebApiClient,
  etapa: Compuerta,
  parametros: ParametrosRangoFechas = {},
  opciones: { signal?: AbortSignal } = {},
) {
  return clienteApi.get<EfectividadEtapa>(`/metricas/etapa/${etapa}`, {
    params: parametros,
    signal: opciones.signal,
  });
}
