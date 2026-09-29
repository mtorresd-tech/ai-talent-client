/**
 * Color del indicador de afinidad en función del score (escala 0-100):
 * rojo → ámbar → verde. `hue` va de 0° (score 0) a 120° (score 100); lightness
 * 40 % para que el texto blanco tenga contraste en todo el rango.
 */
export function colorAfinidad(score: number): string {
  const acotado = Math.max(0, Math.min(100, score));
  return `hsl(${Math.round(acotado * 1.2)}, 60%, 40%)`;
}

const ETIQUETA_COMPONENTE_RUBRICA: Record<string, string> = {
  HABILIDADES_OBLIGATORIAS: 'Habilidades obligatorias',
  EXPERIENCIA: 'Experiencia',
  HABILIDADES_DESEABLES: 'Habilidades deseables',
  FORMACION: 'Formación',
  SEMANTICO: 'Afinidad semántica',
};

/** Etiqueta legible de un componente de la rúbrica; si no se reconoce, devuelve el propio valor. */
export function etiquetaComponenteRubrica(componente: string): string {
  return ETIQUETA_COMPONENTE_RUBRICA[componente] ?? componente;
}
