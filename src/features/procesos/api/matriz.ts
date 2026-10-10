import type { GebApiClient } from '@geb/api-client';
import type { ActorDecision, TipoCandidato } from '../../../shared/tipos/dominio';
import type { OpcionesPeticion } from './vacantes';

/** Las cinco competencias corporativas del Criterio I. */
export type Competencia =
  | 'TRABAJO_COLABORATIVO'
  | 'MOVILIZADOR_DE_CAMBIO'
  | 'INNOVACION_Y_PENSAMIENTO_DIGITAL'
  | 'PASION_POR_EL_LOGRO'
  | 'DESARROLLO_PROPIO_Y_DE_OTROS';

/** Orden fijo en el que se muestran las competencias en la tabla. */
export const COMPETENCIAS: readonly Competencia[] = [
  'TRABAJO_COLABORATIVO',
  'MOVILIZADOR_DE_CAMBIO',
  'INNOVACION_Y_PENSAMIENTO_DIGITAL',
  'PASION_POR_EL_LOGRO',
  'DESARROLLO_PROPIO_Y_DE_OTROS',
];

export const ETIQUETA_COMPETENCIA: Record<Competencia, string> = {
  TRABAJO_COLABORATIVO: 'Trabajo colaborativo',
  MOVILIZADOR_DE_CAMBIO: 'Movilizador de cambio',
  INNOVACION_Y_PENSAMIENTO_DIGITAL: 'Innovación y pensamiento digital',
  PASION_POR_EL_LOGRO: 'Pasión por el logro',
  DESARROLLO_PROPIO_Y_DE_OTROS: 'Desarrollo propio y de otros',
};

/** Resultado de la evaluación de desempeño del último año. Solo aplica a internos. */
export type DesempenoUltimoAnio = 'SATISFACTORIO' | 'MUY_SATISFACTORIO' | 'EXTRAORDINARIO';

export const ETIQUETA_DESEMPENO_ULTIMO_ANIO: Record<DesempenoUltimoAnio, string> = {
  SATISFACTORIO: 'Satisfactorio',
  MUY_SATISFACTORIO: 'Muy satisfactorio',
  EXTRAORDINARIO: 'Extraordinario',
};

/** Antigüedad en la compañía. Solo aplica a internos. */
export type TiempoVinculacion = 'ENTRE_6_MESES_Y_2_ANIOS' | 'ENTRE_2_Y_5_ANIOS' | 'MAS_DE_5_ANIOS';

export const ETIQUETA_TIEMPO_VINCULACION: Record<TiempoVinculacion, string> = {
  ENTRE_6_MESES_Y_2_ANIOS: 'Entre 6 meses y 2 años',
  ENTRE_2_Y_5_ANIOS: 'Entre 2 y 5 años',
  MAS_DE_5_ANIOS: 'Más de 5 años',
};

/**
 * Configuración de la matriz definida en SuccessFactors, de solo lectura: las
 * dos preguntas con las que arranca la plantilla.
 */
export interface ConfiguracionMatriz {
  requierePruebaTecnica: boolean;
  /** 1 hasta Profesional Senior, 2 a partir de Asesor I. */
  entrevistasArea: 1 | 2;
}

/** Cuánto pesa cada criterio; lo calcula el backend según la configuración. */
export interface PesosMatriz {
  competencias: number;
  pruebaTecnica: number;
  talentoHumano: number;
  conceptoArea: number;
}

/** Los puntajes crudos de un candidato, de 0 a 100. Se muestran tal cual. */
export interface CalificacionMatriz {
  /** Las cinco competencias del Criterio I; puede venir parcial. */
  competencias: Partial<Record<Competencia, number>>;
  /** Criterio II. Solo cuenta si la vacante la requiere. */
  pruebaTecnica: number | null;
  /** Criterio III: entrevista de Talento Humano por competencias. */
  talentoHumano: number | null;
  /** Criterio IV: una o dos entrevistas del jefe inmediato, según `entrevistasArea`. */
  entrevistasJefe: number[];
  /** Solo internos. */
  desempenoUltimoAnio: DesempenoUltimoAnio | null;
  /** Solo internos. */
  tiempoVinculacion: TiempoVinculacion | null;
}

/** Lo que calcula la plantilla. Todo lo hace el backend. */
export interface ResultadoMatriz {
  medianaCompetencias: number | null;
  resultadoCompetencias: number | null;
  resultadoPruebaTecnica: number | null;
  resultadoTalentoHumano: number | null;
  conceptoArea: number | null;
  resultadoConceptoArea: number | null;
  bonoDesempeno: number;
  bonoVinculacion: number;
  /** `null` mientras falte un puntaje (equivalente al `#NUM!` del Excel). */
  total: number | null;
  completa: boolean;
}

/** Un candidato de la matriz. */
export interface FilaMatriz {
  jobApplicationId: string;
  alias: string;
  /** Ausente si el rol del token obliga a la vista ciega. */
  nombre: string | null;
  tipoCandidato: TipoCandidato;
  calificacion: CalificacionMatriz;
  resultado: ResultadoMatriz;
}

/** La sección inferior de la plantilla: a quién se elige y por qué. */
export interface SeleccionMatriz {
  jobApplicationId: string;
  /** Total del candidato elegido en el momento del envío. */
  puntajeFinal: number | null;
  fortalezas: string;
  oportunidadesDesarrollo: string | null;
  criterioDesempate: string | null;
  equivalenciasAplicadas: string | null;
  observaciones: string | null;
  seleccionadaPor: ActorDecision;
  seleccionadaEn: string;
}

/** Respuesta del líder a la selección vigente. */
export interface DecisionMatriz {
  avala: boolean;
  /** Obligatorio cuando `avala` es `false`. */
  motivo: string | null;
  decididaPor: ActorDecision;
  decididaEn: string;
}

/** Una elección anterior que el líder objetó y que ya fue reemplazada. */
export interface ObjecionMatriz {
  jobApplicationId: string;
  motivo: string | null;
  decididaPor: ActorDecision;
  decididaEn: string;
}

/** La matriz de una vacante, con todo calculado. */
export interface MatrizSeleccion {
  jobRequisitionId: string;
  configuracion: ConfiguracionMatriz;
  pesos: PesosMatriz;
  /** Ordenados por total, de mayor a menor; los incompletos al final. */
  candidatos: FilaMatriz[];
  /** `null` mientras no se haya enviado ningún candidato al líder. */
  seleccion: SeleccionMatriz | null;
  /** Decisión sobre la selección vigente; `null` mientras el líder no responda. */
  decisionLider: DecisionMatriz | null;
  /** Fecha límite para la decisión del líder; `null` si no se ha enviado. */
  plazoDecisionHasta: string | null;
  /** Elecciones objetadas anteriormente, de la más antigua a la más reciente. Ausente equivale a `[]`. */
  objeciones?: ObjecionMatriz[];
}

/** Body de `POST /vacantes/{id}/matriz/seleccion`. */
export interface SeleccionMatrizRequest {
  jobApplicationId: string;
  fortalezas: string;
  oportunidadesDesarrollo?: string | null;
  /** Obligatorio si el elegido empata con otro candidato; si falta, 422. */
  criterioDesempate?: string | null;
  equivalenciasAplicadas?: string | null;
  observaciones?: string | null;
}

export function obtenerMatriz(
  clienteApi: GebApiClient,
  jobRequisitionId: string,
  opciones: OpcionesPeticion = {},
) {
  return clienteApi.get<MatrizSeleccion>(`/vacantes/${jobRequisitionId}/matriz`, {
    signal: opciones.signal,
  });
}

/**
 * Envía un candidato al líder y devuelve la matriz actualizada. No mueve el
 * `EstadoProceso` del candidato. Responde 422 si falta `criterioDesempate`
 * habiendo empate de `total`, y 409 si el candidato no es elegible o si la
 * elección vigente no fue objetada.
 */
export function seleccionarCandidatoMatriz(
  clienteApi: GebApiClient,
  jobRequisitionId: string,
  datos: SeleccionMatrizRequest,
) {
  return clienteApi.post<MatrizSeleccion>(`/vacantes/${jobRequisitionId}/matriz/seleccion`, datos);
}
