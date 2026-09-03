import { describe, expect, it } from 'vitest';
import { parsearResultadoCosinte } from './parseoResultado';

describe('parsearResultadoCosinte', () => {
  it('parsea un objeto válido al shape tipado', () => {
    const resultado = parsearResultadoCosinte({
      tipo: 'COSINTE',
      estado: 'En proceso',
      nivelRiesgo: 'Bajo',
      fechaSolicitud: '2026-02-01T00:00:00Z',
      tiempos: { diasHabiles: 10, diasRestantes: 4, progreso: 0.6 },
    });

    expect(resultado).toEqual({
      tipo: 'COSINTE',
      estado: 'En proceso',
      nivelRiesgo: 'Bajo',
      fechaSolicitud: '2026-02-01T00:00:00Z',
      tiempos: { diasHabiles: 10, diasRestantes: 4, progreso: 0.6 },
    });
  });

  it('normaliza campos inválidos sin lanzar', () => {
    const resultado = parsearResultadoCosinte({
      estado: 'Finalizado',
      nivelRiesgo: 'X',
      tiempos: 5,
    });
    expect(resultado?.estado).toBe('Finalizado');
    expect(resultado?.nivelRiesgo).toBeNull();
    expect(resultado?.tiempos).toBeNull();
  });

  it('devuelve null para basura y para null', () => {
    expect(parsearResultadoCosinte(null)).toBeNull();
    expect(parsearResultadoCosinte('texto')).toBeNull();
    expect(parsearResultadoCosinte({ estado: 'Otro' })).toBeNull();
  });
});
