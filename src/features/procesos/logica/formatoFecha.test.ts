import { describe, expect, it } from 'vitest';
import { formatearFecha, formatearFechaHora, SIN_FECHA } from './formatoFecha';

describe('formatearFecha', () => {
  it('devuelve "Sin definir" para null, undefined o cadena vacía', () => {
    expect(formatearFecha(null)).toBe(SIN_FECHA);
    expect(formatearFecha(undefined)).toBe(SIN_FECHA);
    expect(formatearFecha('')).toBe(SIN_FECHA);
  });

  it('devuelve "Sin definir" para una cadena que no es fecha', () => {
    expect(formatearFecha('no-es-fecha')).toBe(SIN_FECHA);
  });

  it('formatea una fecha ISO válida en español', () => {
    const texto = formatearFecha('2026-03-15T00:00:00.000Z');
    expect(texto).not.toBe(SIN_FECHA);
    expect(texto).toMatch(/2026/);
  });
});

describe('formatearFechaHora', () => {
  it('devuelve "Sin definir" para entradas nulas, vacías o no válidas', () => {
    expect(formatearFechaHora(null)).toBe(SIN_FECHA);
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
