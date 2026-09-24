import { describe, expect, it } from 'vitest';
import { formatearFechaHora, SIN_FECHA } from './formatoFecha';

describe('formatearFechaHora', () => {
  it('devuelve "Sin definir" para entradas nulas, vacías o no válidas', () => {
    expect(formatearFechaHora(null)).toBe(SIN_FECHA);
    expect(formatearFechaHora(undefined)).toBe(SIN_FECHA);
    expect(formatearFechaHora('')).toBe(SIN_FECHA);
    expect(formatearFechaHora('no-es-fecha')).toBe(SIN_FECHA);
  });

  it('incluye fecha y hora separadas por un punto medio', () => {
    const texto = formatearFechaHora('2026-06-28T09:15:00Z');
    expect(texto).toMatch(/2026/);
    expect(texto).toContain('·');
    expect(texto).toMatch(/\d{2}:\d{2}/);
  });
});
