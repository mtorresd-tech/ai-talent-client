import { describe, expect, it } from 'vitest';
import {
  estadoRegistroVacante,
  etiquetaEstadoVacante,
  resumenEtapaVacante,
} from './resumenEtapaVacante';

describe('estadoRegistroVacante', () => {
  it('devuelve "success" para una vacante en proceso', () => {
    expect(estadoRegistroVacante(false)).toBe('success');
  });

  it('devuelve "neutral" para una vacante cerrada', () => {
    expect(estadoRegistroVacante(true)).toBe('neutral');
  });
});

describe('etiquetaEstadoVacante', () => {
  it('devuelve "En proceso" para una vacante abierta', () => {
    expect(etiquetaEstadoVacante(false)).toBe('En proceso');
  });

  it('devuelve "Cerrada" para una vacante cerrada', () => {
    expect(etiquetaEstadoVacante(true)).toBe('Cerrada');
  });
});

describe('resumenEtapaVacante', () => {
  it('devuelve "—" sin conteo por estado', () => {
    expect(resumenEtapaVacante(null)).toBe('—');
    expect(resumenEtapaVacante(undefined)).toBe('—');
  });

  it('devuelve "—" cuando todos los conteos son cero', () => {
    expect(resumenEtapaVacante({ RANKING_SELECTA: 0 })).toBe('—');
  });

  it('toma los dos estados con mayor conteo, ordenados de mayor a menor', () => {
    expect(
      resumenEtapaVacante({
        RANKING_SELECTA: 12,
        PREFILTRO_PENDIENTE: 3,
        EXTRACCION_OCR: 1,
      }),
    ).toBe('En ranking (12) · Prefiltro pendiente (3)');
  });
});
