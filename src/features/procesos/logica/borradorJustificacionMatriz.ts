/** Textos de la justificación que se conservan en el navegador mientras no se envían. */
export interface BorradorJustificacionMatriz {
  fortalezas: string;
  oportunidadesDesarrollo: string;
  criterioDesempate: string;
  equivalenciasAplicadas: string;
  observaciones: string;
}

const PREFIJO = 'selecta:borrador-justificacion-matriz:';

const CAMPOS: readonly (keyof BorradorJustificacionMatriz)[] = [
  'fortalezas',
  'oportunidadesDesarrollo',
  'criterioDesempate',
  'equivalenciasAplicadas',
  'observaciones',
];

/** Clave de `sessionStorage` del borrador de un candidato en una vacante. */
export function claveBorrador(jobRequisitionId: string, jobApplicationId: string): string {
  return `${PREFIJO}${jobRequisitionId}:${jobApplicationId}`;
}

function esBorradorValido(valor: unknown): valor is BorradorJustificacionMatriz {
  if (typeof valor !== 'object' || valor === null) return false;
  const registro = valor as Record<string, unknown>;
  return CAMPOS.every((campo) => typeof registro[campo] === 'string');
}

/** `true` si todos los campos están vacíos (no vale la pena guardarlo). */
export function borradorVacio(borrador: BorradorJustificacionMatriz): boolean {
  return CAMPOS.every((campo) => borrador[campo].trim() === '');
}

/**
 * Lee el borrador guardado. Si el contenido está corrupto o no tiene la forma
 * esperada, lo elimina y devuelve `null`.
 */
export function leerBorrador(
  jobRequisitionId: string,
  jobApplicationId: string,
): BorradorJustificacionMatriz | null {
  const clave = claveBorrador(jobRequisitionId, jobApplicationId);
  try {
    const crudo = sessionStorage.getItem(clave);
    if (crudo === null) return null;
    let valor: unknown;
    try {
      valor = JSON.parse(crudo);
    } catch {
      valor = null;
    }
    if (!esBorradorValido(valor)) {
      sessionStorage.removeItem(clave);
      return null;
    }
    const borrador = {} as BorradorJustificacionMatriz;
    for (const campo of CAMPOS) borrador[campo] = valor[campo];
    return borrador;
  } catch {
    // Almacenamiento no disponible (p. ej. incógnito estricto): se trabaja solo en memoria.
    return null;
  }
}

/** Guarda el borrador; si queda vacío, lo elimina. */
export function guardarBorrador(
  jobRequisitionId: string,
  jobApplicationId: string,
  borrador: BorradorJustificacionMatriz,
): void {
  if (borradorVacio(borrador)) {
    eliminarBorrador(jobRequisitionId, jobApplicationId);
    return;
  }
  const soloTextos = {} as BorradorJustificacionMatriz;
  for (const campo of CAMPOS) soloTextos[campo] = borrador[campo];
  try {
    sessionStorage.setItem(
      claveBorrador(jobRequisitionId, jobApplicationId),
      JSON.stringify(soloTextos),
    );
  } catch {
    // Cuota llena o almacenamiento no disponible: el formulario sigue en memoria.
  }
}

export function eliminarBorrador(jobRequisitionId: string, jobApplicationId: string): void {
  try {
    sessionStorage.removeItem(claveBorrador(jobRequisitionId, jobApplicationId));
  } catch {
    // Almacenamiento no disponible: no hay nada que eliminar.
  }
}

function eliminarClavesConPrefijo(prefijo: string): void {
  try {
    const claves: string[] = [];
    for (let indice = 0; indice < sessionStorage.length; indice += 1) {
      const clave = sessionStorage.key(indice);
      if (clave?.startsWith(prefijo)) claves.push(clave);
    }
    for (const clave of claves) sessionStorage.removeItem(clave);
  } catch {
    // Almacenamiento no disponible: no hay nada que eliminar.
  }
}

/** Elimina los borradores de todos los candidatos de una vacante. */
export function eliminarBorradoresDeVacante(jobRequisitionId: string): void {
  eliminarClavesConPrefijo(`${PREFIJO}${jobRequisitionId}:`);
}

/** Elimina todos los borradores de justificación guardados en la sesión del navegador. */
export function limpiarBorradoresJustificacionMatriz(): void {
  eliminarClavesConPrefijo(PREFIJO);
}
