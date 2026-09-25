import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso, errorApi } from '../../../test/clienteApiFalso';
import { useMarcarNotificacionLeida } from './useMarcarNotificacionLeida';

function notificacion(id: string, leida = false) {
  return {
    id,
    jobApplicationId: `ja_${id}`,
    tipo: 'INFORME_SELECTA_LISTO' as const,
    mensaje: `mensaje ${id}`,
    creadaEn: '2026-09-12T14:30:00Z',
    leida,
  };
}

describe('useMarcarNotificacionLeida', () => {
  it('marca de forma optimista y confirma cuando el POST resuelve', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post.mockResolvedValue(notificacion('1', true));
    // Referencia estable entre renders, igual que `usePeticion.datos` en uso real.
    const base = [notificacion('1')];

    const { result } = renderHook(() => useMarcarNotificacionLeida(cliente, base));

    await act(async () => {
      await result.current.marcarLeida('1');
    });

    expect(result.current.notificaciones[0].leida).toBe(true);
    expect(cliente.post).toHaveBeenCalledWith('/notificaciones/1/leida');
  });

  it('revierte a leida: false cuando el POST rechaza', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post.mockRejectedValue(errorApi(500));
    const base = [notificacion('1')];

    const { result } = renderHook(() => useMarcarNotificacionLeida(cliente, base));

    await act(async () => {
      await expect(result.current.marcarLeida('1')).rejects.toThrow();
    });

    await waitFor(() => expect(result.current.notificaciones[0].leida).toBe(false));
  });
});
