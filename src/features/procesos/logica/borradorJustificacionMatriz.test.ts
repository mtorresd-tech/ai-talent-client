import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  claveBorrador,
  eliminarBorrador,
  eliminarBorradoresDeVacante,
  guardarBorrador,
  leerBorrador,
  limpiarBorradoresJustificacionMatriz,
  type BorradorJustificacionMatriz,
} from './borradorJustificacionMatriz';

const borrador: BorradorJustificacionMatriz = {
  fortalezas: 'Liderazgo',
  oportunidadesDesarrollo: '',
  criterioDesempate: '',
  equivalenciasAplicadas: '',
  observaciones: 'Ninguna',
};

beforeEach(() => sessionStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('borradorJustificacionMatriz', () => {
  it('guarda, lee y elimina con la clave por vacante y candidato', () => {
    guardarBorrador('REQ-1', 'APP-1', borrador);

    expect(sessionStorage.getItem('selecta:borrador-justificacion-matriz:REQ-1:APP-1')).not.toBe(
      null,
    );
    expect(leerBorrador('REQ-1', 'APP-1')).toEqual(borrador);

    eliminarBorrador('REQ-1', 'APP-1');
    expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
  });

  it('guardar un borrador vacío lo elimina', () => {
    guardarBorrador('REQ-1', 'APP-1', borrador);
    guardarBorrador('REQ-1', 'APP-1', { ...borrador, fortalezas: '  ', observaciones: '' });
    expect(sessionStorage.getItem(claveBorrador('REQ-1', 'APP-1'))).toBeNull();
  });

  it('con JSON corrupto devuelve null y elimina la clave', () => {
    sessionStorage.setItem(claveBorrador('REQ-1', 'APP-1'), '{no es json');
    expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
    expect(sessionStorage.getItem(claveBorrador('REQ-1', 'APP-1'))).toBeNull();
  });

  it('con forma inválida devuelve null y elimina la clave', () => {
    sessionStorage.setItem(claveBorrador('REQ-1', 'APP-1'), JSON.stringify({ fortalezas: 3 }));
    expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
    expect(sessionStorage.getItem(claveBorrador('REQ-1', 'APP-1'))).toBeNull();
  });

  it('si sessionStorage lanza, ninguna función lanza y la lectura devuelve null', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('no disponible');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cuota llena');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('no disponible');
    });
    vi.spyOn(Storage.prototype, 'key').mockImplementation(() => {
      throw new Error('no disponible');
    });

    expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
    expect(() => guardarBorrador('REQ-1', 'APP-1', borrador)).not.toThrow();
    expect(() => eliminarBorrador('REQ-1', 'APP-1')).not.toThrow();
    expect(() => eliminarBorradoresDeVacante('REQ-1')).not.toThrow();
    expect(() => limpiarBorradoresJustificacionMatriz()).not.toThrow();
  });

  it('eliminarBorradoresDeVacante solo elimina los de esa vacante', () => {
    guardarBorrador('REQ-1', 'APP-1', borrador);
    guardarBorrador('REQ-1', 'APP-2', borrador);
    guardarBorrador('REQ-2', 'APP-5', borrador);

    eliminarBorradoresDeVacante('REQ-1');

    expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
    expect(leerBorrador('REQ-1', 'APP-2')).toBeNull();
    expect(leerBorrador('REQ-2', 'APP-5')).toEqual(borrador);
  });

  it('limpiarBorradoresJustificacionMatriz elimina solo las claves con el prefijo', () => {
    guardarBorrador('REQ-1', 'APP-1', borrador);
    guardarBorrador('REQ-2', 'APP-5', borrador);
    sessionStorage.setItem('selecta:ruta-destino-login', '/procesos');

    limpiarBorradoresJustificacionMatriz();

    expect(leerBorrador('REQ-1', 'APP-1')).toBeNull();
    expect(leerBorrador('REQ-2', 'APP-5')).toBeNull();
    expect(sessionStorage.getItem('selecta:ruta-destino-login')).toBe('/procesos');
  });
});
