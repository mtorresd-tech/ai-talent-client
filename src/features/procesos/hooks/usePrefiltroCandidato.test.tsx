import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso, errorApi } from '../../../test/clienteApiFalso';
import { usePrefiltroCandidato } from './usePrefiltroCandidato';

describe('usePrefiltroCandidato', () => {
  it('trata un 404 como "sin prefiltro": datos null, sin error', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockRejectedValue(errorApi(404));

    const { result } = renderHook(() => usePrefiltroCandidato(cliente, 'APP-1'));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.datos).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('propaga un error real (500) a la región', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const cliente = crearClienteApiFalso();
    cliente.get.mockRejectedValue(errorApi(500));

    const { result } = renderHook(() => usePrefiltroCandidato(cliente, 'APP-1'));

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.problem.status).toBe(500);
  });

  it('no dispara petición sin jobApplicationId', () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({});

    renderHook(() => usePrefiltroCandidato(cliente, null));

    expect(cliente.get).not.toHaveBeenCalled();
  });
});
