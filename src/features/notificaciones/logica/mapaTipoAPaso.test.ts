import { describe, expect, it } from 'vitest';
import { pasoPorTipoNotificacion } from './mapaTipoAPaso';

describe('pasoPorTipoNotificacion', () => {
  it('INFORME_SELECTA_LISTO devuelve el paso SELECTA', () => {
    expect(pasoPorTipoNotificacion('INFORME_SELECTA_LISTO')).toBe('SELECTA');
  });

  it('INFORME_ANONIMIZACION_LISTO devuelve el paso ANONIMIZACION', () => {
    expect(pasoPorTipoNotificacion('INFORME_ANONIMIZACION_LISTO')).toBe('ANONIMIZACION');
  });

  it('MATRIZ_REVISADA_POR_EL_LIDER devuelve el paso MATRIZ_SELECCION', () => {
    expect(pasoPorTipoNotificacion('MATRIZ_REVISADA_POR_EL_LIDER')).toBe('MATRIZ_SELECCION');
  });

  it('MATRIZ_ENVIADA_AL_LIDER devuelve null', () => {
    expect(pasoPorTipoNotificacion('MATRIZ_ENVIADA_AL_LIDER')).toBeNull();
  });
});
