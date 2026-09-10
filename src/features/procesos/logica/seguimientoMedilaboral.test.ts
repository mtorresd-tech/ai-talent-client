import { describe, expect, it } from 'vitest';
import type { EstadoCatalogo } from '../api/catalogos';
import { describirEstadoMedilaboral } from './seguimientoMedilaboral';

describe('describirEstadoMedilaboral', () => {
  it('describe el inicio de los exámenes médicos', () => {
    const { titulo, descripcion } = describirEstadoMedilaboral('EN_PRUEBAS_MEDILABORAL');
    expect(titulo).toBe('En exámenes médicos');
    expect(descripcion).toMatch(/exámenes médicos ocupacionales en curso con Medilaboral/i);
  });

  it('describe el resultado pendiente de revisión nombrando la zona gris', () => {
    const { titulo, descripcion } = describirEstadoMedilaboral('RESULTADO_PRUEBAS_MEDILABORAL');
    expect(titulo).toBe('Con resultado, pendiente de revisión (zona gris)');
    expect(descripcion).toMatch(/no aprueba ni descarta por sí solo/i);
  });

  it('describe la aprobación de los exámenes médicos', () => {
    const { titulo, descripcion } = describirEstadoMedilaboral('APROBO_PRUEBAS_MEDILABORAL');
    expect(titulo).toBe('Aprobó los exámenes médicos');
    expect(descripcion).toMatch(/Concepto de aptitud aceptable/i);
  });

  it('describe el descarte en los exámenes médicos', () => {
    const { titulo, descripcion } = describirEstadoMedilaboral('DESCARTADO_PRUEBAS_MEDILABORAL');
    expect(titulo).toBe('Descartado en exámenes médicos');
    expect(descripcion).toMatch(/concepto de aptitud no fue aceptable/i);
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

    const { titulo, descripcion } = describirEstadoMedilaboral('ERROR_INTEGRACION', catalogo);
    expect(titulo).toBe('Error de integración');
    expect(descripcion).toBe('La integración con el proveedor falló.');
  });

  it('sin catálogo, un estado desconocido cae a Title Case y descripción vacía', () => {
    const { titulo, descripcion } = describirEstadoMedilaboral('ERROR_INTEGRACION');
    expect(titulo).toBe('Error Integracion');
    expect(descripcion).toBe('');
  });
});
