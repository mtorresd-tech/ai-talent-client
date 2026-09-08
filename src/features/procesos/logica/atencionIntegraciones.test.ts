import { describe, expect, it } from 'vitest';
import type { Proveedor } from '../../../shared/tipos/dominio';
import type { SeguimientoIntegracion } from '../../integraciones';
import { mapaAtencionProveedor } from './atencionIntegraciones';

function integracion(
  jobApplicationId: string,
  requiereAtencion: boolean,
  diasTranscurridos = 3,
  proveedor: Proveedor = 'BLUESITE',
): SeguimientoIntegracion {
  return {
    jobApplicationId,
    alias: `Candidato ${jobApplicationId}`,
    nombre: null,
    integraciones: [
      {
        proveedor,
        subestado: 'EN_CURSO',
        idExterno: null,
        fechaSolicitud: null,
        fechaResultado: null,
        fechaExpiracion: null,
        intentos: 0,
        resultado: null,
        diasTranscurridos,
        requiereAtencion,
      },
    ],
  };
}

describe.each<Proveedor>(['BLUESITE', 'COSINTE'])('mapaAtencionProveedor · %s', (proveedor) => {
  it('arma el mapa con los candidatos que requieren o no atención', () => {
    const mapa = mapaAtencionProveedor(
      [
        integracion('APP-1', true, 12, proveedor),
        integracion('APP-2', false, 1, proveedor),
      ],
      proveedor,
    );

    expect(mapa.get('APP-1')).toEqual({ requiereAtencion: true, diasTranscurridos: 12 });
    expect(mapa.get('APP-2')).toEqual({ requiereAtencion: false, diasTranscurridos: 1 });
    expect(mapa.size).toBe(2);
  });

  it('no genera entrada para un candidato sin integración de este proveedor en su arreglo', () => {
    const otroProveedor: Proveedor = proveedor === 'BLUESITE' ? 'COSINTE' : 'BLUESITE';
    const mapa = mapaAtencionProveedor([integracion('APP-3', true, 5, otroProveedor)], proveedor);
    expect(mapa.has('APP-3')).toBe(false);
    expect(mapa.size).toBe(0);
  });

  it('con integraciones null devuelve un mapa vacío sin lanzar', () => {
    const mapa = mapaAtencionProveedor(null, proveedor);
    expect(mapa.size).toBe(0);
  });
});
