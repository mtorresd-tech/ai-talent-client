import type { EstadoProceso } from '../../../shared/tipos/dominio';
import type { EstadoCatalogo } from '../api/catalogos';
import { resolverEtiquetaEstado } from './etiquetasEstado';

/** Texto en lenguaje claro del estado de los exámenes médicos para el panel derecho. */
export interface ResumenEstadoMedilaboral {
  titulo: string;
  descripcion: string;
}

const COPY: Partial<Record<EstadoProceso, ResumenEstadoMedilaboral>> = {
  EN_PRUEBAS_MEDILABORAL: {
    titulo: 'En exámenes médicos',
    descripcion: 'El candidato tiene los exámenes médicos ocupacionales en curso con Medilaboral.',
  },
  RESULTADO_PRUEBAS_MEDILABORAL: {
    titulo: 'Con resultado, pendiente de revisión (zona gris)',
    descripcion:
      'Medilaboral entregó un concepto de aptitud con observaciones: no aprueba ni descarta por sí solo, queda pendiente de revisión humana.',
  },
  APROBO_PRUEBAS_MEDILABORAL: {
    titulo: 'Aprobó los exámenes médicos',
    descripcion: 'Concepto de aptitud aceptable. Continúa el proceso.',
  },
  DESCARTADO_PRUEBAS_MEDILABORAL: {
    titulo: 'Descartado en exámenes médicos',
    descripcion: 'El concepto de aptitud no fue aceptable. Estado final.',
  },
};

/**
 * Deriva el título y la descripción del estado de los exámenes médicos con
 * Medilaboral. Para los estados de la etapa usa el copy propio; para
 * cualquier otro estado cae a la etiqueta y la descripción del catálogo, y a
 * Title Case si el catálogo no está disponible, sin romper.
 */
export function describirEstadoMedilaboral(
  estado: EstadoProceso | string | null | undefined,
  catalogo?: EstadoCatalogo[] | null,
): ResumenEstadoMedilaboral {
  const propio = estado ? COPY[estado as EstadoProceso] : undefined;
  if (propio) return propio;

  const entrada = catalogo?.find((item) => item.clave === estado);
  return {
    titulo: resolverEtiquetaEstado(catalogo, estado),
    descripcion: entrada?.descripcion ?? '',
  };
}
