import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { crearClienteApiFalso } from '../../../test/clienteApiFalso';
import { useIntegracionesEtapa } from './useIntegracionesEtapa';

const respuestaVacia = { data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } };

describe('useIntegracionesEtapa', () => {
  it('no llama al backend cuando no está habilitado (paso distinto de Bluesite)', () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue(respuestaVacia);

    renderHook(() => useIntegracionesEtapa(cliente, { jobRequisitionId: 'v1', habilitado: false }));

    expect(cliente.get).not.toHaveBeenCalled();
  });

  it('no llama al backend sin vacante seleccionada', () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue(respuestaVacia);

    renderHook(() => useIntegracionesEtapa(cliente, { jobRequisitionId: null, habilitado: true }));

    expect(cliente.get).not.toHaveBeenCalled();
  });

  it('consulta las integraciones de Bluesite de la vacante cuando está habilitado', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockResolvedValue(respuestaVacia);

    const { result } = renderHook(() =>
      useIntegracionesEtapa(cliente, { jobRequisitionId: 'v1', habilitado: true }),
    );

    await waitFor(() => expect(cliente.get).toHaveBeenCalled());
    const [url, config] = cliente.get.mock.calls[0];
    expect(url).toBe('/vacantes/v1/integraciones');
    expect(config.params).toMatchObject({ proveedor: 'BLUESITE', pageSize: 100 });
    await waitFor(() => expect(result.current.datos).toEqual(respuestaVacia));
  });

  it('no expone la lista de candidatos si la petición falla: el consumidor solo lee `datos`', async () => {
    const cliente = crearClienteApiFalso();
    cliente.get.mockRejectedValue(new Error('fallo de red'));

    const { result } = renderHook(() =>
      useIntegracionesEtapa(cliente, { jobRequisitionId: 'v1', habilitado: true }),
    );

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.datos).toBeNull();
  });
});
