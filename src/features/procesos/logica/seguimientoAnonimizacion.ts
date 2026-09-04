import type { EstadoProceso } from '../../../shared/tipos/dominio';
import type { EstadoCatalogo } from '../api/catalogos';
import { resolverEtiquetaEstado } from './etiquetasEstado';

/** Texto en lenguaje claro del estado de la revisión del líder para el panel derecho. */
export interface ResumenRevisionLider {
  titulo: string;
  descripcion: string;
}

const COPY: Partial<Record<EstadoProceso, ResumenRevisionLider>> = {
  INFORME_INCOGNITO: {
    titulo: 'Enviado al líder',
    descripcion:
      'La hoja de vida fue anonimizada y enviada al líder. Aún no ha iniciado la revisión.',
  },
  EN_REVISION_LIDER: {
    titulo: 'En revisión del líder',
    descripcion: 'El líder está revisando el informe incógnito. Esperando su decisión.',
  },
  APROBADO_LIDER_PRUEBAS: {
    titulo: 'Aprobado por el líder',
    descripcion: 'El líder aprobó al candidato tras la evaluación a ciegas. Continúa el proceso.',
  },
  RECHAZADO_LIDER: {
    titulo: 'Descartado por el líder',
    descripcion: 'El líder descartó al candidato en la revisión del informe incógnito.',
  },
};

/**
 * Deriva el título y la descripción del estado de revisión del líder. Para los
 * estados de la etapa usa el copy propio; para cualquier otro estado cae a la
 * etiqueta y la descripción del catálogo, y a Title Case si el catálogo no está
 * disponible, sin romper.
 */
export function describirEstadoRevisionLider(
  estado: EstadoProceso | string | null | undefined,
  catalogo?: EstadoCatalogo[] | null,
): ResumenRevisionLider {
  const propio = estado ? COPY[estado as EstadoProceso] : undefined;
  if (propio) return propio;

  const entrada = catalogo?.find((item) => item.clave === estado);
  return {
    titulo: resolverEtiquetaEstado(catalogo, estado),
    descripcion: entrada?.descripcion ?? '',
  };
}
