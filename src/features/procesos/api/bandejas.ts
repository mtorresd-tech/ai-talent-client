import type { GebApiClient } from '@geb/api-client';
import type {
  ActorDecision,
  Compuerta,
  EstadoProceso,
  RespuestaPaginada,
  SincronizacionSfsf,
} from '../../../shared/tipos/dominio';
import type { DesgloseAfinidad } from './candidatos';

export interface ItemBandeja {
  jobApplicationId: string;
  jobRequisitionId: string;
  tituloVacante: string;
  alias: string;
  nombre: string | null;
  compuerta: Compuerta;
  esperandoDesde: string;
  diasEsperando: number;
  scoreAfinidad: number | null;
}

export interface ResumenBandeja {
  compuerta: Compuerta;
  pendientes: number;
  masAntiguo: string | null;
}

export interface ExperienciaInforme {
  cargo: string;
  compania: string | null;
  funciones: string | null;
  fechaInicio: string | null;
  /** `null` indica que es el cargo actual del candidato. */
  fechaFin: string | null;
}

export interface EstudioInforme {
  nivelAcademico: string;
  /** Título tal cual lo carga el candidato, p. ej. "Ingeniero en Telecomunicaciones". */
  nombreEstudio: string | null;
  institucion: string | null;
}

export interface InformeIncognito {
  alias: string;
  generadoEn: string;
  aniosExperienciaTotal: number | null;
  nivelAcademicoMaximo: string | null;
  /** Experiencia laboral extraída de la hoja de vida. `default: []` en el contrato, puede llegar ausente. */
  experiencia?: ExperienciaInforme[];
  /** Formación académica extraída de la hoja de vida. `default: []` en el contrato, puede llegar ausente. */
  estudios?: EstudioInforme[];
  /** Competencias declaradas. `default: []` en el contrato, puede llegar ausente. */
  competencias?: string[];
  /** Desglose de afinidad generado por IA, o `null` si aún no se calculó. */
  desgloseAfinidad: DesgloseAfinidad | null;
}

export interface DecisionRequest {
  compuerta: Compuerta;
  decision: 'APRUEBA' | 'RECHAZA';
  /** Obligatorio cuando `decision` es RECHAZA. */
  motivo?: string;
  /** Nota para el equipo de selección, opcional en cualquier decisión. En LIDER alimenta el comentario de la P-12. */
  comentario?: string;
}

export interface DecisionResultado {
  jobApplicationId: string;
  estadoAnterior: EstadoProceso;
  estadoNuevo: EstadoProceso;
  decididaPor: ActorDecision;
  /** Identificador de la regla, si la decisión fue automática. */
  reglaAplicada: string | null;
  siguienteCompuerta: Compuerta | null;
  registradaEn: string;
  /** Al responder siempre viene en PENDIENTE — la decisión ya está firme en IA Talento. */
  sincronizacionSfsf: SincronizacionSfsf;
}

export function obtenerBandeja(
  clienteApi: GebApiClient,
  compuerta: Compuerta,
  parametros: { page?: number; pageSize?: number; jobRequisitionId?: string } = {},
) {
  return clienteApi.get<RespuestaPaginada<ItemBandeja>>(`/bandejas/${compuerta}`, {
    params: parametros,
  });
}

/** Para los badges de navegación y las tarjetas de inicio. */
export function obtenerResumenBandejas(clienteApi: GebApiClient) {
  return clienteApi.get<ResumenBandeja[]>('/bandejas/resumen');
}

/** Devuelve los informes de los candidatos en EN_REVISION_LIDER, o el subconjunto pedido por `jobApplicationIds`. */
export function listarInformesIncognito(
  clienteApi: GebApiClient,
  jobRequisitionId: string,
  parametros: { page?: number; pageSize?: number; jobApplicationIds?: string[] } = {},
) {
  return clienteApi.get<RespuestaPaginada<InformeIncognito>>(
    `/vacantes/${jobRequisitionId}/informes-incognito`,
    { params: parametros },
  );
}

/** 409 si el informe aún no ha sido generado. */
export function obtenerInformeIncognito(clienteApi: GebApiClient, jobApplicationId: string) {
  return clienteApi.get<InformeIncognito>(`/candidatos/${jobApplicationId}/informe-incognito`);
}

/**
 * Solo aplica a compuertas en política MANUAL — 409 si la compuerta no
 * corresponde al estado actual, ya fue decidida, o está en AUTOMATICA (la
 * resuelve el backend; no se puede adelantar ni sobrescribir desde acá).
 */
export function registrarDecision(
  clienteApi: GebApiClient,
  jobApplicationId: string,
  datos: DecisionRequest,
  opciones: { idempotencyKey?: string; signal?: AbortSignal } = {},
) {
  return clienteApi.post<DecisionResultado>(`/candidatos/${jobApplicationId}/decisiones`, datos, {
    signal: opciones.signal,
    headers: opciones.idempotencyKey ? { 'Idempotency-Key': opciones.idempotencyKey } : undefined,
  });
}
