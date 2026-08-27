import { describe, expect, it } from 'vitest';
import { calcularIniciales, esSeleccionablePrefiltro, nombreCandidato } from './candidato';

describe('calcularIniciales', () => {
  it('toma la primera y la última palabra', () => {
    expect(calcularIniciales('Ana María Pérez')).toBe('AP');
  });

  it('con una sola palabra usa las dos primeras letras', () => {
    expect(calcularIniciales('Ana')).toBe('AN');
  });

  it('sin nombre devuelve "?"', () => {
    expect(calcularIniciales('   ')).toBe('?');
  });
});

describe('nombreCandidato', () => {
  it('prefiere el nombre real y cae al alias si es null', () => {
    expect(nombreCandidato({ nombre: 'Ana Pérez', alias: 'Candidato 3' })).toBe('Ana Pérez');
    expect(nombreCandidato({ nombre: null, alias: 'Candidato 3' })).toBe('Candidato 3');
  });
});

describe('esSeleccionablePrefiltro', () => {
  it('solo es seleccionable con la compuerta RANKING pendiente', () => {
    expect(
      esSeleccionablePrefiltro({ esperandoDecision: true, compuertaPendiente: 'RANKING' }),
    ).toBe(true);
    expect(esSeleccionablePrefiltro({ esperandoDecision: true, compuertaPendiente: 'LIDER' })).toBe(
      false,
    );
    expect(
      esSeleccionablePrefiltro({ esperandoDecision: false, compuertaPendiente: 'RANKING' }),
    ).toBe(false);
  });
});
