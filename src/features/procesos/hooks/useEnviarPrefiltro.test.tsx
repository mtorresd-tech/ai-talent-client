import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { crearClienteApiFalso, errorApi } from '../../../test/clienteApiFalso';
import { useEnviarPrefiltro, type ResultadoEnvioPrefiltro } from './useEnviarPrefiltro';

describe('useEnviarPrefiltro', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('envía una decisión APRUEBA de compuerta RANKING por candidato, con Idempotency-Key', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post.mockResolvedValue({ estadoNuevo: 'PREFILTRO_PENDIENTE' });

    const { result } = renderHook(() => useEnviarPrefiltro(cliente));

    let resumen!: ResultadoEnvioPrefiltro;
    await act(async () => {
      resumen = await result.current.enviar(['a', 'b']);
    });

    expect(resumen).toEqual({ exitosos: ['a', 'b'], fallidos: [] });
    expect(cliente.post).toHaveBeenCalledTimes(2);
    const [url, body, config] = cliente.post.mock.calls[0];
    expect(url).toBe('/candidatos/a/decisiones');
    expect(body).toEqual({ compuerta: 'RANKING', decision: 'APRUEBA' });
    expect(config.headers['Idempotency-Key']).toBeTruthy();
  });

  it('reporta fallo parcial cuando algunos POST devuelven 409 y la lista continúa', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post
      .mockResolvedValueOnce({ estadoNuevo: 'PREFILTRO_PENDIENTE' })
      .mockRejectedValueOnce(errorApi(409, 'La compuerta no corresponde al estado actual'))
      .mockResolvedValueOnce({ estadoNuevo: 'PREFILTRO_PENDIENTE' })
      .mockRejectedValueOnce(errorApi(409, 'Ya fue decidida'))
      .mockResolvedValueOnce({ estadoNuevo: 'PREFILTRO_PENDIENTE' });

    const { result } = renderHook(() => useEnviarPrefiltro(cliente));

    let resumen!: ResultadoEnvioPrefiltro;
    await act(async () => {
      resumen = await result.current.enviar(['1', '2', '3', '4', '5']);
    });

    expect(resumen.exitosos).toEqual(['1', '3', '5']);
    expect(resumen.fallidos).toHaveLength(2);
    expect(resumen.fallidos[0]).toMatchObject({ id: '2' });
    expect(resumen.fallidos[0].correlationId).toBeTruthy();
    expect(cliente.post).toHaveBeenCalledTimes(5);
  });

  it('reiniciar limpia el resultado', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post.mockResolvedValue({});
    const { result } = renderHook(() => useEnviarPrefiltro(cliente));

    await act(async () => {
      await result.current.enviar(['a']);
    });
    expect(result.current.resultado).not.toBeNull();

    act(() => result.current.reiniciar());
    expect(result.current.resultado).toBeNull();
  });
});
