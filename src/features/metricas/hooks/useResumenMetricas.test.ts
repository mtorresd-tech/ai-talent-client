import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useResumenMetricas } from './useResumenMetricas';

describe('useResumenMetricas', () => {
  it('expone tasaCierre sin transformar (se formatea en el componente, no en el hook)', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      totalRequisiciones: 15,
      candidatosActivos: 76,
      tasaCierre: 33.3,
    });

    const { result } = renderHook(() => useResumenMetricas(cliente, { desde: '', hasta: '' }));

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(result.current.datos?.tasaCierre).toBe(33.3);

    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/metricas/resumen');
    expect(config.params).toEqual({ desde: undefined, hasta: undefined });
  });

  it('manda desde/hasta cuando están definidos', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({ totalRequisiciones: 0, candidatosActivos: 0, tasaCierre: 0 });

    renderHook(() => useResumenMetricas(cliente, { desde: '2026-01-01', hasta: '2026-02-01' }));

    await waitFor(() => expect(cliente.get).toHaveBeenCalled());
    const [, config] = cliente.get.mock.calls[0];
    expect(config.params).toEqual({ desde: '2026-01-01', hasta: '2026-02-01' });
  });
});
