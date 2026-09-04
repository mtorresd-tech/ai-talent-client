import type { EstadoProceso } from '../../../shared/tipos/dominio';

/**
 * Traduce la `clave` de un paso del pipeline a la lista de `EstadoProceso` con
 * la que se filtra `GET /vacantes/{id}/candidatos`.
 *
 * Solo los pasos operativos tienen un mapeo real:
 *   - `SELECTA` (ranking por afinidad).
 *   - `LISTA_FILTRADOS` (personas que pasaron el ranking y están en prefiltro
 *     telefónico / preseleccionadas).
 *   - `ANONIMIZACION` (informe incógnito enviado al líder y su revisión).
 * Cualquier otra clave devuelve `[]` y su contenido queda como placeholder
 * "en construcción".
 */

/** Clave del paso operativo de ranking (Selecta). Coincide con `PASOS_PIPELINE[0].clave`. */
export const CLAVE_ETAPA_RANKING = 'SELECTA';

/** Clave del paso de anonimización y envío al líder (solo consulta). */
export const CLAVE_ETAPA_ANONIMIZACION = 'ANONIMIZACION';

/** Traducción `clave de paso → estados`. Configurable y acotada a los pasos operativos. */
export const ESTADOS_POR_ETAPA: Record<string, EstadoProceso[]> = {
  [CLAVE_ETAPA_RANKING]: ['RANKING_SELECTA'],
  LISTA_FILTRADOS: ['PREFILTRO_PENDIENTE', 'PREFILTRO_COMPLETADO', 'PRESELECCIONADO'],
  // `APROBADO_LIDER_PRUEBAS` es "Aprobado por el líder" (aún no entra a entrevistas);
  // el embudo del backend ya lo cuenta en esta etapa. `RECHAZADO_LIDER` (terminal) se
  // incluye para que el reclutador vea por qué un candidato no avanzó: no suma al
  // embudo del rail y no es un error.
  [CLAVE_ETAPA_ANONIMIZACION]: [
    'INFORME_INCOGNITO',
    'EN_REVISION_LIDER',
    'APROBADO_LIDER_PRUEBAS',
    'RECHAZADO_LIDER',
  ],
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

/** `true` solo para el paso de anonimización (lista de solo consulta + seguimiento al líder). */
export function esPasoAnonimizacion(clave: string | null | undefined): boolean {
  return clave === CLAVE_ETAPA_ANONIMIZACION;
}

/**
 * Tipo de panel derecho que corresponde montar para un paso operativo:
 *   - `SELECTA`: resultado de afinidad Selecta.
 *   - `PREFILTRO`: información del prefiltro telefónico (listado de filtrados).
 *   - `ANONIMIZACION`: seguimiento del envío e informe incógnito al líder.
 *   - `null`: paso sin panel (no operativo).
 */
export type TipoPanelPaso = 'SELECTA' | 'PREFILTRO' | 'ANONIMIZACION' | null;

/** Discrimina qué panel derecho corresponde a un paso del pipeline. */
export function tipoPanelPaso(clave: string | null | undefined): TipoPanelPaso {
  if (esPasoSelecta(clave)) return 'SELECTA';
  if (esPasoAnonimizacion(clave)) return 'ANONIMIZACION';
  if (esEtapaOperativa(clave)) return 'PREFILTRO';
  return null;
}
