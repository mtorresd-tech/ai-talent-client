import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { crearClienteApiFalso, errorApi } from '../../../test/clienteApiFalso';
import { useDecisionLider } from './useDecisionLider';

describe('useDecisionLider', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('en éxito llama a registrarDecision con compuerta LIDER, los datos recibidos y una Idempotency-Key', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post.mockResolvedValue({ estadoNuevo: 'APROBADO_LIDER' });

    const { result } = renderHook(() => useDecisionLider(cliente));

    await act(async () => {
      await result.current.decidir('APP-123', 'RECHAZA', 'No cumple el nivel', 'comentario libre');
    });

    expect(cliente.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = cliente.post.mock.calls[0];
    expect(url).toBe('/candidatos/APP-123/decisiones');
    expect(body).toEqual({
      compuerta: 'LIDER',
      decision: 'RECHAZA',
      motivo: 'No cumple el nivel',
      comentario: 'comentario libre',
    });
    expect(config.headers['Idempotency-Key']).toBeTruthy();
    expect(result.current.enviando).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('dos clicks seguidos usan una Idempotency-Key distinta en cada uno', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post.mockResolvedValue({ estadoNuevo: 'APROBADO_LIDER' });

    const { result } = renderHook(() => useDecisionLider(cliente));

    await act(async () => {
      await result.current.decidir('APP-123', 'APRUEBA');
    });
    await act(async () => {
      await result.current.decidir('APP-123', 'APRUEBA');
    });

    const claveUno = cliente.post.mock.calls[0][2].headers['Idempotency-Key'];
    const claveDos = cliente.post.mock.calls[1][2].headers['Idempotency-Key'];
    expect(claveUno).not.toBe(claveDos);
  });

  it('con un ApiError 409, error queda con ese ApiError y no se lanza una excepción sin capturar', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post.mockRejectedValue(
      errorApi(409, 'La compuerta ya no corresponde al estado actual'),
    );

    const { result } = renderHook(() => useDecisionLider(cliente));

    await act(async () => {
      await result.current.decidir('APP-123', 'APRUEBA');
    });

    expect(result.current.error?.problem.status).toBe(409);
    expect(result.current.enviando).toBe(false);
  });

  it('con un fallo que no es ApiError lo envuelve en un ApiError genérico', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post.mockRejectedValue(new Error('fallo de red'));

    const { result } = renderHook(() => useDecisionLider(cliente));

    await act(async () => {
      await result.current.decidir('APP-123', 'APRUEBA');
    });

    expect(result.current.error?.problem.title).toBe('Error inesperado');
    expect(result.current.error?.problem.status).toBe(0);
  });
});
