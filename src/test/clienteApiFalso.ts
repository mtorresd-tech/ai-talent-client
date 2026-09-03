import type { GebApiClient } from '@geb/api-client';
import { ApiError } from '@geb/api-client';
import { type Mock, vi } from 'vitest';

/**
 * Cliente HTTP falso para las pruebas: se registran respuestas por
 * método + fragmento de URL. Sin red, sin axios.
 *
 * Cada método es la firma real de `GebApiClient` intersectada con `Mock`, para
 * que el tipo siga siendo asignable a `GebApiClient` y a la vez exponga los
 * helpers de vitest (`mockResolvedValue`, `mockRejectedValueOnce`, etc.).
 */
export interface ClienteApiFalso extends GebApiClient {
  get: GebApiClient['get'] & Mock;
  post: GebApiClient['post'] & Mock;
  put: GebApiClient['put'] & Mock;
  delete: GebApiClient['delete'] & Mock;
}

export function crearClienteApiFalso(overrides: Partial<GebApiClient> = {}): ClienteApiFalso {
  return {
    http: {} as GebApiClient['http'],
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  } as unknown as ClienteApiFalso;
}

/** `ApiError` de prueba con un `status` y título dados. */
export function errorApi(status: number, title = 'Error de prueba'): ApiError {
  return new ApiError({ title, status }, `corr-${status}`);
}
