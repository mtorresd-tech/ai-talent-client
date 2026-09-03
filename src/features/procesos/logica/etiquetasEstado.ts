import type { CategoriaEstado, EstadoProceso } from '../../../shared/tipos/dominio';
import type { EstadoCatalogo } from '../api/catalogos';

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
export type ColorChipEstado = 'default' | 'warning' | 'info' | 'success' | 'error';

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

const COLOR_POR_CATEGORIA: Record<CategoriaEstado, ColorChipEstado> = {
  EN_CURSO: 'info',
  APROBADO: 'success',
  DESCARTADO: 'error',
  EXCEPCION: 'warning',
};

/** Color de chip para una categoría del catálogo de estados. */
export function colorPorCategoria(categoria: CategoriaEstado | null | undefined): ColorChipEstado {
  if (!categoria) return 'default';
  return COLOR_POR_CATEGORIA[categoria] ?? 'default';
}

function buscarEnCatalogo(
  catalogo: EstadoCatalogo[] | null | undefined,
  estado: string | null | undefined,
): EstadoCatalogo | undefined {
  if (!catalogo || !estado) return undefined;
  return catalogo.find((entrada) => entrada.clave === estado);
}

/**
 * Etiqueta en español de un estado leída del catálogo del backend; si el
 * catálogo no cargó o no contiene la clave, cae al diccionario/Title Case.
 */
export function resolverEtiquetaEstado(
  catalogo: EstadoCatalogo[] | null | undefined,
  estado: string | null | undefined,
): string {
  return buscarEnCatalogo(catalogo, estado)?.etiqueta ?? etiquetaEstado(estado);
}

/**
 * Color de chip de un estado derivado de la `categoria` del catálogo del
 * backend; si el catálogo no cargó o no contiene la clave, cae al mapa local.
 */
export function resolverColorEstado(
  catalogo: EstadoCatalogo[] | null | undefined,
  estado: string | null | undefined,
): ColorChipEstado {
  const entrada = buscarEnCatalogo(catalogo, estado);
  if (entrada) return colorPorCategoria(entrada.categoria);
  return colorEstado(estado);
}
