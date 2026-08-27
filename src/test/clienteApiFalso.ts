import type { GebApiClient } from '@geb/api-client';
import { ApiError } from '@geb/api-client';
import { vi } from 'vitest';

/**
 * Cliente HTTP falso para las pruebas: se registran respuestas por
 * método + fragmento de URL. Sin red, sin axios.
 */
export interface ClienteApiFalso extends GebApiClient {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

export function crearClienteApiFalso(overrides: Partial<GebApiClient> = {}): ClienteApiFalso {
  return {
    http: {} as GebApiClient['http'],
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  } as ClienteApiFalso;
}

/** `ApiError` de prueba con un `status` y título dados. */
export function errorApi(status: number, title = 'Error de prueba'): ApiError {
  return new ApiError({ title, status }, `corr-${status}`);
}
