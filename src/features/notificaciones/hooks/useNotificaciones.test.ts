import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useNotificaciones } from './useNotificaciones';

function notificacion(id: string, creadaEn: string) {
  return {
    id,
    jobApplicationId: `ja_${id}`,
    tipo: 'INFORME_SELECTA_LISTO' as const,
    mensaje: `mensaje ${id}`,
    creadaEn,
    leida: false,
  };
}

describe('useNotificaciones', () => {
  it('ordena la lista por creadaEn descendente aunque llegue desordenada', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([
      notificacion('vieja', '2026-09-01T00:00:00Z'),
      notificacion('nueva', '2026-09-12T00:00:00Z'),
    ]);

    const { result } = renderHook(() => useNotificaciones(cliente, {}));

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(result.current.datos?.map((n) => n.id)).toEqual(['nueva', 'vieja']);
  });

  it('manda leida como parámetro cuando se filtra', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue([]);

    renderHook(() => useNotificaciones(cliente, { leida: false }));

    await waitFor(() => expect(cliente.get).toHaveBeenCalled());
    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/notificaciones');
    expect(config.params).toEqual({ leida: false });
  });
});
