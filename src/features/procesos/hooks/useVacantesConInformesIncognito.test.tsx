import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useVacantesConInformesIncognito } from './useVacantesConInformesIncognito';

function vacante(id: string, conteoPorEstado: Record<string, number> = {}) {
  return {
    jobRequisitionId: id,
    titulo: `Vacante ${id}`,
    area: null,
    ciudad: null,
    fechaPublicacion: null,
    totalCandidatos: 10,
    pendientesDecision: 0,
    numeroVacantes: 1,
    cerrada: false,
    conteoPorEstado,
  };
}

const cincoVacantes = {
  data: [
    vacante('REQ-1', { EN_REVISION_LIDER: 2 }),
    vacante('REQ-2', {}),
    vacante('REQ-3', { EN_REVISION_LIDER: 0, INFORME_INCOGNITO: 3 }),
    vacante('REQ-4', { EN_REVISION_LIDER: 1 }),
    vacante('REQ-5', { APROBO_PRUEBAS_BLUESITE: 4 }),
  ],
  meta: { page: 1, pageSize: 100, total: 5, totalPages: 1 },
};

describe('useVacantesConInformesIncognito', () => {
  it('trae todas las vacantes de una y filtra a las que tienen informes por revisar', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue(cincoVacantes);

    const { result } = renderHook(() => useVacantesConInformesIncognito(cliente, 0, 5));

    await waitFor(() => expect(result.current.datos).not.toBeNull());

    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/vacantes');
    expect(config.params).toEqual({ page: 1, pageSize: 100 });

    const ids = result.current.datos?.data.map((v) => v.jobRequisitionId);
    expect(ids).toEqual(['REQ-1', 'REQ-4']);
    expect(result.current.datos?.meta.total).toBe(2);
  });

  it('pagina en el cliente sobre la lista ya filtrada', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      data: [
        vacante('REQ-1', { EN_REVISION_LIDER: 1 }),
        vacante('REQ-2', { EN_REVISION_LIDER: 1 }),
        vacante('REQ-3', { EN_REVISION_LIDER: 1 }),
      ],
      meta: { page: 1, pageSize: 100, total: 3, totalPages: 1 },
    });

    const { result } = renderHook(() => useVacantesConInformesIncognito(cliente, 1, 2));

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(result.current.datos?.data.map((v) => v.jobRequisitionId)).toEqual(['REQ-3']);
    expect(result.current.datos?.meta).toEqual({
      page: 2,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    });
  });

  it('filtra por el texto de búsqueda contra el título de la vacante', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      data: [
        vacante('REQ-1', { EN_REVISION_LIDER: 1 }),
        vacante('REQ-2', { EN_REVISION_LIDER: 1 }),
        vacante('REQ-3', { EN_REVISION_LIDER: 1 }),
      ],
      meta: { page: 1, pageSize: 100, total: 3, totalPages: 1 },
    });

    const { result } = renderHook(() => useVacantesConInformesIncognito(cliente, 0, 5, 'req-2'));

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(result.current.datos?.data.map((v) => v.jobRequisitionId)).toEqual(['REQ-2']);
    expect(result.current.datos?.meta.total).toBe(1);
  });

  it('combina la búsqueda con el filtro de informes por revisar', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      data: [
        vacante('REQ-1', { EN_REVISION_LIDER: 1 }),
        vacante('REQ-2', {}),
        vacante('OTRA-3', { EN_REVISION_LIDER: 2 }),
      ],
      meta: { page: 1, pageSize: 100, total: 3, totalPages: 1 },
    });

    const { result } = renderHook(() => useVacantesConInformesIncognito(cliente, 0, 5, 'req'));

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(result.current.datos?.data.map((v) => v.jobRequisitionId)).toEqual(['REQ-1']);
    expect(result.current.datos?.meta.total).toBe(1);
  });

  it('devuelve lista vacía cuando ninguna vacante tiene informes por revisar', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      data: [vacante('REQ-1', {}), vacante('REQ-2', { INFORME_INCOGNITO: 2 })],
      meta: { page: 1, pageSize: 100, total: 2, totalPages: 1 },
    });

    const { result } = renderHook(() => useVacantesConInformesIncognito(cliente, 0, 5));

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(result.current.datos?.data).toEqual([]);
    expect(result.current.datos?.meta.total).toBe(0);
  });
});
