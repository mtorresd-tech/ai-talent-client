import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import type { RespuestaPaginada } from '../../../shared/tipos/dominio';
import { listarVacantes, type VacanteResumen } from '../api/vacantes';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Vacantes que traer para filtrar en el cliente. `GET /vacantes` no expone un
 * filtro por "tiene informes por revisar", así que se traen todas de una y se
 * descartan las que no aplican. El líder maneja pocas vacantes; si en el futuro
 * un líder superara este tope, habría que paginar el fetch o pedir el filtro al
 * backend.
 */
const TAMANO_PAGINA_MAXIMO = 100;

/** Candidatos de la vacante que hoy esperan la revisión del líder. */
export function informesPorRevisar(vacante: VacanteResumen): number {
  return vacante.conteoPorEstado?.['EN_REVISION_LIDER'] ?? 0;
}

/** Coincidencia del texto contra título, área y ciudad (mismo criterio que `useVacantes`). */
function coincide(vacante: VacanteResumen, texto: string): boolean {
  return [vacante.titulo, vacante.area, vacante.ciudad].some((campo) =>
    campo?.toLowerCase().includes(texto),
  );
}

/**
 * Lista paginada de las vacantes del líder que **sí tienen informes incógnitos
 * por revisar** (`conteoPorEstado['EN_REVISION_LIDER'] > 0`). Trae hasta
 * `TAMANO_PAGINA_MAXIMO` vacantes de `GET /vacantes`, filtra las que no tienen
 * informes y —si hay texto— las que no coinciden con la búsqueda, y pagina el
 * resultado en el cliente; mismo patrón que `useVacantes` usa para el caso de
 * búsqueda.
 */
export function useVacantesConInformesIncognito(
  clienteApi: GebApiClient,
  /** Página base 0 (la que maneja la tabla). */
  pagina: number,
  tamanoPagina: number,
  /** Texto de búsqueda ya "debounced" por el componente. */
  busqueda = '',
): EstadoPeticion<RespuestaPaginada<VacanteResumen>> {
  const texto = busqueda.trim().toLowerCase();

  const ejecutor = useCallback(
    async (signal: AbortSignal) => {
      const respuesta = await listarVacantes(
        clienteApi,
        { page: 1, pageSize: TAMANO_PAGINA_MAXIMO },
        { signal },
      );
      const filtradas = respuesta.data.filter(
        (vacante) => informesPorRevisar(vacante) > 0 && (texto === '' || coincide(vacante, texto)),
      );
      const inicio = pagina * tamanoPagina;
      return {
        data: filtradas.slice(inicio, inicio + tamanoPagina),
        meta: {
          page: pagina + 1,
          pageSize: tamanoPagina,
          total: filtradas.length,
          totalPages: Math.max(1, Math.ceil(filtradas.length / tamanoPagina)),
        },
      };
    },
    [clienteApi, pagina, tamanoPagina, texto],
  );

  return usePeticion(ejecutor, [ejecutor]);
}
