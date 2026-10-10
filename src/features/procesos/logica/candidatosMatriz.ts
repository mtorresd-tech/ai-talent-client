import type { GebEstadoRegistro } from '@geb/ui';
import type { FilaMatriz, MatrizSeleccion } from '../api/matriz';
import { estadoEnvioMatriz, idsObjetados } from './estadoEnvioMatriz';

/** Estado visual de un candidato dentro de la matriz de selección. */
export type EstadoCandidatoMatriz =
  'OBJETADA' | 'ENVIADA' | 'AVALADA' | 'INCOMPLETA' | 'BORRADOR' | 'LISTA' | 'COMPLETA';

export const ETIQUETA_ESTADO_CANDIDATO_MATRIZ: Record<EstadoCandidatoMatriz, string> = {
  OBJETADA: 'Objetado por el líder',
  ENVIADA: 'Enviada al líder',
  AVALADA: 'Avalada por el líder',
  INCOMPLETA: 'Calificación incompleta',
  BORRADOR: 'Borrador',
  LISTA: 'Lista para justificar',
  COMPLETA: 'Calificación completa',
};

/** Tono del `GebStatusChip` de cada estado. */
export const ESTADO_REGISTRO_CANDIDATO_MATRIZ: Record<EstadoCandidatoMatriz, GebEstadoRegistro> = {
  OBJETADA: 'danger',
  ENVIADA: 'pending',
  AVALADA: 'success',
  INCOMPLETA: 'neutral',
  BORRADOR: 'pending',
  LISTA: 'success',
  COMPLETA: 'neutral',
};

/**
 * Estado del candidato en la matriz. La objeción del líder tiene prioridad
 * sobre todo lo demás; después, la selección vigente y la completitud de la
 * calificación.
 */
export function estadoCandidatoMatriz(
  fila: Pick<FilaMatriz, 'jobApplicationId' | 'resultado'>,
  matriz: Pick<MatrizSeleccion, 'seleccion' | 'decisionLider' | 'objeciones'>,
  tieneBorrador: boolean,
): EstadoCandidatoMatriz {
  if (idsObjetados(matriz).has(fila.jobApplicationId)) return 'OBJETADA';

  const estadoEnvio = estadoEnvioMatriz(matriz);
  const esSeleccionado = matriz.seleccion?.jobApplicationId === fila.jobApplicationId;
  if (esSeleccionado && estadoEnvio === 'ENVIADA_PENDIENTE') return 'ENVIADA';
  if (esSeleccionado && estadoEnvio === 'AVALADA') return 'AVALADA';

  if (!fila.resultado.completa) return 'INCOMPLETA';
  if (estadoEnvio === 'ABIERTA' || estadoEnvio === 'OBJETADA') {
    return tieneBorrador ? 'BORRADOR' : 'LISTA';
  }
  return 'COMPLETA';
}

/** Posición (1..n) de cada candidato según el orden en que el backend devuelve la matriz. */
export function posicionesMatriz(matriz: Pick<MatrizSeleccion, 'candidatos'>): Map<string, number> {
  return new Map(matriz.candidatos.map((fila, indice) => [fila.jobApplicationId, indice + 1]));
}

/** Estado vacío de la tabla cuando la vacante todavía no tiene puntajes. */
export const MATRIZ_SIN_PUNTAJES = {
  titulo: 'Todavía no hay puntajes para esta vacante',
  descripcion:
    'Los puntajes se registran en SuccessFactors y aparecerán aquí cuando estén disponibles.',
} as const;
