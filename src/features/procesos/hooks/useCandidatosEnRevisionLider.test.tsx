import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useCandidatosEnRevisionLider } from './useCandidatosEnRevisionLider';

function candidato(alias: string, jobApplicationId: string) {
  return {
    jobApplicationId,
    jobRequisitionId: 'REQ-0001',
    alias,
    nombre: null,
    numeroDocumento: null,
    estado: 'EN_REVISION_LIDER',
    estadoDesde: '2026-01-01',
    estadoSfsf: null,
    fechaPostulacion: null,
    origenPostulacion: null,
    scoreAfinidad: 80,
    rankingPosicion: null,
    esperandoDecision: true,
    compuertaPendiente: 'LIDER',
  };
}

describe('useCandidatosEnRevisionLider', () => {
  it('con jobRequisitionId null no dispara ninguna petición y el mapa queda vacío', () => {
    const cliente = crearClienteApiFalso();

    const { result } = renderHook(() => useCandidatosEnRevisionLider(cliente, null));

    expect(cliente.get).not.toHaveBeenCalled();
    expect(result.current.mapa.size).toBe(0);
  });

  it('con un id válido llama a GET /vacantes/{id}/candidatos con estado y pageSize, y arma el mapa alias→jobApplicationId', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      data: [candidato('Candidato 100', 'APP-100'), candidato('Candidato 200', 'APP-200')],
      meta: { page: 1, pageSize: 100, total: 2, totalPages: 1 },
    });

    const { result } = renderHook(() => useCandidatosEnRevisionLider(cliente, 'REQ-0001'));

    await waitFor(() => expect(result.current.mapa.size).toBe(2));

    expect(cliente.get).toHaveBeenCalledWith(
      '/vacantes/REQ-0001/candidatos',
      expect.objectContaining({
        params: expect.objectContaining({ estado: ['EN_REVISION_LIDER'], pageSize: 100 }),
      }),
    );
    expect(result.current.mapa.get('Candidato 100')).toBe('APP-100');
    expect(result.current.mapa.get('Candidato 200')).toBe('APP-200');
  });

  it('recargar() dispara una nueva petición y reemplaza el mapa', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get
      .mockResolvedValueOnce({
        data: [candidato('Candidato 100', 'APP-100')],
        meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
      })
      .mockResolvedValueOnce({
        data: [candidato('Candidato 200', 'APP-200')],
        meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
      });

    const { result } = renderHook(() => useCandidatosEnRevisionLider(cliente, 'REQ-0001'));

    await waitFor(() => expect(result.current.mapa.get('Candidato 100')).toBe('APP-100'));

    act(() => result.current.recargar());

    await waitFor(() => expect(result.current.mapa.get('Candidato 200')).toBe('APP-200'));
    expect(result.current.mapa.has('Candidato 100')).toBe(false);
    expect(cliente.get).toHaveBeenCalledTimes(2);
  });
});
