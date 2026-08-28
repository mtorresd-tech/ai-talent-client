/**
 * Color del indicador de afinidad en función del score (escala 0-100):
 * rojo → ámbar → verde. `hue` va de 0° (score 0) a 120° (score 100); lightness
 * 40 % para que el texto blanco tenga contraste en todo el rango.
 */
export function colorAfinidad(score: number): string {
  const acotado = Math.max(0, Math.min(100, score));
  return `hsl(${Math.round(acotado * 1.2)}, 60%, 40%)`;
}
