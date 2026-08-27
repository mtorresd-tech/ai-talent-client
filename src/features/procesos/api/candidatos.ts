import type { GebApiClient } from '@geb/api-client';
import type {
  Compuerta,
  EstadoProceso,
  RespuestaPaginada,
  SincronizacionSfsf,
} from '../../../shared/tipos/dominio';
import type { EstadoIntegracion } from '../../integraciones';
import type { OpcionesPeticion } from './vacantes';
import { paramsSerializerEstado } from './serializacion';

export interface CandidatoResumen {
  jobApplicationId: string;
  jobRequisitionId: string;
  /** Identificador anónimo estable, p. ej. "Candidato 07". */
  alias: string;
  /** Ausente si la vista es anonimizada. */
  nombre: string | null;
  /** Ausente si la vista es anonimizada. */
  numeroDocumento: string | null;
  estado: EstadoProceso;
  estadoDesde: string;
  /** Estado tal como lo ve SFSF — informativo, el estado que gobierna el flujo es `estado`. */
  estadoSfsf: string | null;
  fechaPostulacion: string | null;
  origenPostulacion: string | null;
  scoreAfinidad: number | null;
  rankingPosicion: number | null;
  /** Falso si la compuerta actual está en política AUTOMATICA. */
  esperandoDecision: boolean;
  compuertaPendiente: Compuerta | null;
}

export interface DesgloseAfinidad {
  porcentajeTotal: number;
  porcentajeFortalezas: number | null;
  porcentajeExperiencia: number | null;
  porcentajeEstudios: number | null;
  fortalezas: string[];
  debilidades: string[];
  comentarios: string | null;
}

export interface CandidatoDetalle extends CandidatoResumen {
  desgloseAfinidad: DesgloseAfinidad;
  integraciones: EstadoIntegracion[];
  identidadRevelada: boolean;
  sincronizacionSfsf: SincronizacionSfsf;
}

export interface EventoHistorial {
  fecha: string;
  tipo: 'TRANSICION' | 'DECISION' | 'ERROR' | 'NOTIFICACION';
  estadoAnterior: EstadoProceso | null;
  estadoNuevo: EstadoProceso | null;
  disparador: 'JOB' | 'CALLBACK' | 'DECISION' | 'MANUAL';
  actor: { tipo: 'HUMANO' | 'SISTEMA'; upn: string | null; rol: string | null } | null;
  detalle: string | null;
}

export interface CampoExtraido {
  nombre: string;
  etiqueta?: string;
  valor: string | number | null;
  requerido: boolean;
  /** Confianza del OCR (0-1); por debajo del umbral el campo se marca para revisión aunque tenga valor. */
  confianza: number | null;
  origen: 'OCR' | 'MANUAL' | 'SFSF';
  corregidoPor: string | null;
}

export interface Extraccion {
  jobApplicationId: string;
  /** Verdadero si todos los campos requeridos tienen valor. */
  completa: boolean;
  camposFaltantes: string[];
  camposBajaConfianza: string[];
  campos: CampoExtraido[];
  documentoHvId: string | null;
  procesadoEn: string | null;
  /** Presente si el OCR falló por completo (PDF escaneado, ilegible, protegido). */
  motivoFallo: string | null;
}

export interface DocumentoMeta {
  documentoId: string;
  tipo:
    | 'HV'
    | 'INFORME_INCOGNITO'
    | 'RESULTADO_BLUESITE'
    | 'RESULTADO_COSINTE'
    | 'RESULTADO_MEDILABORAL';
  proveedor: 'BLUESITE' | 'COSINTE' | 'MEDILABORAL' | null;
  nombre: string;
  contentType: string;
  tamanoBytes: number | null;
  anonimizado: boolean;
  fechaCreacion: string;
}

export interface ParametrosListarCandidatos {
  page?: number;
  pageSize?: number;
  q?: string;
  estado?: EstadoProceso[];
  ordenarPor?: 'scoreAfinidad' | 'nombre' | 'estadoDesde';
  direccion?: 'asc' | 'desc';
  /**
   * El backend fuerza `true` cuando el rol del token es LIDER_VACANTE, sin
   * importar lo que pida el cliente — no depender de este flag para ocultar
   * datos en la UI del líder.
   */
  anonimizado?: boolean;
}

/** Ordenado por `scoreAfinidad` descendente por defecto. Alimenta GebDataTable con paginación de servidor. */
export function listarCandidatosDeVacante(
  clienteApi: GebApiClient,
  jobRequisitionId: string,
  parametros: ParametrosListarCandidatos = {},
  opciones: OpcionesPeticion = {},
) {
  return clienteApi.get<RespuestaPaginada<CandidatoResumen>>(
    `/vacantes/${jobRequisitionId}/candidatos`,
    {
      params: parametros,
      // El contrato serializa `estado` como `?estado=A,B` (form, sin explode).
      paramsSerializer: { serialize: paramsSerializerEstado },
      signal: opciones.signal,
    },
  );
}

export function obtenerCandidato(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  opciones: OpcionesPeticion = {},
) {
  return clienteApi.get<CandidatoDetalle>(`/candidatos/${jobApplicationId}`, {
    signal: opciones.signal,
  });
}

export function obtenerHistorial(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<EventoHistorial[]>(`/candidatos/${jobApplicationId}/historial`);
}

export function obtenerExtraccion(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<Extraccion>(`/candidatos/${jobApplicationId}/extraccion`);
}

/** 409 si el candidato ya superó la etapa de extracción — esos datos no se editan por acá. */
export function actualizarExtraccion(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  campos: { nombre: string; valor: string | number | null }[],
) {
  return clienteApi.put<{
    jobApplicationId: string;
    completa: boolean;
    camposFaltantes?: string[];
    estadoNuevo: EstadoProceso | null;
  }>(`/candidatos/${jobApplicationId}/extraccion`, { campos });
}

/** Es una operación costosa: devuelve 202 y el resultado llega de forma asíncrona. */
export function recalcularAfinidad(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.post<{
    jobApplicationId: string;
    correlationId: string;
    scoreAnterior: number | null;
  }>(`/candidatos/${jobApplicationId}/afinidad`);
}

/**
 * Genera el informe incógnito y pone al candidato en la bandeja del líder.
 * 409 si falta el prefiltro o si ya fue enviado; 422 si la anonimización no
 * pudo completarse (p. ej. la hoja de vida no se pudo procesar).
 */
export function anonimizarYEnviar(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.post<{
    jobApplicationId: string;
    estadoNuevo: EstadoProceso;
    correlationId: string;
  }>(`/candidatos/${jobApplicationId}/anonimizacion`);
}

export function listarDocumentos(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<DocumentoMeta[]>(`/candidatos/${jobApplicationId}/documentos`);
}

/**
 * URL firmada de corta vigencia contra Blob Storage — el PDF nunca viaja en
 * base64 dentro del JSON.
 */
export function obtenerUrlDocumento(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  documentoId: string,
) {
  return clienteApi.get<{ url: string; expiraEn: string; contentType?: string }>(
    `/candidatos/${jobApplicationId}/documentos/${documentoId}/url`,
  );
}
