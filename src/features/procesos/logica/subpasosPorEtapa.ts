import { CLAVE_ETAPA_RANKING } from './mapaEstadosPorEtapa';

/**
 * "Lista de filtrados" es una subdivisión **visual** de la etapa de ranking:
 * no viene del pipeline del backend (`EtapaPipeline` es plano, sin sub-pasos).
 * Se modela aquí, colgada exclusivamente de la etapa de ranking, para que los
 * pasos siguientes del pipeline puedan sumar sus propios sub-pasos sin tocar
 * el rail dinámico.
 */
export interface SubPasoEtapa {
  clave: string;
  nombre: string;
  /** `false` → placeholder navegable "en construcción". */
  operativo: boolean;
}

export const SUBPASOS_POR_ETAPA: Record<string, SubPasoEtapa[]> = {
  [CLAVE_ETAPA_RANKING]: [
    { clave: 'RANKING', nombre: 'Ranking', operativo: true },
    { clave: 'LISTA_FILTRADOS', nombre: 'Lista de filtrados', operativo: false },
  ],
};

/** Sub-pasos de una etapa. `[]` si la etapa no tiene subdivisión visual. */
export function subpasosDeEtapa(clave: string | null | undefined): SubPasoEtapa[] {
  if (!clave) return [];
  return SUBPASOS_POR_ETAPA[clave] ?? [];
}
