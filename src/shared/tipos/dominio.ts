/**
 * Tipos de dominio compartidos entre features (estados, compuertas, roles).
 * Origen: contrato del backend de orquestación (tags Vacantes/Candidatos/Decisiones).
 * TODO: mantener sincronizado si el contrato cambia — hoy es una copia manual.
 */

export type EstadoProceso =
  | 'RECIBIDO'
  | 'EXTRACCION_OCR'
  | 'EXTRACCION_OCR_INCOMPLETA'
  | 'REGISTRO_MANUAL_COMPLETADO'
  | 'RANKING_SELECTA'
  | 'DESCARTADO_RANKING'
  | 'PREFILTRO_PENDIENTE'
  | 'PREFILTRO_COMPLETADO'
  | 'DESCARTADO_PREFILTRO'
  | 'PRESELECCIONADO'
  | 'INFORME_INCOGNITO'
  | 'EN_REVISION_LIDER'
  | 'RECHAZADO_LIDER'
  | 'APROBADO_LIDER_PRUEBAS'
  | 'EN_ENTREVISTA_JEFE'
  | 'CALIFICADO_ENTREVISTA_JEFE'
  | 'DESCARTADO_ENTREVISTA_JEFE'
  | 'EN_SEGUNDA_ENTREVISTA'
  | 'CALIFICADO_SEGUNDA_ENTREVISTA'
  | 'DESCARTADO_SEGUNDA_ENTREVISTA'
  | 'EN_PRUEBAS_BLUESITE'
  | 'RESULTADO_PRUEBAS_BLUESITE'
  | 'DESCARTADO_PRUEBAS_BLUESITE'
  | 'APROBO_PRUEBAS_BLUESITE'
  | 'EN_PRUEBAS_COSINTE'
  | 'RESULTADO_PRUEBAS_COSINTE'
  | 'DESCARTADO_PRUEBAS_COSINTE'
  | 'APROBO_PRUEBAS_COSINTE'
  | 'EN_PRUEBAS_MEDILABORAL'
  | 'RESULTADO_PRUEBAS_MEDILABORAL'
  | 'DESCARTADO_PRUEBAS_MEDILABORAL'
  | 'APROBO_PRUEBAS_MEDILABORAL'
  | 'IDENTIDAD_REVELADA'
  | 'EN_GENERACION_OFERTA'
  | 'OFERTA_GENERADA'
  | 'OFERTA_RECHAZADA_CANDIDATO'
  | 'INICIAR_PROCESO_CONTRATACION'
  | 'CANDIDATO_RETIRADO'
  | 'VACANTE_CANCELADA'
  | 'BLOQUEADO_COSINTE_6M'
  | 'EXPIRADO_SLA_PROVEEDOR'
  | 'EXPIRADO_SLA_LIDER'
  | 'ERROR_INTEGRACION';

/**
 * Categoría de agrupación de un `EstadoProceso`, única señal de color para
 * chips y puntos de línea de tiempo.
 * TODO: mantener sincronizado a mano con el enum `categoria` de
 * `EstadoCatalogo` del contrato del backend — hoy es una copia manual.
 */
export type CategoriaEstado = 'EN_CURSO' | 'APROBADO' | 'DESCARTADO' | 'EXCEPCION';

/** Puntos del proceso donde se aprueba o rechaza a una persona candidata. */
export type Compuerta =
  | 'RANKING'
  | 'PREFILTRO'
  | 'LIDER'
  | 'BLUESITE'
  | 'COSINTE'
  | 'ENTREVISTA_JEFE'
  | 'SEGUNDA_ENTREVISTA'
  | 'MEDILABORAL';

export type Proveedor = 'BLUESITE' | 'COSINTE' | 'MEDILABORAL';

/** Distingue a una persona candidata que ya trabaja en el grupo de una externa. */
export type TipoCandidato = 'INTERNO' | 'EXTERNO';

export type SubestadoIntegracion =
  | 'SOLICITUD_PENDIENTE'
  | 'SOLICITADA'
  | 'EN_CURSO'
  | 'RESULTADO_RECIBIDO'
  | 'ERROR'
  | 'REINTENTANDO'
  | 'EXPIRADA'
  | 'CANCELADA';

export type TipoEntrevista = 'JEFE_INMEDIATO' | 'SEGUNDA';

export type PoliticaCompuerta = 'MANUAL' | 'AUTOMATICA';

export type Portal = 'RECLUTADOR' | 'LIDER';

/**
 * Roles de aplicación. TODO: confirmar el listado real de `roles` que emite
 * Entra ID cuando exista el app registration — `LIDER_VACANTE` es el único
 * confirmado por el contrato (fuerza `anonimizado=true` en /candidatos).
 */
export const ROL_RECLUTADOR = 'RECLUTADOR';
export const ROL_LIDER = 'LIDER_VACANTE';
export const ROL_ADMINISTRADOR = 'ADMINISTRADOR';

export interface PaginacionMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface RespuestaPaginada<T> {
  data: T[];
  meta: PaginacionMeta;
}

/**
 * Estado de la proyección hacia SFSF. IA Talento confirma de inmediato; la
 * escritura en SFSF la hace el consumidor de `sb-queue-ssff-sync` de forma
 * asíncrona (normalmente segundos) — el front pinta el estado nuevo sin
 * esperar a que este campo pase a SINCRONIZADO.
 */
export interface SincronizacionSfsf {
  estado: 'SINCRONIZADO' | 'PENDIENTE' | 'FALLIDA';
  ultimaSincronizacion: string | null;
  intentos: number;
  /** Presente solo si `estado` es FALLIDA. */
  ultimoError: string | null;
}

export interface ActorDecision {
  tipo: 'HUMANO' | 'SISTEMA';
  /** Presente solo si `tipo` es HUMANO. */
  upn: string | null;
  rol: string | null;
}
