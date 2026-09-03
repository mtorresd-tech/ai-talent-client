import { useCallback } from 'react';
import type { GebApiClient } from '@geb/api-client';
import { obtenerCatalogoEstados, type EstadoCatalogo } from '../api/catalogos';
import { usePeticion, type EstadoPeticion } from './usePeticion';

/**
 * Caché a nivel de módulo del catálogo de estados. El catálogo es estático
 * (no depende de token / tenant / vacante), así que se resuelve una sola vez
 * por sesión y los siguientes montajes reutilizan la misma promesa. Si la
 * petición falla, la caché se limpia para permitir un reintento.
 */
let promesaCatalogo: Promise<EstadoCatalogo[]> | null = null;

/** Limpia la caché de módulo del catálogo. Uso principal: aislamiento de pruebas. */
export function limpiarCacheCatalogoEstados(): void {
  promesaCatalogo = null;
}

export function useCatalogoEstados(clienteApi: GebApiClient): EstadoPeticion<EstadoCatalogo[]> {
  const ejecutor = useCallback(() => {
    if (!promesaCatalogo) {
      promesaCatalogo = obtenerCatalogoEstados(clienteApi).catch((error: unknown) => {
        promesaCatalogo = null;
        throw error;
      });
    }
    return promesaCatalogo;
  }, [clienteApi]);

  return usePeticion(ejecutor, [ejecutor]);
}
