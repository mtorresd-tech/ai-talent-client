import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useEmbudoMetricas } from './useEmbudoMetricas';

describe('useEmbudoMetricas', () => {
  it('consulta /metricas/embudo y expone los tres conteos', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      propuestosSelecta: 120,
      llegaronPrefiltroTelefonico: 80,
      enviadosPrefiltroManual: 60,
    });

    const { result } = renderHook(() => useEmbudoMetricas(cliente, { desde: '', hasta: '' }));

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(cliente.get.mock.calls[0][0]).toBe('/metricas/embudo');
    expect(result.current.datos?.propuestosSelecta).toBe(120);
  });
});
