import { describe, expect, it } from 'vitest';
import { descripcionMatch } from './descripcionMatch';

describe('descripcionMatch', () => {
  it('devuelve el texto de afinidad muy alta a partir de 95', () => {
    expect(descripcionMatch(96)).toMatch(/muy alta/i);
    expect(descripcionMatch(95)).toMatch(/muy alta/i);
  });

  it('devuelve el texto de afinidad alta entre 90 y 95', () => {
    expect(descripcionMatch(92)).toMatch(/alta:/i);
    expect(descripcionMatch(90)).toMatch(/alta:/i);
    expect(descripcionMatch(90)).not.toMatch(/muy alta/i);
  });

  it('devuelve el texto de afinidad aceptable entre 85 y 90', () => {
    expect(descripcionMatch(87)).toMatch(/aceptable/i);
    expect(descripcionMatch(85)).toMatch(/aceptable/i);
  });

  it('devuelve el texto de afinidad baja por debajo de 85', () => {
    expect(descripcionMatch(60)).toMatch(/baja/i);
    expect(descripcionMatch(84)).toMatch(/baja/i);
  });

  it('sin dato devuelve un texto de "sin porcentaje calculado"', () => {
    expect(descripcionMatch(null)).toMatch(/todavía no tiene un porcentaje/i);
  });
});
