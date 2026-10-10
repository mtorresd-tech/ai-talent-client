import { describe, expect, it } from 'vitest';
import { formatearPeso, formatearPuntaje } from './formatoMatriz';

describe('formatoMatriz', () => {
  it('formatearPeso convierte la fracción en porcentaje', () => {
    expect(formatearPeso(0.3)).toBe('30%');
    expect(formatearPeso(0)).toBe('0%');
    expect(formatearPeso(0.125)).toBe('12,5%');
  });

  it('formatearPuntaje usa coma decimal y hasta un decimal', () => {
    expect(formatearPuntaje(82.4)).toBe('82,4');
    expect(formatearPuntaje(90)).toBe('90');
    expect(formatearPuntaje(24.66)).toBe('24,7');
  });

  it('formatearPuntaje deja vacío un valor ausente', () => {
    expect(formatearPuntaje(null)).toBe('');
    expect(formatearPuntaje(undefined)).toBe('');
  });
});
