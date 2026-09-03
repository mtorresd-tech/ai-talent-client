import type { CategoriaEstado, EstadoProceso } from '../../../shared/tipos/dominio';
import type { EstadoCatalogo } from '../api/catalogos';
import type { EventoHistorial } from '../api/candidatos';
import { resolverEtiquetaEstado } from './etiquetasEstado';

/** Hito de la línea de tiempo del proceso, derivado de un `EventoHistorial`. */
export interface HitoProceso {
  clave: EstadoProceso | null;
  /** Etiqueta resuelta (catálogo del backend → fallback Title Case). */
  titulo: string;
  descripcion: string | null;
  fechaIso: string;
  /** Categoría del estado para el color del punto. */
  categoria: CategoriaEstado | null;
  /** Sin "pendiente": no se infieren hitos futuros. */
  estadoVisual: 'completado' | 'actual';
  /** `actor` + `disparador` traducidos a español. */
  actorTexto: string | null;
  tipoEvento: EventoHistorial['tipo'];
}

const ETIQUETA_DISPARADOR: Record<NonNullable<EventoHistorial['disparador']>, string> = {
  JOB: 'proceso automático',
  CALLBACK: 'respuesta de proveedor',
  DECISION: 'decisión',
  MANUAL: 'acción manual',
};

const ETIQUETA_TIPO: Record<EventoHistorial['tipo'], string> = {
  TRANSICION: 'Transición de estado',
  DECISION: 'Decisión de compuerta',
  NOTIFICACION: 'Notificación',
  ERROR: 'Error de integración',
};

function textoActor(evento: EventoHistorial): string | null {
  const partes: string[] = [];
  const actor = evento.actor;
  if (actor) {
    if (actor.tipo === 'SISTEMA') {
      partes.push('Sistema');
    } else {
      partes.push(actor.upn ?? actor.rol ?? 'Usuario');
    }
  }
  if (evento.disparador) {
    partes.push(ETIQUETA_DISPARADOR[evento.disparador]);
  }
  return partes.length > 0 ? partes.join(' · ') : null;
}

/**
 * Construye la línea de tiempo del proceso a partir del historial del
 * candidato (`EventoHistorial[]`). Ordena los eventos por `fecha` ascendente,
 * resuelve etiqueta / descripción / categoría de cada hito contra el catálogo
 * de estados del backend (con respaldo Title Case si el catálogo no cargó) y
 * marca el último hito como `actual` y los anteriores como `completado`.
 * Los eventos `NOTIFICACION` / `ERROR` se conservan como hitos atenuados.
 */
export function construirLineaTiempo(
  historial: EventoHistorial[] | null | undefined,
  catalogo: EstadoCatalogo[] | null | undefined,
): HitoProceso[] {
  if (!historial || historial.length === 0) return [];

  const ordenados = [...historial].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  );

  return ordenados.map((evento, indice) => {
    const clave = evento.estadoNuevo ?? null;
    const entradaCatalogo =
      clave && catalogo ? catalogo.find((entrada) => entrada.clave === clave) : undefined;

    const titulo = clave ? resolverEtiquetaEstado(catalogo, clave) : ETIQUETA_TIPO[evento.tipo];

    return {
      clave,
      titulo,
      descripcion: evento.detalle ?? entradaCatalogo?.descripcion ?? null,
      fechaIso: evento.fecha,
      categoria: entradaCatalogo?.categoria ?? null,
      estadoVisual: indice === ordenados.length - 1 ? 'actual' : 'completado',
      actorTexto: textoActor(evento),
      tipoEvento: evento.tipo,
    };
  });
}
