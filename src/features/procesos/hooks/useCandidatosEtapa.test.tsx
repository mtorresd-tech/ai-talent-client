import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { CLAVE_ETAPA_RANKING } from '../logica/mapaEstadosPorEtapa';
import { useCandidatosEtapa } from './useCandidatosEtapa';

const respuestaVacia = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };

describe('useCandidatosEtapa', () => {
  it('no llama al backend para una etapa no operativa', () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue(respuestaVacia);

    renderHook(() =>
      useCandidatosEtapa(cliente, {
        jobRequisitionId: 'v1',
        etapaClave: 'BLUESITE',
        pagina: 0,
        tamanoPagina: 20,
      }),
    );

    expect(cliente.get).not.toHaveBeenCalled();
  });

  it('consulta con el filtro de estado de la etapa de ranking', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue(respuestaVacia);

    renderHook(() =>
      useCandidatosEtapa(cliente, {
        jobRequisitionId: 'v1',
        etapaClave: CLAVE_ETAPA_RANKING,
        pagina: 0,
        tamanoPagina: 20,
      }),
    );

    await waitFor(() => expect(cliente.get).toHaveBeenCalled());
    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/vacantes/v1/candidatos');
    expect(config.params).toMatchObject({
      estado: ['RANKING_SELECTA'],
      ordenarPor: 'scoreAfinidad',
      direccion: 'desc',
      page: 1,
    });
  });

  it('descarta la respuesta de la etapa anterior al cambiar de etapa mientras carga', async () => {
    const cliente = crearClienteApiFalso();
    let resolverPrimera: (v: unknown) => void = () => undefined;

    cliente.get
      .mockImplementationOnce(
        (_url: string, config: { signal?: AbortSignal }) =>
          new Promise((resolve, reject) => {
            resolverPrimera = resolve;
            config.signal?.addEventListener('abort', () => reject(new Error('abortada')));
          }),
      )
      .mockResolvedValueOnce({
        data: [{ jobApplicationId: 'nuevo' }],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      });

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const { result, rerender } = renderHook(
      ({ pagina }) =>
        useCandidatosEtapa(cliente, {
          jobRequisitionId: 'v1',
          etapaClave: CLAVE_ETAPA_RANKING,
          pagina,
          tamanoPagina: 20,
        }),
      { initialProps: { pagina: 0 } },
    );

    rerender({ pagina: 1 });
    resolverPrimera({
      data: [{ jobApplicationId: 'viejo' }],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });

    await waitFor(() => expect(result.current.datos?.data[0]?.jobApplicationId).toBe('nuevo'));
  });
});
