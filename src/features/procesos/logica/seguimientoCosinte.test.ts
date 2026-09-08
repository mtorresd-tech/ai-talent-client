import { describe, expect, it } from 'vitest';
import type { EstadoCatalogo } from '../api/catalogos';
import { describirEstadoCosinte } from './seguimientoCosinte';

describe('describirEstadoCosinte', () => {
  it('describe el inicio del estudio de seguridad', () => {
    const { titulo, descripcion } = describirEstadoCosinte('EN_PRUEBAS_COSINTE');
    expect(titulo).toBe('En estudio de seguridad');
    expect(descripcion).toMatch(/estudio de seguridad en curso con Cosinte/i);
  });

  it('describe el resultado pendiente de revisión', () => {
    const { titulo, descripcion } = describirEstadoCosinte('RESULTADO_PRUEBAS_COSINTE');
    expect(titulo).toBe('Con resultado, pendiente de revisión');
    expect(descripcion).toMatch(/Cosinte entregó el nivel de riesgo/i);
  });

  it('describe la aprobación del estudio de seguridad', () => {
    const { titulo, descripcion } = describirEstadoCosinte('APROBO_PRUEBAS_COSINTE');
    expect(titulo).toBe('Aprobó el estudio de seguridad');
    expect(descripcion).toMatch(/Nivel de riesgo aceptable/i);
  });

  it('describe el descarte en el estudio de seguridad', () => {
    const { titulo, descripcion } = describirEstadoCosinte('DESCARTADO_PRUEBAS_COSINTE');
    expect(titulo).toBe('Descartado en estudio de seguridad');
    expect(descripcion).toMatch(/nivel de riesgo no fue aceptable/i);
  });

  it('describe el bloqueo por la regla de 6 meses, mencionando la decisión del reclutador', () => {
    const { titulo, descripcion } = describirEstadoCosinte('BLOQUEADO_COSINTE_6M');
    expect(titulo).toBe('Bloqueado por la regla de 6 meses');
    expect(descripcion).toMatch(/requiere decisión del reclutador/i);
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

    const { titulo, descripcion } = describirEstadoCosinte('ERROR_INTEGRACION', catalogo);
    expect(titulo).toBe('Error de integración');
    expect(descripcion).toBe('La integración con el proveedor falló.');
  });

  it('sin catálogo, un estado desconocido cae a Title Case y descripción vacía', () => {
    const { titulo, descripcion } = describirEstadoCosinte('ERROR_INTEGRACION');
    expect(titulo).toBe('Error Integracion');
    expect(descripcion).toBe('');
  });
});
