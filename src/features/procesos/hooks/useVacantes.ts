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

/** Tamaño de página usado para traer todas las vacantes cuando hay una búsqueda activa. */
const TAMANO_PAGINA_MAXIMO = 100;

function coincide(vacante: VacanteResumen, texto: string): boolean {
  return [vacante.titulo, vacante.area, vacante.ciudad].some((campo) =>
    campo?.toLowerCase().includes(texto),
  );
}

/**
 * Lista paginada de vacantes del reclutador (`GET /vacantes`). Convierte la
 * página base 0 de la tabla a la base 1 del contrato. Sin búsqueda, pagina
 * contra el servidor; con una búsqueda activa, trae hasta
 * `TAMANO_PAGINA_MAXIMO` vacantes y filtra y pagina en el cliente por título,
 * área y ciudad.
 */
export function useVacantes(
  clienteApi: GebApiClient,
  { pagina, tamanoPagina, busqueda }: ParametrosVacantes,
): EstadoPeticion<RespuestaPaginada<VacanteResumen>> {
  const q = busqueda.trim() || undefined;
  const buscando = q !== undefined;

  const ejecutor = useCallback(
    async (signal: AbortSignal) => {
      if (!buscando) {
        return listarVacantes(
          clienteApi,
          { page: aPaginaServidor(pagina), pageSize: tamanoPagina },
          { signal },
        );
      }

      const respuesta = await listarVacantes(
        clienteApi,
        { page: 1, pageSize: TAMANO_PAGINA_MAXIMO, q },
        { signal },
      );
      const texto = (q as string).toLowerCase();
      const coincidencias = respuesta.data.filter((vacante) => coincide(vacante, texto));
      const inicio = pagina * tamanoPagina;
      return {
        data: coincidencias.slice(inicio, inicio + tamanoPagina),
        meta: {
          page: pagina + 1,
          pageSize: tamanoPagina,
          total: coincidencias.length,
          totalPages: Math.max(1, Math.ceil(coincidencias.length / tamanoPagina)),
        },
      };
    },
    [clienteApi, pagina, tamanoPagina, buscando, q],
  );

  return usePeticion(ejecutor, [ejecutor]);
}
