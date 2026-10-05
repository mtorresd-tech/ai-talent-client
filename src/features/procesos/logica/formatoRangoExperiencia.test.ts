import { describe, expect, it } from 'vitest';
import { formatearRangoExperiencia } from './formatoRangoExperiencia';

describe('formatearRangoExperiencia', () => {
  it('con fechaFin nula muestra "Actualidad" (cargo actual)', () => {
    const texto = formatearRangoExperiencia('2022-01-01', null);
    expect(texto).toMatch(/2022/);
    expect(texto).toContain('·');
    expect(texto).toContain('Actualidad');
  });

  it('con fechaInicio y fechaFin pobladas formatea ambos extremos del rango', () => {
    const texto = formatearRangoExperiencia('2020-03-01', '2022-06-30');
    expect(texto).toMatch(/2020/);
    expect(texto).toMatch(/2022/);
    expect(texto).not.toContain('Actualidad');
  });

  it('con fechaInicio nula usa el texto "Sin definir" para ese extremo', () => {
    const texto = formatearRangoExperiencia(null, '2022-06-30');
    expect(texto).toContain('Sin definir');
    expect(texto).toMatch(/2022/);
  });
});
