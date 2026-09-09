import type { EstadoProceso } from '../../../shared/tipos/dominio';
import type { EstadoCatalogo } from '../api/catalogos';
import { resolverEtiquetaEstado } from './etiquetasEstado';

/** Texto en lenguaje claro del estado del estudio de seguridad para el panel derecho. */
export interface ResumenEstadoCosinte {
  titulo: string;
  descripcion: string;
}

const COPY: Partial<Record<EstadoProceso, ResumenEstadoCosinte>> = {
  EN_PRUEBAS_COSINTE: {
    titulo: 'En estudio de seguridad',
    descripcion: 'El candidato tiene el estudio de seguridad en curso con Cosinte.',
  },
  RESULTADO_PRUEBAS_COSINTE: {
    titulo: 'Con resultado, pendiente de revisión',
    descripcion: 'Cosinte entregó el nivel de riesgo. Está pendiente de revisión.',
  },
  APROBO_PRUEBAS_COSINTE: {
    titulo: 'Aprobó el estudio de seguridad',
    descripcion: 'Nivel de riesgo aceptable. Continúa el proceso hacia los exámenes médicos.',
  },
  DESCARTADO_PRUEBAS_COSINTE: {
    titulo: 'Descartado en estudio de seguridad',
    descripcion: 'El nivel de riesgo no fue aceptable. Estado final.',
  },
  BLOQUEADO_COSINTE_6M: {
    titulo: 'Bloqueado por la regla de 6 meses',
    descripcion:
      'Cosinte no aceptó la solicitud: ya hay un proceso activo con este documento o no han pasado seis meses desde el último estudio. Requiere decisión del reclutador; no se reintenta automáticamente.',
  },
};

/**
 * Deriva el título y la descripción del estado del estudio de seguridad con
 * Cosinte. Para los estados de la etapa usa el copy propio; para cualquier
 * otro estado cae a la etiqueta y la descripción del catálogo, y a Title Case
 * si el catálogo no está disponible, sin romper.
 */
export function describirEstadoCosinte(
  estado: EstadoProceso | string | null | undefined,
  catalogo?: EstadoCatalogo[] | null,
): ResumenEstadoCosinte {
  const propio = estado ? COPY[estado as EstadoProceso] : undefined;
  if (propio) return propio;

  const entrada = catalogo?.find((item) => item.clave === estado);
  return {
    titulo: resolverEtiquetaEstado(catalogo, estado),
    descripcion: entrada?.descripcion ?? '',
  };
}
