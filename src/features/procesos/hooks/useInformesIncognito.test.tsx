import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useInformesIncognito } from './useInformesIncognito';

const respuestaUnInforme = {
  data: [
    {
      alias: 'Candidato 100',
      generadoEn: '2026-08-14T00:00:00Z',
      aniosExperienciaTotal: 6.9,
      nivelAcademicoMaximo: 'Especialización',
      experiencia: [],
      estudios: [],
      competencias: ['SQL'],
      desgloseAfinidad: null,
    },
  ],
  meta: { page: 1, pageSize: 5, total: 1, totalPages: 1 },
};

describe('useInformesIncognito', () => {
  it('no dispara la petición cuando no hay vacante seleccionada', () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue(respuestaUnInforme);

    const { result } = renderHook(() => useInformesIncognito(cliente, null, 0, 5));

    expect(cliente.get).not.toHaveBeenCalled();
    expect(result.current.datos).toBeNull();
    expect(result.current.cargando).toBe(false);
  });

  it('convierte la página base 0 a la base 1 del contrato', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue(respuestaUnInforme);

    renderHook(() => useInformesIncognito(cliente, 'REQ-0001', 1, 5));

    await waitFor(() => expect(cliente.get).toHaveBeenCalled());
    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/vacantes/REQ-0001/informes-incognito');
    expect(config.params).toEqual({ page: 2, pageSize: 5 });
  });

  it('normaliza experiencia, estudios y competencias ausentes a arreglos vacíos', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue({
      data: [
        {
          alias: 'Candidato 7',
          generadoEn: '2026-08-14T00:00:00Z',
          aniosExperienciaTotal: null,
          nivelAcademicoMaximo: null,
          desgloseAfinidad: null,
        },
      ],
      meta: { page: 1, pageSize: 5, total: 1, totalPages: 1 },
    });

    const { result } = renderHook(() => useInformesIncognito(cliente, 'REQ-0001', 0, 5));

    await waitFor(() => expect(result.current.datos).not.toBeNull());
    const informe = result.current.datos?.data[0];
    expect(informe?.experiencia).toEqual([]);
    expect(informe?.estudios).toEqual([]);
    expect(informe?.competencias).toEqual([]);
  });
});
