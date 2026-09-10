import type { ConceptoAptitud, ResultadoMedilaboral } from './tipos';

/**
 * Parseo defensivo del `resultado` de Medilaboral. El proveedor entrega un
 * `resultado` estructurado con campos progresivos y nulables
 * (`idOrdenServicio`, `fechaCita`, `sede`, `modalidad`, `conceptoAptitud`,
 * `observaciones`, `fechaConcepto`), además del PDF que se gestiona fuera de
 * este flujo. Si el objeto no calza, devuelve `null` sin lanzar.
 */
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

const MODALIDADES: NonNullable<ResultadoMedilaboral['modalidad']>[] = [
  'CITA_PREVIA',
  'ORDEN_DE_LLEGADA',
  'PROGRAMAR_CON_SERVICIO_CLIENTE',
];

const VALORES_CONCEPTO_APTITUD = new Set<string>(['APTO', 'APTO_CON_OBSERVACIONES', 'NO_APTO']);

/** Degrada a `null` cualquier valor fuera del enum conocido, en vez de mostrarlo sin traducir. */
function parsearConceptoAptitud(valor: unknown): ConceptoAptitud | null {
  return typeof valor === 'string' && VALORES_CONCEPTO_APTITUD.has(valor)
    ? (valor as ConceptoAptitud)
    : null;
}

export function parsearResultadoMedilaboral(entrada: unknown): ResultadoMedilaboral | null {
  if (!esObjeto(entrada) || typeof entrada.idOrdenServicio !== 'string') return null;

  const modalidad = MODALIDADES.includes(
    entrada.modalidad as NonNullable<ResultadoMedilaboral['modalidad']>,
  )
    ? (entrada.modalidad as ResultadoMedilaboral['modalidad'])
    : null;

  return {
    tipo: 'MEDILABORAL',
    idOrdenServicio: entrada.idOrdenServicio,
    fechaCita: typeof entrada.fechaCita === 'string' ? entrada.fechaCita : null,
    sede: typeof entrada.sede === 'string' ? entrada.sede : null,
    modalidad,
    conceptoAptitud: parsearConceptoAptitud(entrada.conceptoAptitud),
    observaciones: typeof entrada.observaciones === 'string' ? entrada.observaciones : null,
    fechaConcepto: typeof entrada.fechaConcepto === 'string' ? entrada.fechaConcepto : null,
  };
}
