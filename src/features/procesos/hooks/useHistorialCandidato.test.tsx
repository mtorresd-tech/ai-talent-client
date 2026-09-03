import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useHistorialCandidato } from './useHistorialCandidato';

describe('useHistorialCandidato', () => {
  it('no dispara petición sin jobApplicationId', () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([]);

    renderHook(() => useHistorialCandidato(cliente, null));

    expect(cliente.get).not.toHaveBeenCalled();
  });

  it('consulta el historial del candidato con AbortSignal', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([]);

    renderHook(() => useHistorialCandidato(cliente, 'APP-1'));

    await waitFor(() => expect(cliente.get).toHaveBeenCalled());
    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/candidatos/APP-1/historial');
    expect(config.signal).toBeInstanceOf(AbortSignal);
  });
});
