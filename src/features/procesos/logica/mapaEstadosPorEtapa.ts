import type { EstadoProceso } from '../../../shared/tipos/dominio';
import type { EtapaPipeline } from '../api/vacantes';

/**
 * El pipeline (orden y composición de etapas) lo define siempre el backend
 * vía `GET /vacantes/{id}/pipeline`. Este módulo NO define ese orden: solo
 * traduce la `clave` de una etapa a la lista de `EstadoProceso` con la que se
 * filtra `GET /vacantes/{id}/candidatos` (ese endpoint filtra por estado, no
 * por etapa).
 *
 * Solo la etapa operativa de ranking por afinidad tiene un mapeo real en esta
 * entrega. Cualquier otra clave devuelve `[]` y su contenido queda como
 * placeholder "en construcción" sin llamar al backend.
 */

/**
 * Clave de la etapa operativa de ranking dentro del pipeline del reclutador.
 *
 * TODO(contrato): confirmar contra `GET /vacantes/{id}/pipeline` del portal
 * reclutador el valor real de `clave` para esta etapa (candidatos: `'RANKING'`
 * o `'SELECTA'`). Se centraliza aquí para cambiarlo en un solo lugar.
 */
export const CLAVE_ETAPA_RANKING = 'RANKING';

/**
 * Traducción `clave de etapa → estados`. Configurable y acotada: solo la etapa
 * de ranking se mapea; el resto es placeholder.
 */
export const ESTADOS_POR_ETAPA: Record<string, EstadoProceso[]> = {
  [CLAVE_ETAPA_RANKING]: ['RANKING_SELECTA'],
};

/** Estados asociados a una clave de etapa. `[]` si la etapa no es operativa. */
export function estadosDeEtapa(clave: string | null | undefined): EstadoProceso[] {
  if (!clave) return [];
  return ESTADOS_POR_ETAPA[clave] ?? [];
}

/** `true` si la etapa tiene contenido operativo (carga datos y expone acciones). */
export function esEtapaOperativa(clave: string | null | undefined): boolean {
  return estadosDeEtapa(clave).length > 0;
}

/**
 * Resuelve la etapa que queda activa por defecto al abrir una vacante: la
 * etapa operativa de ranking si el pipeline la incluye; si no, la primera
 * etapa; `null` si el pipeline viene vacío.
 */
export function resolverEtapaOperativa(
  pipeline: readonly EtapaPipeline[] | null | undefined,
): EtapaPipeline | null {
  if (!pipeline || pipeline.length === 0) return null;
  const ordenado = [...pipeline].sort((a, b) => a.orden - b.orden);
  return ordenado.find((etapa) => etapa.clave === CLAVE_ETAPA_RANKING) ?? ordenado[0];
}
