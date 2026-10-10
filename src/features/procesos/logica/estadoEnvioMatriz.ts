import type { ActorDecision } from '../../../shared/tipos/dominio';
import type { FilaMatriz, MatrizSeleccion } from '../api/matriz';

/** Momento del envío de la matriz al líder; decide qué se puede editar en toda la vista. */
export type EstadoEnvioMatriz = 'ABIERTA' | 'ENVIADA_PENDIENTE' | 'AVALADA' | 'OBJETADA';

/** Motivo, autor y fecha de la objeción del líder sobre un candidato. */
export interface ObjecionCandidatoMatriz {
  motivo: string | null;
  decididaPor: ActorDecision;
  decididaEn: string;
}

type MatrizParaEstado = Pick<MatrizSeleccion, 'seleccion' | 'decisionLider' | 'objeciones'>;

/**
 * `ABIERTA` mientras no haya selección; con selección, el estado lo da la
 * decisión del líder sobre la selección vigente (`null` → pendiente).
 */
export function estadoEnvioMatriz(matriz: MatrizParaEstado): EstadoEnvioMatriz {
  if (matriz.seleccion === null) return 'ABIERTA';
  if (matriz.decisionLider === null) return 'ENVIADA_PENDIENTE';
  return matriz.decisionLider.avala ? 'AVALADA' : 'OBJETADA';
}

/** Candidatos objetados (para marcarlos): los de `objeciones` más el seleccionado vigente si el líder lo objetó. */
export function idsObjetados(matriz: MatrizParaEstado): Set<string> {
  const ids = new Set((matriz.objeciones ?? []).map((objecion) => objecion.jobApplicationId));
  if (estadoEnvioMatriz(matriz) === 'OBJETADA' && matriz.seleccion) {
    ids.add(matriz.seleccion.jobApplicationId);
  }
  return ids;
}

/** Objeción del líder sobre `jobApplicationId` (vigente o histórica), o `null` si no fue objetado. */
export function objecionDe(
  matriz: MatrizParaEstado,
  jobApplicationId: string,
): ObjecionCandidatoMatriz | null {
  if (
    estadoEnvioMatriz(matriz) === 'OBJETADA' &&
    matriz.seleccion?.jobApplicationId === jobApplicationId &&
    matriz.decisionLider
  ) {
    const { motivo, decididaPor, decididaEn } = matriz.decisionLider;
    return { motivo, decididaPor, decididaEn };
  }
  // Si el mismo candidato aparece más de una vez, vale la objeción más reciente.
  const historica = [...(matriz.objeciones ?? [])]
    .reverse()
    .find((objecion) => objecion.jobApplicationId === jobApplicationId);
  if (!historica) return null;
  const { motivo, decididaPor, decididaEn } = historica;
  return { motivo, decididaPor, decididaEn };
}

/**
 * Candidato con calificación completa. Una objeción del líder no lo excluye:
 * tras objetar se puede volver a enviar a cualquier candidato completo.
 */
export function esElegible(
  _matriz: MatrizParaEstado,
  fila: Pick<FilaMatriz, 'jobApplicationId' | 'resultado'>,
): boolean {
  return fila.resultado.completa;
}

/** `true` si se puede justificar y enviar este candidato al líder en el estado actual de la matriz. */
export function puedeEnviar(
  matriz: MatrizParaEstado,
  fila: Pick<FilaMatriz, 'jobApplicationId' | 'resultado'>,
): boolean {
  const estado = estadoEnvioMatriz(matriz);
  return (estado === 'ABIERTA' || estado === 'OBJETADA') && esElegible(matriz, fila);
}
