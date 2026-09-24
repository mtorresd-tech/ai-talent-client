import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso, errorApi } from '../../../test/clienteApiFalso';
import { useContadorNoLeidas } from './useContadorNoLeidas';

describe('useContadorNoLeidas', () => {
  it('expone la cantidad de notificaciones no leídas', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([{}, {}, {}]);

    const { result } = renderHook(() => useContadorNoLeidas(cliente));

    await waitFor(() => expect(result.current.cantidad).toBe(3));
    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/notificaciones');
    expect(config.params).toEqual({ leida: false });
  });

  it('cae en 0 si la petición falla, sin romper la navbar', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockRejectedValue(errorApi(500));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const { result } = renderHook(() => useContadorNoLeidas(cliente));

    await waitFor(() => expect(cliente.get).toHaveBeenCalled());
    expect(result.current.cantidad).toBe(0);
  });
});
