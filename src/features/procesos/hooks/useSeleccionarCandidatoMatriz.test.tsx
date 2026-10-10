import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { crearClienteApiFalso, errorApi } from '../../../test/clienteApiFalso';
import {
  filaMatriz,
  matrizSeleccion,
  objecionMatriz,
  seleccionMatriz,
} from '../../../test/fixturesMatriz';
import { guardarBorrador, leerBorrador } from '../logica/borradorJustificacionMatriz';
import { estadoEnvioMatriz } from '../logica/estadoEnvioMatriz';
import { estadoCandidatoMatriz } from '../logica/candidatosMatriz';
import { interpretarErrorSeleccion } from '../logica/erroresMatriz';
import { useSeleccionarCandidatoMatriz } from './useSeleccionarCandidatoMatriz';

const datos = {
  jobApplicationId: 'APP-2',
  fortalezas: 'Alta orientación a resultados.',
};

const borrador = {
  fortalezas: 'Texto en progreso',
  oportunidadesDesarrollo: '',
  criterioDesempate: '',
  equivalenciasAplicadas: '',
  observaciones: '',
};

beforeEach(() => sessionStorage.clear());

describe('useSeleccionarCandidatoMatriz', () => {
  it('con 200 expone la matriz devuelta y elimina los borradores de la vacante', async () => {
    const cliente = crearClienteApiFalso();
    const respuesta = matrizSeleccion({
      candidatos: [filaMatriz({ jobApplicationId: 'APP-2' })],
      seleccion: seleccionMatriz({ jobApplicationId: 'APP-2' }),
    });
    cliente.post.mockResolvedValue(respuesta);
    guardarBorrador('REQ-1', 'APP-2', borrador);
    guardarBorrador('REQ-1', 'APP-3', borrador);
    guardarBorrador('REQ-2', 'APP-9', borrador);

    const { result } = renderHook(() => useSeleccionarCandidatoMatriz(cliente));

    let devuelto;
    await act(async () => {
      devuelto = await result.current.seleccionar('REQ-1', datos);
    });

    expect(devuelto).toEqual({ matriz: respuesta, error: null });
    expect(result.current.resultado).toEqual(respuesta);
    expect(result.current.error).toBeNull();
    expect(cliente.post).toHaveBeenCalledWith('/vacantes/REQ-1/matriz/seleccion', datos);
    expect(leerBorrador('REQ-1', 'APP-2')).toBeNull();
    expect(leerBorrador('REQ-1', 'APP-3')).toBeNull();
    expect(leerBorrador('REQ-2', 'APP-9')).toEqual(borrador);

    act(() => result.current.reiniciar());
    expect(result.current.resultado).toBeNull();
  });

  it('reelección tras una objeción: la matriz pasa a ENVIADA_PENDIENTE y el antes objetado sigue marcado', async () => {
    const cliente = crearClienteApiFalso();
    const objetado = filaMatriz({ jobApplicationId: 'APP-1' });
    cliente.post.mockResolvedValue(
      matrizSeleccion({
        candidatos: [objetado, filaMatriz({ jobApplicationId: 'APP-2' })],
        seleccion: seleccionMatriz({ jobApplicationId: 'APP-2' }),
        decisionLider: null,
        plazoDecisionHasta: '2026-11-14T15:00:00Z',
        objeciones: [objecionMatriz({ jobApplicationId: 'APP-1' })],
      }),
    );

    const { result } = renderHook(() => useSeleccionarCandidatoMatriz(cliente));
    await act(async () => {
      await result.current.seleccionar('REQ-1', datos);
    });

    const matriz = result.current.resultado!;
    expect(estadoEnvioMatriz(matriz)).toBe('ENVIADA_PENDIENTE');
    expect(estadoCandidatoMatriz(objetado, matriz, false)).toBe('OBJETADA');
  });

  it('con 422 de desempate expone el error asociado al campo y conserva el borrador', async () => {
    const cliente = crearClienteApiFalso();
    cliente.post.mockRejectedValue(errorApi(422, 'Falta el criterio de desempate'));
    guardarBorrador('REQ-1', 'APP-2', borrador);

    const { result } = renderHook(() => useSeleccionarCandidatoMatriz(cliente));
    await act(async () => {
      await result.current.seleccionar('REQ-1', datos);
    });

    expect(result.current.resultado).toBeNull();
    expect(interpretarErrorSeleccion(result.current.error!).campo).toBe('criterioDesempate');
    expect(leerBorrador('REQ-1', 'APP-2')).toEqual(borrador);
  });

  it.each([
    ['Calificacion incompleta', /ya no tiene la calificación completa/],
    ['La eleccion enviada al lider no fue objetada', /solo se puede volver a elegir/],
  ])(
    'con 409 "%s" expone un mensaje claro, pide recargar y conserva el borrador',
    async (title, mensaje) => {
      const cliente = crearClienteApiFalso();
      cliente.post.mockRejectedValue(errorApi(409, title));
      guardarBorrador('REQ-1', 'APP-2', borrador);

      const { result } = renderHook(() => useSeleccionarCandidatoMatriz(cliente));
      await act(async () => {
        await result.current.seleccionar('REQ-1', datos);
      });

      const interpretado = interpretarErrorSeleccion(result.current.error!);
      expect(interpretado.mensaje).toMatch(mensaje);
      expect(interpretado.recargar).toBe(true);
      expect(leerBorrador('REQ-1', 'APP-2')).toEqual(borrador);
    },
  );
});
