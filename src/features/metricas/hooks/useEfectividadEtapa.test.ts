import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useEfectividadEtapa } from './useEfectividadEtapa';

describe('useEfectividadEtapa', () => {
  it('no llama al backend mientras no haya etapa elegida', () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({});

    renderHook(() => useEfectividadEtapa(cliente, { etapa: null, desde: '', hasta: '' }));

    expect(cliente.get).not.toHaveBeenCalled();
  });

  it('consulta /metricas/etapa/{etapa} cuando hay una compuerta elegida', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      compuerta: 'LIDER',
      aprobados: { internos: 5, externos: 12 },
      rechazados: { internos: 2, externos: 8 },
    });

    const { result } = renderHook(() =>
      useEfectividadEtapa(cliente, { etapa: 'LIDER', desde: '', hasta: '' }),
    );

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(cliente.get.mock.calls[0][0]).toBe('/metricas/etapa/LIDER');
    expect(result.current.datos?.aprobados.internos).toBe(5);
  });
});
