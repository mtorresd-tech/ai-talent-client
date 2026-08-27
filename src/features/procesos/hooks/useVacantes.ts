import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import { listarVacantes, type VacanteResumen } from '../api/vacantes';
import { aPaginaServidor } from '../logica/paginacion';
import { usePeticion, type EstadoPeticion } from './usePeticion';

export interface ParametrosVacantes {
  /** Página base 0 (la que maneja la tabla). */
  pagina: number;
  tamanoPagina: number;
  /** Texto de búsqueda ya "debounced" por el componente. */
  busqueda: string;
}

/**
 * Lista paginada de vacantes del reclutador (`GET /vacantes`). Convierte la
 * página base 0 de la tabla a la base 1 del contrato.
 */
export function useVacantes(
  clienteApi: GebApiClient,
  { pagina, tamanoPagina, busqueda }: ParametrosVacantes,
): EstadoPeticion<RespuestaPaginada<VacanteResumen>> {
  const q = busqueda.trim() || undefined;

  const ejecutor = useCallback(
    (signal: AbortSignal) =>
      listarVacantes(
        clienteApi,
        { page: aPaginaServidor(pagina), pageSize: tamanoPagina, q },
        { signal },
      ),
    [clienteApi, pagina, tamanoPagina, q],
  );

  return usePeticion(ejecutor, [ejecutor]);
}
