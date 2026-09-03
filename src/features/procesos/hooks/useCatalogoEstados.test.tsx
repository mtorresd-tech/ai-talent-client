import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso, errorApi } from '../../../test/clienteApiFalso';
import { limpiarCacheCatalogoEstados, useCatalogoEstados } from './useCatalogoEstados';

beforeEach(() => {
  limpiarCacheCatalogoEstados();
});

describe('useCatalogoEstados', () => {
  it('pide el catálogo una sola vez aunque se monte varias veces en la sesión', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([]);

    const primero = renderHook(() => useCatalogoEstados(cliente));
    await waitFor(() => expect(primero.result.current.datos).not.toBeNull());
    primero.unmount();

    const segundo = renderHook(() => useCatalogoEstados(cliente));
    await waitFor(() => expect(segundo.result.current.datos).not.toBeNull());

    expect(cliente.get).toHaveBeenCalledTimes(1);
    expect(cliente.get).toHaveBeenCalledWith('/catalogos/estados-candidato', expect.anything());
  });

  it('limpia la caché tras un fallo para permitir un reintento', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const cliente = crearClienteApiFalso();
    cliente.get.mockRejectedValueOnce(errorApi(500)).mockResolvedValueOnce([]);

    const primero = renderHook(() => useCatalogoEstados(cliente));
    await waitFor(() => expect(primero.result.current.error).not.toBeNull());
    primero.unmount();

    const segundo = renderHook(() => useCatalogoEstados(cliente));
    await waitFor(() => expect(segundo.result.current.datos).not.toBeNull());

    expect(cliente.get).toHaveBeenCalledTimes(2);
  });
});
