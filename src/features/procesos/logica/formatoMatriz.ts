/**
 * Formato de los valores de la matriz para mostrarlos. Solo da formato a lo
 * que entrega el backend: no suma, promedia ni pondera puntajes.
 */

const formateadorNumero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });

/** Puntaje con hasta un decimal (`82.4` → `"82,4"`); `null`/`undefined` → celda vacía. */
export function formatearPuntaje(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '';
  return formateadorNumero.format(valor);
}

/** Peso expresado como fracción, en porcentaje (`0.3` → `"30%"`). */
export function formatearPeso(fraccion: number): string {
  return `${formateadorNumero.format(fraccion * 100)}%`;
}
