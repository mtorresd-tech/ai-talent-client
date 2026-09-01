import type { EstadoProceso } from '../../../shared/tipos/dominio';

/**
 * Traduce la `clave` de un paso del pipeline a la lista de `EstadoProceso` con
 * la que se filtra `GET /vacantes/{id}/candidatos`.
 *
 * Solo los pasos operativos tienen un mapeo real:
 *   - `SELECTA` (ranking por afinidad).
 *   - `LISTA_FILTRADOS` (personas que pasaron el ranking y están en prefiltro
 *     telefónico / preseleccionadas).
 * Cualquier otra clave devuelve `[]` y su contenido queda como placeholder
 * "en construcción".
 */

/** Clave del paso operativo de ranking (Selecta). Coincide con `PASOS_PIPELINE[0].clave`. */
export const CLAVE_ETAPA_RANKING = 'SELECTA';

/** Traducción `clave de paso → estados`. Configurable y acotada a los pasos operativos. */
export const ESTADOS_POR_ETAPA: Record<string, EstadoProceso[]> = {
  [CLAVE_ETAPA_RANKING]: ['RANKING_SELECTA'],
  LISTA_FILTRADOS: ['PREFILTRO_PENDIENTE', 'PREFILTRO_COMPLETADO', 'PRESELECCIONADO'],
};

/** Estados asociados a una clave de paso. `[]` si el paso no es operativo. */
export function estadosDeEtapa(clave: string | null | undefined): EstadoProceso[] {
  if (!clave) return [];
  return ESTADOS_POR_ETAPA[clave] ?? [];
}

/** `true` si el paso tiene contenido operativo (carga datos del backend). */
export function esEtapaOperativa(clave: string | null | undefined): boolean {
  return estadosDeEtapa(clave).length > 0;
}

/** `true` solo para el paso de ranking (Selecta): afinidad + selección para prefiltro. */
export function esPasoSelecta(clave: string | null | undefined): boolean {
  return clave === CLAVE_ETAPA_RANKING;
}
