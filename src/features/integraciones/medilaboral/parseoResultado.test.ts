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
});
