import type { ApiError } from '@geb/api-client';

/** Error de una mutación de la matriz traducido a lo que la vista necesita mostrar y hacer. */
export interface ErrorMatriz {
  mensaje: string;
  /** Campo del formulario de justificación al que se asocia el error, si aplica. */
  campo: 'criterioDesempate' | null;
  /** `true` si los datos en pantalla están desactualizados y hay que volver a pedir la matriz. */
  recargar: boolean;
  idCorrelacion: string | null;
}

export const MENSAJE_DESEMPATE =
  'Hay empate de puntaje con otro candidato: describe el criterio de desempate.';

/**
 * Mensajes por `title` del Problem Details. El backend fija un `title` por
 * cada caso de error; se comparan sin tildes ni mayúsculas.
 */
const MENSAJES_SELECCION: Record<string, Omit<ErrorMatriz, 'idCorrelacion'>> = {
  'el candidato no esta en la matriz': {
    mensaje:
      'Este candidato ya no tiene la calificación completa en la matriz. Actualizamos los datos.',
    campo: null,
    recargar: true,
  },
  'calificacion incompleta': {
    mensaje:
      'Este candidato ya no tiene la calificación completa en la matriz. Actualizamos los datos.',
    campo: null,
    recargar: true,
  },
  'la eleccion enviada al lider no fue objetada': {
    mensaje:
      'La matriz ya fue enviada al líder: solo se puede volver a elegir si el líder objeta la elección.',
    campo: null,
    recargar: true,
  },
  'falta el criterio de desempate': {
    mensaje: MENSAJE_DESEMPATE,
    campo: 'criterioDesempate',
    recargar: true,
  },
};

function normalizar(texto: string | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

/** Traduce un error de `POST .../matriz/seleccion`. */
export function interpretarErrorSeleccion(error: ApiError): ErrorMatriz {
  const idCorrelacion = error.idCorrelacion || error.problem.idCorrelacion || null;
  const conocido = MENSAJES_SELECCION[normalizar(error.problem.title)];
  if (conocido) return { ...conocido, idCorrelacion };

  return {
    mensaje: error.problem.detail || error.problem.title,
    campo: null,
    recargar: error.problem.status === 409,
    idCorrelacion,
  };
}
