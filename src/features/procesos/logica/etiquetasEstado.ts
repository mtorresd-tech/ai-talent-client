import type { EstadoProceso } from '../../../shared/tipos/dominio';

/**
 * Diccionario de etiquetas en español para los `EstadoProceso` que aparecen en
 * el chip de estado de la fila de candidato en la vista de Procesos. Solo se
 * listan los estados relevantes para la etapa de ranking y sus salidas; para
 * cualquier otro valor se normaliza el enum a Title Case como respaldo.
 */
const ETIQUETAS: Partial<Record<EstadoProceso, string>> = {
  RANKING_SELECTA: 'En ranking',
  DESCARTADO_RANKING: 'Descartado en ranking',
  PREFILTRO_PENDIENTE: 'Prefiltro pendiente',
  PREFILTRO_COMPLETADO: 'Prefiltro completado',
  DESCARTADO_PREFILTRO: 'Descartado en prefiltro',
  PRESELECCIONADO: 'Preseleccionado',
};

/** Normaliza `EN_REVISION_LIDER` → `En Revision Lider` como respaldo. */
function aTitleCase(valor: string): string {
  return valor
    .replace(/_/g, ' ')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

export const ETIQUETA_ESTADO_PROCESO: Record<string, string> = new Proxy(
  ETIQUETAS as Record<string, string>,
  {
    get(destino, propiedad: string) {
      return destino[propiedad] ?? aTitleCase(propiedad);
    },
  },
);

/** Etiqueta en español para un estado, con respaldo en Title Case. */
export function etiquetaEstado(estado: string | null | undefined): string {
  if (!estado) return 'Sin estado';
  return ETIQUETAS[estado as EstadoProceso] ?? aTitleCase(estado);
}

/** Colores de `Chip` de MUI para los estados que conviven en un mismo paso. */
export type ColorChipEstado = 'default' | 'warning' | 'info' | 'success';

const COLORES: Partial<Record<EstadoProceso, ColorChipEstado>> = {
  // Listado de filtrados: pendiente/completado siguen en curso; preseleccionado
  // ya terminó el prefiltro y queda listo para el informe incógnito.
  PREFILTRO_PENDIENTE: 'warning',
  PREFILTRO_COMPLETADO: 'info',
  PRESELECCIONADO: 'success',
};

/** Color de chip para un estado; `default` para cualquiera sin color asignado. */
export function colorEstado(estado: string | null | undefined): ColorChipEstado {
  if (!estado) return 'default';
  return COLORES[estado as EstadoProceso] ?? 'default';
}
