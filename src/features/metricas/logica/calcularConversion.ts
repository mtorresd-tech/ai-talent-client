/**
 * Porcentaje de conversión entre dos etapas consecutivas del embudo,
 * formateado con un decimal. Devuelve `—` si el divisor es 0, nunca
 * `NaN`/`Infinity`.
 */
export function calcularConversion(numerador: number, divisor: number): string {
  if (divisor === 0) return '—';
  return `${((numerador / divisor) * 100).toFixed(1)}%`;
}
