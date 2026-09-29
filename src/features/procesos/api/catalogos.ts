import type { GebApiClient } from '@geb/api-client';
import type { CategoriaEstado, EstadoProceso } from '../../../shared/tipos/dominio';
import type { OpcionesPeticion } from './vacantes';

/**
 * Entrada del catálogo de estados del proceso (`GET /catalogos/estados-candidato`).
 * Es estático y cacheable: no depende del token, del tenant ni de la vacante.
 */
export interface EstadoCatalogo {
  clave: EstadoProceso;
  /** Etiqueta en español para el chip de estado y la línea de tiempo. */
  etiqueta: string;
  /** Texto de apoyo del hito. */
  descripcion: string;
  /** Única señal para el color del chip / punto de la línea de tiempo. */
  categoria: CategoriaEstado;
  terminal: boolean;
  /** El backend lo declara como texto libre, sin restringirlo a `Compuerta`. */
  compuertaPendiente: string | null;
  compuertaEtiqueta: string | null;
  transicionesPermitidas: EstadoProceso[];
}

export function obtenerCatalogoEstados(clienteApi: GebApiClient, opciones: OpcionesPeticion = {}) {
  return clienteApi.get<EstadoCatalogo[]>('/catalogos/estados-candidato', {
    signal: opciones.signal,
  });
}
