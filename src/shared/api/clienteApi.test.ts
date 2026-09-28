import { describe, expect, it, vi } from 'vitest';
import type { GebApiClient } from '@geb/api-client';
import { errorApi } from '../../test/clienteApiFalso';
import { registrarDeteccionSesionSinRol } from './clienteApi';

type HandlerDeRechazo = (error: unknown) => Promise<never>;

/**
 * Registra `registrarDeteccionSesionSinRol` sobre un `http` falso (sin
 * axios real) y devuelve el handler de rechazo que quedó registrado, para
 * invocarlo directamente en cada caso de prueba.
 */
function registrarYCapturarHandler(marcarSesionSinRol: () => void): HandlerDeRechazo {
  const use = vi.fn();
  const cliente = { http: { interceptors: { response: { use } } } } as unknown as GebApiClient;

  registrarDeteccionSesionSinRol(cliente, marcarSesionSinRol);

  const [, handlerDeRechazo] = use.mock.calls[0] as [unknown, HandlerDeRechazo];
  return handlerDeRechazo;
}

describe('registrarDeteccionSesionSinRol', () => {
  it('con un ApiError 403 llama marcarSesionSinRol() una vez y rechaza con el mismo error', async () => {
    const marcarSesionSinRol = vi.fn();
    const handlerDeRechazo = registrarYCapturarHandler(marcarSesionSinRol);

    const error403 = errorApi(403);
    await expect(handlerDeRechazo(error403)).rejects.toBe(error403);
    expect(marcarSesionSinRol).toHaveBeenCalledTimes(1);
  });

  it.each([401, 500])('con un ApiError %i no llama marcarSesionSinRol()', async (status) => {
    const marcarSesionSinRol = vi.fn();
    const handlerDeRechazo = registrarYCapturarHandler(marcarSesionSinRol);

    const error = errorApi(status);
    await expect(handlerDeRechazo(error)).rejects.toBe(error);
    expect(marcarSesionSinRol).not.toHaveBeenCalled();
  });

  it('con un error que no es ApiError no llama marcarSesionSinRol()', async () => {
    const marcarSesionSinRol = vi.fn();
    const handlerDeRechazo = registrarYCapturarHandler(marcarSesionSinRol);

    const errorGenerico = new Error('fallo de red');
    await expect(handlerDeRechazo(errorGenerico)).rejects.toBe(errorGenerico);
    expect(marcarSesionSinRol).not.toHaveBeenCalled();
  });
});
