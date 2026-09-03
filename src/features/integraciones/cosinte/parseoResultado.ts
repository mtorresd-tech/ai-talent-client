import type { ResultadoCosinte } from './tipos';

/**
 * Parseo defensivo del `resultado` de Cosinte: el contrato lo declara como
 * bolsa libre, así que se valida campo a campo y se devuelve `null` cuando no
 * calza, sin lanzar.
 */
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

const ESTADOS: ResultadoCosinte['estado'][] = ['Solicitado', 'En proceso', 'Finalizado'];
const NIVELES: NonNullable<ResultadoCosinte['nivelRiesgo']>[] = ['Alto', 'Medio', 'Bajo'];

export function parsearResultadoCosinte(entrada: unknown): ResultadoCosinte | null {
  if (!esObjeto(entrada)) return null;

  const estado = ESTADOS.includes(entrada.estado as ResultadoCosinte['estado'])
    ? (entrada.estado as ResultadoCosinte['estado'])
    : null;
  if (estado === null) return null;

  const nivelRiesgo = NIVELES.includes(
    entrada.nivelRiesgo as NonNullable<ResultadoCosinte['nivelRiesgo']>,
  )
    ? (entrada.nivelRiesgo as ResultadoCosinte['nivelRiesgo'])
    : null;

  let tiempos: ResultadoCosinte['tiempos'] = null;
  if (esObjeto(entrada.tiempos)) {
    const { diasHabiles, diasRestantes, progreso } = entrada.tiempos;
    if (
      typeof diasHabiles === 'number' &&
      typeof diasRestantes === 'number' &&
      typeof progreso === 'number'
    ) {
      tiempos = { diasHabiles, diasRestantes, progreso };
    }
  }

  return {
    tipo: 'COSINTE',
    estado,
    nivelRiesgo,
    fechaSolicitud: typeof entrada.fechaSolicitud === 'string' ? entrada.fechaSolicitud : null,
    tiempos,
  };
}
