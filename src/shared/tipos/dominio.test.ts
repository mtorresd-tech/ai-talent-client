import { describe, expect, it } from 'vitest';
import { ROL_LIDER, ROL_RECLUTADOR, etiquetaRolUsuario } from './dominio';

describe('etiquetaRolUsuario', () => {
  it('mapea RECLUTADOR a "Reclutador"', () => {
    expect(etiquetaRolUsuario([ROL_RECLUTADOR])).toBe('Reclutador');
  });

  it('mapea LIDER_VACANTE a "Líder de área"', () => {
    expect(etiquetaRolUsuario([ROL_LIDER])).toBe('Líder de área');
  });

  it('devuelve undefined con una lista vacía', () => {
    expect(etiquetaRolUsuario([])).toBeUndefined();
  });

  it('devuelve undefined con undefined', () => {
    expect(etiquetaRolUsuario(undefined)).toBeUndefined();
  });
});
