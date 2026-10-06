import { describe, expect, it } from 'vitest';
import { pasoPorTipoNotificacion } from './mapaTipoAPaso';

describe('pasoPorTipoNotificacion', () => {
  it('INFORME_SELECTA_LISTO devuelve el paso SELECTA', () => {
    expect(pasoPorTipoNotificacion('INFORME_SELECTA_LISTO')).toBe('SELECTA');
  });

  it('INFORME_ANONIMIZACION_LISTO devuelve el paso ANONIMIZACION', () => {
    expect(pasoPorTipoNotificacion('INFORME_ANONIMIZACION_LISTO')).toBe('ANONIMIZACION');
  });

  it('MATRIZ_ENVIADA_AL_LIDER y MATRIZ_REVISADA_POR_EL_LIDER devuelven null', () => {
    expect(pasoPorTipoNotificacion('MATRIZ_ENVIADA_AL_LIDER')).toBeNull();
    expect(pasoPorTipoNotificacion('MATRIZ_REVISADA_POR_EL_LIDER')).toBeNull();
  });
});
