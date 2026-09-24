import type { Compuerta } from '../../../shared/tipos/dominio';

const ETIQUETA_COMPUERTA: Record<Compuerta, string> = {
  RANKING: 'Ranking Selecta',
  PREFILTRO: 'Prefiltro telefónico',
  LIDER: 'Revisión del líder',
  BLUESITE: 'Pruebas Bluesite',
  COSINTE: 'Estudio Cosinte',
  ENTREVISTA_JEFE: 'Entrevista con el jefe',
  SEGUNDA_ENTREVISTA: 'Segunda entrevista',
  MEDILABORAL: 'Exámenes Medilaboral',
};

/** Etiqueta legible de una compuerta; si no se reconoce, devuelve el propio valor. */
export function etiquetaCompuerta(compuerta: Compuerta | string): string {
  return ETIQUETA_COMPUERTA[compuerta as Compuerta] ?? compuerta;
}
