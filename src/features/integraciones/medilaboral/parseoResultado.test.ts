import { describe, expect, it } from 'vitest';
import { parsearResultadoMedilaboral } from './parseoResultado';

describe('parsearResultadoMedilaboral', () => {
  it('rescata idOrdenServicio, sede, cita y modalidad de un objeto válido', () => {
    const resultado = parsearResultadoMedilaboral({
      idOrdenServicio: 'OS-123',
      sede: 'Bogotá Centro',
      fechaCita: '2026-03-01T14:00:00Z',
      modalidad: 'CITA_PREVIA',
    });

    expect(resultado).toEqual({
      tipo: 'MEDILABORAL',
      idOrdenServicio: 'OS-123',
      sede: 'Bogotá Centro',
      fechaCita: '2026-03-01T14:00:00Z',
      modalidad: 'CITA_PREVIA',
      conceptoAptitud: null,
      observaciones: null,
      fechaConcepto: null,
    });
  });

  it('devuelve null si falta el id de orden y para basura, sin lanzar', () => {
    expect(parsearResultadoMedilaboral({})).toBeNull();
    expect(parsearResultadoMedilaboral(null)).toBeNull();
    expect(parsearResultadoMedilaboral('texto')).toBeNull();
  });

  it('descarta una modalidad no reconocida', () => {
    const resultado = parsearResultadoMedilaboral({ idOrdenServicio: 'OS-9', modalidad: 'X' });
    expect(resultado?.modalidad).toBeNull();
  });

  it('rescata conceptoAptitud y observaciones cuando ya llegó el concepto', () => {
    const resultado = parsearResultadoMedilaboral({
      idOrdenServicio: 'OS-71614',
      conceptoAptitud: 'APTO_CON_OBSERVACIONES',
      observaciones: 'Requiere pausas activas cada dos horas.',
      fechaConcepto: '2026-08-09T00:00:00Z',
    });

    expect(resultado?.conceptoAptitud).toBe('APTO_CON_OBSERVACIONES');
    expect(resultado?.observaciones).toBe('Requiere pausas activas cada dos horas.');
    expect(resultado?.fechaConcepto).toBe('2026-08-09T00:00:00Z');
  });

  it('conceptoAptitud, observaciones y fechaConcepto ausentes quedan en null, sin lanzar', () => {
    const resultado = parsearResultadoMedilaboral({ idOrdenServicio: 'OS-60' });
    expect(resultado?.conceptoAptitud).toBeNull();
    expect(resultado?.observaciones).toBeNull();
    expect(resultado?.fechaConcepto).toBeNull();
  });

  it('descarta un conceptoAptitud fuera del enum conocido (texto libre o número)', () => {
    const conTextoLibre = parsearResultadoMedilaboral({
      idOrdenServicio: 'OS-4',
      conceptoAptitud: 'APTO CON RESTRICCIONES',
    });
    expect(conTextoLibre?.conceptoAptitud).toBeNull();

    const conNumero = parsearResultadoMedilaboral({
      idOrdenServicio: 'OS-4',
      conceptoAptitud: 1,
    });
    expect(conNumero?.conceptoAptitud).toBeNull();
  });
});
