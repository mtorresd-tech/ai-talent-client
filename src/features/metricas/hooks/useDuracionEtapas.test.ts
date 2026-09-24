import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useDuracionEtapas } from './useDuracionEtapas';

describe('useDuracionEtapas', () => {
  it('consulta /metricas/duracion-etapas y expone el arreglo de etapas', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([
      {
        clave: 'RANKING',
        nombre: 'Ranking Selecta',
        promedioDias: 2.1,
        medianaDias: 2.0,
        porcentajeDelTotal: 10.0,
      },
    ]);

    const { result } = renderHook(() => useDuracionEtapas(cliente, { desde: '', hasta: '' }));

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(cliente.get.mock.calls[0][0]).toBe('/metricas/duracion-etapas');
    expect(result.current.datos).toHaveLength(1);
  });
});
