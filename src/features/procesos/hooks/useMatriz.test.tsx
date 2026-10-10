import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import {
  decisionMatriz,
  filaMatriz,
  matrizSeleccion,
  objecionMatriz,
  seleccionMatriz,
} from '../../../test/fixturesMatriz';
import { useMatriz } from './useMatriz';

describe('useMatriz', () => {
  it('expone datos tipados (con decisión, plazo y objeciones) con un mock 200', async () => {
    const cliente = crearClienteApiFalso();
    const matriz = matrizSeleccion({
      jobRequisitionId: 'REQ-0011',
      candidatos: [filaMatriz()],
      seleccion: seleccionMatriz(),
      decisionLider: decisionMatriz(),
      plazoDecisionHasta: '2026-11-12T15:00:00Z',
      objeciones: [objecionMatriz()],
    });
    cliente.get.mockResolvedValue(matriz);

    const { result } = renderHook(() => useMatriz(cliente, 'REQ-0011'));

    expect(result.current.cargando).toBe(true);
    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.datos).toEqual(matriz);
    expect(result.current.datos?.decisionLider?.avala).toBe(false);
    expect(result.current.datos?.objeciones).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(cliente.get).toHaveBeenCalledWith(
      '/vacantes/REQ-0011/matriz',
      expect.objectContaining({ signal: expect.anything() }),
    );
  });

  it('no dispara la petición sin vacante activa', () => {
    const cliente = crearClienteApiFalso();
    const { result } = renderHook(() => useMatriz(cliente, null));

    expect(cliente.get).not.toHaveBeenCalled();
    expect(result.current.datos).toBeNull();
  });

  it('reemplazar muestra la matriz de una mutación hasta la siguiente respuesta del backend', async () => {
    const cliente = crearClienteApiFalso();
    const original = matrizSeleccion();
    const actualizada = matrizSeleccion({ seleccion: seleccionMatriz() });
    const recargada = matrizSeleccion({
      configuracion: { requierePruebaTecnica: false, entrevistasArea: 1 },
    });
    cliente.get.mockResolvedValueOnce(original).mockResolvedValueOnce(recargada);

    const { result } = renderHook(() => useMatriz(cliente, 'REQ-1'));
    await waitFor(() => expect(result.current.datos).toEqual(original));

    act(() => result.current.reemplazar(actualizada));
    expect(result.current.datos).toBe(actualizada);
    expect(cliente.get).toHaveBeenCalledTimes(1);

    act(() => result.current.recargar());
    await waitFor(() => expect(result.current.datos).toEqual(recargada));
  });
});
