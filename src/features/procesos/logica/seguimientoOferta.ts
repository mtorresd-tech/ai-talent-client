import type { EstadoProceso } from '../../../shared/tipos/dominio';
import type { EstadoCatalogo } from '../api/catalogos';
import { resolverEtiquetaEstado } from './etiquetasEstado';

/** Texto en lenguaje claro del estado del candidato final para el panel de Oferta. */
export interface ResumenEstadoOferta {
  titulo: string;
  descripcion: string;
}

/**
 * Traduce el estado del candidato final a título y descripción en lenguaje
 * claro. A diferencia de `describirEstadoCosinte`/`describirEstadoMedilaboral`,
 * no tiene diccionario `COPY` propio: qué estado cuenta como "final" lo
 * decide el servidor (`GET /vacantes/{id}/candidato-final`), no este panel —
 * por eso título y descripción se resuelven siempre contra el catálogo, sin
 * lista cerrada de estados "válidos" para Oferta ni ajustes de redacción
 * propios del frontend.
 */
export function describirEstadoOferta(
  estado: EstadoProceso | string | null | undefined,
  catalogo?: EstadoCatalogo[] | null,
): ResumenEstadoOferta {
  const entrada = catalogo?.find((item) => item.clave === estado);
  return {
    titulo: resolverEtiquetaEstado(catalogo, estado),
    descripcion: entrada?.descripcion ?? '',
  };
}
