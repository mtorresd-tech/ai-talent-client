import { describe, expect, it } from 'vitest';
import type { EstadoCatalogo } from '../api/catalogos';
import { describirEstadoBluesite } from './seguimientoBluesite';

describe('describirEstadoBluesite', () => {
  it('describe el inicio de las pruebas psicotécnicas', () => {
    const { titulo, descripcion } = describirEstadoBluesite('EN_PRUEBAS_BLUESITE');
    expect(titulo).toBe('En pruebas psicotécnicas');
    expect(descripcion).toMatch(/resolviendo las pruebas psicotécnicas con Bluesite/i);
  });

  it('describe el resultado pendiente de revisión', () => {
    const { titulo, descripcion } = describirEstadoBluesite('RESULTADO_PRUEBAS_BLUESITE');
    expect(titulo).toBe('Con resultado, pendiente de revisión');
    expect(descripcion).toMatch(/Bluesite entregó el resultado/i);
  });

  it('describe la aprobación de las pruebas', () => {
    const { titulo, descripcion } = describirEstadoBluesite('APROBO_PRUEBAS_BLUESITE');
    expect(titulo).toBe('Aprobó las pruebas');
    expect(descripcion).toMatch(/aprobó las pruebas psicotécnicas/i);
  });

  it('describe el descarte en las pruebas', () => {
    const { titulo, descripcion } = describirEstadoBluesite('DESCARTADO_PRUEBAS_BLUESITE');
    expect(titulo).toBe('Descartado en pruebas psicotécnicas');
    expect(descripcion).toMatch(/fue descartado en las pruebas psicotécnicas/i);
  });

  it('para un estado fuera de la lista cae al catálogo cuando lo tiene', () => {
    const catalogo = [
      {
        clave: 'ERROR_INTEGRACION',
        etiqueta: 'Error de integración',
        descripcion: 'La integración con el proveedor falló.',
        categoria: 'EXCEPCION',
        terminal: false,
        compuertaPendiente: null,
        compuertaEtiqueta: null,
        transicionesPermitidas: [],
      },
    ] as unknown as EstadoCatalogo[];

    const { titulo, descripcion } = describirEstadoBluesite('ERROR_INTEGRACION', catalogo);
    expect(titulo).toBe('Error de integración');
    expect(descripcion).toBe('La integración con el proveedor falló.');
  });

  it('sin catálogo, un estado desconocido cae a Title Case y descripción vacía', () => {
    const { titulo, descripcion } = describirEstadoBluesite('ERROR_INTEGRACION');
    expect(titulo).toBe('Error Integracion');
    expect(descripcion).toBe('');
  });
});
