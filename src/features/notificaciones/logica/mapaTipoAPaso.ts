import type { Notificacion } from '../api/notificaciones';

/**
 * Traducción `tipo` de notificación → clave de paso del pipeline
 * (`PASOS_PIPELINE`), análoga en espíritu a `mapaEstadosPorEtapa.ts` pero en
 * sentido inverso.
 */
const PASO_POR_TIPO: Partial<Record<Notificacion['tipo'], string>> = {
  INFORME_SELECTA_LISTO: 'SELECTA',
  INFORME_ANONIMIZACION_LISTO: 'ANONIMIZACION',
  MATRIZ_REVISADA_POR_EL_LIDER: 'MATRIZ_SELECCION',
};

/** Paso del pipeline asociado al `tipo` de la notificación, o `null` si no tiene uno. */
export function pasoPorTipoNotificacion(tipo: Notificacion['tipo']): string | null {
  return PASO_POR_TIPO[tipo] ?? null;
}
