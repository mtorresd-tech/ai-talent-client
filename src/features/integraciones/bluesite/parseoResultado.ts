import type { PruebaBluesite, ResultadoBluesite } from './tipos';

/**
 * El contrato declara `EstadoIntegracion.resultado` como una bolsa libre
 * (`additionalProperties: true`). Este parseo es defensivo: valida la forma
 * campo a campo y devuelve `null` cuando el objeto no calza, nunca lanza.
 */
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function parsearPrueba(entrada: unknown): PruebaBluesite | null {
  if (!esObjeto(entrada) || typeof entrada.tipoPrueba !== 'string') return null;
  const competencias = Array.isArray(entrada.competencias)
    ? entrada.competencias
        .filter(esObjeto)
        .filter((c) => typeof c.nombre === 'string' && typeof c.puntaje === 'number')
        .map((c) => ({ nombre: c.nombre as string, puntaje: c.puntaje as number }))
    : [];
  return {
    tipoPrueba: entrada.tipoPrueba,
    respondida: typeof entrada.respondida === 'boolean' ? entrada.respondida : false,
    fechaEnvio: typeof entrada.fechaEnvio === 'string' ? entrada.fechaEnvio : null,
    fechaRespuesta: typeof entrada.fechaRespuesta === 'string' ? entrada.fechaRespuesta : null,
    competencias,
  };
}

export function parsearResultadoBluesite(entrada: unknown): ResultadoBluesite | null {
  if (!esObjeto(entrada) || !Array.isArray(entrada.pruebas)) return null;
  const pruebas = entrada.pruebas
    .map(parsearPrueba)
    .filter((prueba): prueba is PruebaBluesite => prueba !== null);
  if (pruebas.length === 0) return null;
  return { tipo: 'BLUESITE', pruebas };
}
