import type { EstadoProceso } from '../../../shared/tipos/dominio';
import type { SeguimientoIntegracion } from '../../integraciones';
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

/** Valor del cruce por candidato para el badge "Requiere atención" de la lista. */
export interface AtencionCandidato {
  requiereAtencion: boolean;
  diasTranscurridos: number;
}

/**
 * Cruza la respuesta de `GET /vacantes/{id}/integraciones?proveedor=BLUESITE`
 * por `jobApplicationId`, quedándose con la integración Bluesite de cada
 * candidato. Se arma un `Map` en vez de fusionar dos arreglos porque este dato
 * solo enriquece filas que ya existen en la lista por su estado (no decide
 * quién aparece) y solo aplica a Bluesite: fusionarlo en `CandidatoResumen`
 * obligaría a cargar ese campo también en los demás pasos del pipeline, que
 * nunca lo usan. Con `integraciones: null` (la petición no resolvió o falló)
 * devuelve un `Map` vacío, sin lanzar.
 */
export function mapaAtencionBluesite(
  integraciones: SeguimientoIntegracion[] | null,
): Map<string, AtencionCandidato> {
  const mapa = new Map<string, AtencionCandidato>();
  if (!integraciones) return mapa;

  for (const candidato of integraciones) {
    const integracionBluesite = candidato.integraciones.find((i) => i.proveedor === 'BLUESITE');
    if (!integracionBluesite) continue;
    mapa.set(candidato.jobApplicationId, {
      requiereAtencion: integracionBluesite.requiereAtencion,
      diasTranscurridos: integracionBluesite.diasTranscurridos,
    });
  }

  return mapa;
}
