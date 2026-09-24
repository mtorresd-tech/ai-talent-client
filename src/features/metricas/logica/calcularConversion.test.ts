import { describe, expect, it } from 'vitest';
import { calcularConversion } from './calcularConversion';

describe('calcularConversion', () => {
  it('devuelve el porcentaje formateado con un decimal', () => {
    expect(calcularConversion(80, 120)).toBe('66.7%');
  });

  it('devuelve "—" cuando el divisor es 0, nunca Infinity/NaN', () => {
    expect(calcularConversion(80, 0)).toBe('—');
  });
});
