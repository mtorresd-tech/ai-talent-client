import { describe, expect, it } from 'vitest';
import { formatearFecha, SIN_FECHA } from './formatoFecha';

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
