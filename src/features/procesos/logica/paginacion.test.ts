import { describe, expect, it } from 'vitest';
import { aPaginaServidor, aPaginaTabla } from './paginacion';

describe('paginacion', () => {
  it('convierte de base 0 (tabla) a base 1 (servidor)', () => {
    expect(aPaginaServidor(0)).toBe(1);
    expect(aPaginaServidor(4)).toBe(5);
  });

  it('convierte de base 1 (servidor) a base 0 (tabla)', () => {
    expect(aPaginaTabla(1)).toBe(0);
    expect(aPaginaTabla(5)).toBe(4);
  });

  it('es simétrica en ambos sentidos', () => {
    for (const pagina of [0, 1, 2, 10, 99]) {
      expect(aPaginaTabla(aPaginaServidor(pagina))).toBe(pagina);
    }
  });

  it('nunca produce una página de servidor menor que 1', () => {
    expect(aPaginaServidor(-3)).toBe(1);
  });
});
