import type { ResultadoMedilaboral } from './tipos';

/**
 * Parseo defensivo del `resultado` de Medilaboral. Medilaboral solo entrega un
 * PDF; cuando el `resultado` trae datos estructurados se rescatan
 * `idOrdenServicio`, `fechaCita`, `sede` y `modalidad` si son válidos. Si el
 * objeto no calza, devuelve `null` sin lanzar.
 */
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

const MODALIDADES: NonNullable<ResultadoMedilaboral['modalidad']>[] = [
  'CITA_PREVIA',
  'ORDEN_DE_LLEGADA',
  'PROGRAMAR_CON_SERVICIO_CLIENTE',
];

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
  };
}
