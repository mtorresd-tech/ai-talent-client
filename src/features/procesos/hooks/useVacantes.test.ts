import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useVacantes } from './useVacantes';

function vacante(id: string, titulo: string, area = 'Tecnología', ciudad = 'Bogotá') {
  return {
    jobRequisitionId: id,
    titulo,
    area,
    ciudad,
    fechaPublicacion: '2026-01-01',
    totalCandidatos: 1,
    pendientesDecision: 0,
    numeroVacantes: 1,
    cerrada: false,
    conteoPorEstado: {},
  };
}

describe('useVacantes', () => {
  it('sin búsqueda, pagina en el servidor con page/pageSize', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      data: [vacante('REQ-1', 'Analista')],
      meta: { page: 1, pageSize: 5, total: 1, totalPages: 1 },
    });

    renderHook(() => useVacantes(cliente, { pagina: 1, tamanoPagina: 5, busqueda: '' }));

    await waitFor(() => expect(cliente.get).toHaveBeenCalled());
    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/vacantes');
    expect(config.params).toEqual({ page: 2, pageSize: 5 });
  });

  it('con búsqueda, trae una página grande sin filtrar y busca/pagina en el cliente', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      data: [
        vacante('REQ-1', 'Analista de Datos'),
        vacante('REQ-2', 'Ingeniero de Redes'),
        vacante('REQ-3', 'Analista Financiero'),
      ],
      meta: { page: 1, pageSize: 100, total: 3, totalPages: 1 },
    });

    const { result } = renderHook(() =>
      useVacantes(cliente, { pagina: 0, tamanoPagina: 5, busqueda: 'analista' }),
    );

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/vacantes');
    expect(config.params).toMatchObject({ page: 1, pageSize: 100, q: 'analista' });

    expect(result.current.datos?.data.map((v) => v.jobRequisitionId)).toEqual(['REQ-1', 'REQ-3']);
    expect(result.current.datos?.meta.total).toBe(2);
  });

  it('la búsqueda no distingue mayúsculas/minúsculas y mira título, área y ciudad', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      data: [
        vacante('REQ-1', 'Analista de Datos', 'Tecnología', 'Bogotá'),
        vacante('REQ-2', 'Ingeniero', 'Operaciones', 'Medellín'),
      ],
      meta: { page: 1, pageSize: 100, total: 2, totalPages: 1 },
    });

    const { result } = renderHook(() =>
      useVacantes(cliente, { pagina: 0, tamanoPagina: 5, busqueda: 'MEDELLÍN' }),
    );

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(result.current.datos?.data.map((v) => v.jobRequisitionId)).toEqual(['REQ-2']);
  });
});
