import type { EstadoProceso } from '../../../shared/tipos/dominio';
import type { EstadoCatalogo } from '../api/catalogos';
import { resolverEtiquetaEstado } from './etiquetasEstado';

/** Texto en lenguaje claro del estado de las pruebas psicotécnicas para el panel derecho. */
export interface ResumenEstadoBluesite {
  titulo: string;
  descripcion: string;
}

const COPY: Partial<Record<EstadoProceso, ResumenEstadoBluesite>> = {
  EN_PRUEBAS_BLUESITE: {
    titulo: 'En pruebas psicotécnicas',
    descripcion: 'El candidato está resolviendo las pruebas psicotécnicas con Bluesite.',
  },
  RESULTADO_PRUEBAS_BLUESITE: {
    titulo: 'Con resultado, pendiente de revisión',
    descripcion: 'Bluesite entregó el resultado. Está pendiente de revisión.',
  },
  APROBO_PRUEBAS_BLUESITE: {
    titulo: 'Aprobó las pruebas',
    descripcion: 'El candidato aprobó las pruebas psicotécnicas con Bluesite. Continúa el proceso.',
  },
  DESCARTADO_PRUEBAS_BLUESITE: {
    titulo: 'Descartado en pruebas psicotécnicas',
    descripcion: 'El candidato fue descartado en las pruebas psicotécnicas con Bluesite.',
  },
};

/**
 * Deriva el título y la descripción del estado de las pruebas psicotécnicas
 * con Bluesite. Para los estados de la etapa usa el copy propio; para
 * cualquier otro estado cae a la etiqueta y la descripción del catálogo, y a
 * Title Case si el catálogo no está disponible, sin romper.
 */
export function describirEstadoBluesite(
  estado: EstadoProceso | string | null | undefined,
  catalogo?: EstadoCatalogo[] | null,
): ResumenEstadoBluesite {
  const propio = estado ? COPY[estado as EstadoProceso] : undefined;
  if (propio) return propio;

  const entrada = catalogo?.find((item) => item.clave === estado);
  return {
    titulo: resolverEtiquetaEstado(catalogo, estado),
    descripcion: entrada?.descripcion ?? '',
  };
}
